import type { Repository } from "../../types/repository"
import { formatShortDate } from "../../utils/dates"
import { StatusBadge } from "../status/StatusBadge"

type Props = {
  repository: Repository
  selected: boolean
  onSelect: () => void
}

export function RepoCard({ repository, selected, onSelect }: Props) {
  return (
    <button
      className={`w-full rounded-md border p-4 text-left transition ${
        selected
          ? "border-github/70 bg-github/10 shadow-[0_0_0_1px_rgba(47,129,247,0.35)]"
          : "border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-900/70"
      }`}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-semibold text-zinc-100">{repository.fullName}</div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">{repository.description}</p>
        </div>
        <StatusBadge status={repository.status} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
        <span>{repository.language || "Unknown"}</span>
        <span>{(Number(repository.stars) || 0).toLocaleString()} stars</span>
        <span>{(Number(repository.forks) || 0).toLocaleString()} forks</span>
        <span>Updated {formatShortDate(repository.lastUpdated)}</span>
      </div>
    </button>
  )
}
