import { EmptyState } from "../../components/ui/EmptyState"
import { PageHeader } from "../../components/ui/PageHeader"
import { RepoCard } from "../../components/repo/RepoCard"
import type { StatusFilter } from "../../data/repositories/repositoryStore"
import type { Repository } from "../../types/repository"
import { repositoryStatuses, statusLabels } from "../../types/status"

type Props = {
  filteredRepositories: Repository[]
  onOpenRepository: (repository: Repository) => void
  query: string
  selectedRepoId: number
  setQuery: (query: string) => void
  setStatusFilter: (status: StatusFilter) => void
  statusFilter: StatusFilter
}

export function LibraryView({
  filteredRepositories,
  onOpenRepository,
  query,
  selectedRepoId,
  setQuery,
  setStatusFilter,
  statusFilter
}: Props) {
  return (
    <section>
      <PageHeader kicker="Library" title="Search and filter saved repositories." />
      <div className="mb-4 flex gap-3">
        <input
          className="h-11 flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-4 text-sm text-zinc-100 outline-none ring-github/40 placeholder:text-zinc-600 focus:ring-2"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, owner, language, or topic"
          type="search"
          value={query}
        />
        <select
          className="h-11 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none ring-github/40 focus:ring-2"
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          value={statusFilter}
        >
          <option value="all">All Statuses</option>
          {repositoryStatuses.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
      </div>
      {filteredRepositories.length ? (
        <div className="space-y-3">
          {filteredRepositories.map((repository) => (
            <RepoCard
              key={repository.id}
              onSelect={() => onOpenRepository(repository)}
              repository={repository}
              selected={repository.id === selectedRepoId}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No repositories found" body="Clear search or switch the status filter." />
      )}
    </section>
  )
}
