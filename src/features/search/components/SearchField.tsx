import type { ReactNode } from 'react'

interface SearchFieldProps {
  label: string
  labelId: string
  children: ReactNode
}

const SearchField = ({ label, labelId, children }: SearchFieldProps) => {
  return (
    <div className="grid gap-1.5">
      <span id={labelId} className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  )
}

export default SearchField
