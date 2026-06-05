import type { RepositoryStatus } from "../../types/status"
import { statusLabels } from "../../types/status"

const statusStyles: Record<RepositoryStatus, string> = {
  want_to_try: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  testing: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  installed: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  favorite: "border-pink-400/30 bg-pink-400/10 text-pink-100",
  abandoned: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300"
}

type Props = {
  status: RepositoryStatus
}

export function StatusBadge({ status }: Props) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  )
}
