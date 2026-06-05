import type { Repository } from "../../types/repository"
import { StatusBadge } from "../status/StatusBadge"

type Props = {
  compact?: boolean
  meta: string
  onOpen: () => void
  repository: Repository
  signal: string
}

export function DiscoveryRow({ compact = false, meta, onOpen, repository, signal }: Props) {
  return (
    <button
      className={`w-full rounded-md border border-zinc-800 bg-[#0b0e14] text-left transition hover:border-github/50 hover:bg-zinc-900/70 ${
        compact ? "p-3" : "p-4"
      }`}
      onClick={onOpen}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-100">{repository.fullName}</div>
          {!compact && <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">{repository.description}</p>}
        </div>
        <StatusBadge status={repository.status} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
        <span>{meta}</span>
        <span className="text-zinc-400">{signal}</span>
      </div>
    </button>
  )
}
