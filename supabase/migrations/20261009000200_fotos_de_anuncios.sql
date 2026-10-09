-- Fotos de los anuncios: el depósito donde se guardan y quién puede gestionarlas.
--
-- No necesita las otras migraciones: usa solo lo que Supabase ya trae.
-- Se aplica en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez deja exactamente lo mismo. No toca ninguna foto guardada. El depósito
-- y sus permisos quedan siempre como dice este archivo.

-- Depósito público: las fotos se ven sin iniciar sesión, igual que el catálogo.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('property-photos', 'property-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Cada cuenta guarda sus fotos en una carpeta con su identificador, y solo ella las gestiona.
drop policy if exists "Fotos de anuncios: cada cuenta ve las suyas" on storage.objects;
create policy "Fotos de anuncios: cada cuenta ve las suyas" on storage.objects
  for select to authenticated
  using (bucket_id = 'property-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Fotos de anuncios: cada cuenta sube las suyas" on storage.objects;
create policy "Fotos de anuncios: cada cuenta sube las suyas" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'property-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Fotos de anuncios: cada cuenta reemplaza las suyas" on storage.objects;
create policy "Fotos de anuncios: cada cuenta reemplaza las suyas" on storage.objects
  for update to authenticated
  using (bucket_id = 'property-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'property-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Fotos de anuncios: cada cuenta borra las suyas" on storage.objects;
create policy "Fotos de anuncios: cada cuenta borra las suyas" on storage.objects
  for delete to authenticated
  using (bucket_id = 'property-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
