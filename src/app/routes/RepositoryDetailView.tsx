import { DetailMetric } from "../../components/repo/DetailMetric"
import { MetaRow } from "../../components/repo/MetaRow"
import { PageHeader } from "../../components/ui/PageHeader"
import { StatusBadge } from "../../components/status/StatusBadge"
import type { Collection } from "../../types/collection"
import type { Repository } from "../../types/repository"
import type { RepositoryStatus } from "../../types/status"
import { repositoryStatuses, statusLabels } from "../../types/status"
import { formatShortDate } from "../../utils/dates"

type Props = {
  collections: Collection[]
  notes: string
  onStatusChange: (status: RepositoryStatus) => void
  repository: Repository
  setNotes: (notes: string) => void
}

export function RepositoryDetailView({ collections, notes, onStatusChange, repository, setNotes }: Props) {
  return (
    <section>
      <PageHeader kicker="Repository" title={repository.fullName} />
      <div className="grid grid-cols-[1fr_340px] gap-6">
        <article className="rounded-md border border-zinc-800 bg-zinc-950/70 p-5">
          <div className="flex items-start justify-between gap-4">
            <p className="max-w-3xl text-base leading-7 text-zinc-300">{repository.description}</p>
            <StatusBadge status={repository.status} />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <label className="text-sm font-medium text-zinc-300" htmlFor="repository-status">
              Status
            </label>
            <select
              className="h-9 rounded-md border border-zinc-800 bg-[#080a0f] px-3 text-sm text-zinc-100 outline-none ring-github/40 focus:ring-2"
              id="repository-status"
              onChange={(event) => onStatusChange(event.target.value as RepositoryStatus)}
              value={repository.status}
            >
              {repositoryStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-3">
            <DetailMetric label="Language" value={repository.language} />
            <DetailMetric label="Stars" value={repository.stars.toLocaleString()} />
            <DetailMetric label="Forks" value={repository.forks.toLocaleString()} />
            <DetailMetric label="Updated" value={formatShortDate(repository.lastUpdated)} />
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-semibold text-zinc-200">Notes</h2>
            <textarea
              className="mt-3 min-h-52 w-full resize-none rounded-md border border-zinc-800 bg-[#080a0f] p-4 text-sm leading-6 text-zinc-200 outline-none ring-github/40 focus:ring-2"
              onChange={(event) => setNotes(event.target.value)}
              value={notes}
            />
          </div>
        </article>

        <aside className="space-y-4">
          <div className="rounded-md border border-zinc-800 bg-zinc-950/70 p-4">
            <h2 className="text-sm font-semibold text-zinc-200">Collections</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {collections.map((collection) => (
                <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-300" key={collection.id}>
                  {collection.name}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-zinc-800 bg-zinc-950/70 p-4">
            <h2 className="text-sm font-semibold text-zinc-200">Metadata</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <MetaRow label="License" value={repository.license ?? "None"} />
              <MetaRow label="Homepage" value={repository.homepage ?? "None"} />
              <MetaRow label="GitHub" value={repository.githubUrl} />
              <MetaRow label="Last Updated" value={formatShortDate(repository.lastUpdated)} />
            </dl>
          </div>
        </aside>
      </div>
    </section>
  )
}
