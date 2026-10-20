-- Moderar proyectos como los anuncios: cualquiera reporta un proyecto publicado desde su ficha, los reportes
-- llegan a la misma lista del panel, y el equipo oculta un proyecto o lo devuelve al catálogo.
--
-- Necesita antes: 20261011000100_moderacion.sql y 20261017000000_proyectos_de_inmobiliarias.sql.
-- Se aplica con `supabase db push` o en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez deja exactamente lo mismo. No cambia ningún reporte ni proyecto.

do $$
begin
  if to_regclass('public.property_reports') is null then
    raise exception 'Falta aplicar antes la migración 20261011000100_moderacion.sql';
  end if;
  if to_regprocedure('public.prepare_project()') is null then
    raise exception 'Falta aplicar antes la migración 20261017000000_proyectos_de_inmobiliarias.sql';
  end if;
end;
$$;

-- Un reporte es de un anuncio o de un proyecto, nunca de los dos.
alter table public.property_reports
  add column if not exists project_id uuid references public.projects (id) on delete cascade;
alter table public.property_reports alter column property_id drop not null;
alter table public.property_reports drop constraint if exists property_reports_one_subject;
alter table public.property_reports
  add constraint property_reports_one_subject check (num_nonnulls(property_id, project_id) = 1);
create index if not exists property_reports_project_idx on public.property_reports (project_id);

-- El registro de moderación también anota el proyecto sobre el que se decidió.
alter table public.moderation_log add column if not exists project_id uuid;

-- Reportar un proyecto publicado. Las mismas reglas que `report_property`: idempotente por la clave del
-- envío, una cuenta envía como mucho 10 reportes por hora (de anuncios o proyectos) y un mismo proyecto
-- recibe como mucho 30 por hora; después se pide esperar (RZ004).
create or replace function public.report_project(
  target_project uuid,
  report_reason text,
  report_details text,
  report_key text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  reporter uuid := (select auth.uid());
  cleaned text := btrim(coalesce(report_details, ''));
begin
  if exists (select 1 from public.property_reports where operation_key = report_key) then
    return;
  end if;

  if report_key !~ '^[A-Za-z0-9_-]{1,64}$'
    or report_reason not in ('misleading', 'fraud', 'outdated', 'inappropriate', 'other')
    or char_length(cleaned) > 500
    or (report_reason = 'other' and cleaned = '') then
    raise exception 'invalid_report' using errcode = 'RZ002';
  end if;

  if not exists (select 1 from public.projects where id = target_project and status = 'published') then
    raise exception 'project_not_found' using errcode = 'RZ003';
  end if;

  if (
    reporter is not null and (
      select count(*) from public.property_reports
      where reporter_id = reporter and created_at > now() - interval '1 hour'
    ) >= 10
  ) or (
    select count(*) from public.property_reports
    where project_id = target_project and created_at > now() - interval '1 hour'
  ) >= 30 then
    raise exception 'too_many_reports' using errcode = 'RZ004';
  end if;

  insert into public.property_reports (project_id, reporter_id, operation_key, reason, details)
  values (target_project, reporter, report_key, report_reason, cleaned)
  on conflict (operation_key) do nothing;
end;
$$;

revoke execute on function public.report_project(uuid, text, text, text) from public;
grant execute on function public.report_project(uuid, text, text, text) to anon, authenticated;

-- Revisar un reporte, de un anuncio o de un proyecto. `hide_property` oculta lo reportado y da por
-- resueltos todos sus reportes pendientes; `resolve` lo da por resuelto sin tocarlo; `dismiss` lo descarta.
create or replace function public.admin_review_report(target_report uuid, decision text, review_note text default '')
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  reported_property uuid;
  reported_project uuid;
  reviewer uuid := (select auth.uid());
begin
  perform public.require_admin();

  select property_id, project_id into reported_property, reported_project
  from public.property_reports where id = target_report;
  if reported_property is null and reported_project is null then
    raise exception 'report_not_found' using errcode = 'RZ003';
  end if;

  if decision = 'hide_property' then
    if reported_property is not null then
      update public.properties set status = 'hidden' where id = reported_property;
    else
      update public.projects set status = 'hidden' where id = reported_project;
    end if;

    update public.property_reports
    set status = 'resolved', reviewed_at = now(), reviewed_by = reviewer
    where (status = 'open' or id = target_report)
      and (property_id = reported_property or project_id = reported_project);
  elsif decision in ('resolve', 'dismiss') then
    update public.property_reports
    set
      status = case decision when 'resolve' then 'resolved' else 'dismissed' end,
      reviewed_at = now(),
      reviewed_by = reviewer
    where id = target_report;
  else
    raise exception 'invalid_decision' using errcode = 'RZ002';
  end if;

  insert into public.moderation_log (actor_id, action, property_id, project_id, report_id, note)
  values (
    reviewer,
    'report_' || decision,
    reported_property,
    reported_project,
    target_report,
    left(btrim(coalesce(review_note, '')), 500)
  );
end;
$$;

-- Ocultar un proyecto, o devolver al catálogo uno que ocultó el equipo. Lo que la inmobiliaria dejó en
-- borrador no lo publica el equipo: es decisión de quien lo publicó.
create or replace function public.admin_set_project_status(target_project uuid, new_status text, review_note text default '')
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_status text;
begin
  perform public.require_admin();

  select status into current_status from public.projects where id = target_project;
  if current_status is null then
    raise exception 'project_not_found' using errcode = 'RZ003';
  end if;

  if new_status not in ('published', 'hidden') or (new_status = 'published' and current_status <> 'hidden') then
    raise exception 'invalid_status' using errcode = 'RZ002';
  end if;

  update public.projects set status = new_status where id = target_project;

  insert into public.moderation_log (actor_id, action, project_id, note)
  values (
    (select auth.uid()),
    case new_status when 'hidden' then 'hide_project' else 'restore_project' end,
    target_project,
    left(btrim(coalesce(review_note, '')), 500)
  );
end;
$$;

revoke execute on function public.admin_set_project_status(uuid, text, text) from public, anon;
grant execute on function public.admin_set_project_status(uuid, text, text) to authenticated;
