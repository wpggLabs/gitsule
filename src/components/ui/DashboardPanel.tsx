import type { ReactNode } from "react"

type Props = {
  actionLabel?: string
  children: ReactNode
  onAction?: () => void
  title: string
}

export function DashboardPanel({ actionLabel, children, onAction, title }: Props) {
  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
        {actionLabel && (
          <button className="text-xs text-github hover:text-sky-300" onClick={onAction} type="button">
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </section>
  )
}
