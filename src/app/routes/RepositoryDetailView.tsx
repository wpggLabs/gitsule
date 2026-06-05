import { DetailMetric } from "../../components/repo/DetailMetric"
import { PageHeader } from "../../components/ui/PageHeader"
import { StatusBadge } from "../../components/status/StatusBadge"
import type { Collection } from "../../types/collection"
import type { Repository, RepositoryRevisit } from "../../types/repository"
import type { RepositoryStatus } from "../../types/status"
import { repositoryStatuses, statusLabels } from "../../types/status"
import { formatShortDate } from "../../utils/dates"

type Props = {
  collections: Collection[]
  lastOpenedAt: string | null
  memory: {
    nextAction: string
    whySaved: string
  }
  notes: string
  onMarkRevisited: () => void
  onMemoryChange: (field: "nextAction" | "whySaved", value: string) => void
  onStatusChange: (status: RepositoryStatus) => void
  repository: Repository
  revisits: RepositoryRevisit[]
  setNotes: (notes: string) => void
}

export function RepositoryDetailView({
  collections,
  lastOpenedAt,
  memory,
  notes,
  onMarkRevisited,
  onMemoryChange,
  onStatusChange,
  repository,
  revisits,
  setNotes
}: Props) {
  return (
    <section>
      <PageHeader kicker="Memory Card" title={repository.fullName} />

      <div className="grid grid-cols-[1fr_320px] gap-6">
        <article className="rounded-md border border-zinc-800 bg-zinc-950/70 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">Personal Context</h2>
              <div className="mt-2 text-sm text-zinc-500">
                Last opened: {lastOpenedAt ? formatShortDate(lastOpenedAt) : "Never"}
              </div>
            </div>
            <button
              className="rounded-md border border-github/50 px-3 py-2 text-sm text-zinc-100 hover:bg-github/10"
              onClick={onMarkRevisited}
              type="button"
            >
              Mark as Revisited
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <MemoryField
              label="Why Saved"
              onChange={(value) => onMemoryChange("whySaved", value)}
              placeholder="What made this worth saving?"
              value={memory.whySaved}
            />
            <MemoryField
              label="Next Action"
              onChange={(value) => onMemoryChange("nextAction", value)}
              placeholder="What should happen next?"
              value={memory.nextAction}
            />
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-zinc-200">Notes</h3>
            <textarea
              className="mt-3 min-h-44 w-full resize-none rounded-md border border-zinc-800 bg-[#080a0f] p-4 text-sm leading-6 text-zinc-200 outline-none ring-github/40 focus:ring-2"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add the context GitHub cannot remember for you."
              value={notes}
            />
          </div>

          <div className="mt-6 grid grid-cols-[240px_1fr] gap-5">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">Status</h3>
              <div className="mt-3 flex items-center gap-3">
                <StatusBadge status={repository.status} />
                <select
                  className="h-9 rounded-md border border-zinc-800 bg-[#080a0f] px-3 text-sm text-zinc-100 outline-none ring-github/40 focus:ring-2"
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
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-200">Collections</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {collections.length ? (
                  collections.map((collection) => (
                    <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-300" key={collection.id}>
                      {collection.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-zinc-500">No collections yet.</span>
                )}
              </div>
            </div>
          </div>

          <section className="mt-7 border-t border-zinc-900 pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">GitHub Metadata</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">{repository.description || "No description."}</p>
            <div className="mt-5 grid grid-cols-4 gap-3">
              <DetailMetric label="Language" value={repository.language || "Unknown"} />
              <DetailMetric label="Stars" value={(Number(repository.stars) || 0).toLocaleString()} />
              <DetailMetric label="Forks" value={(Number(repository.forks) || 0).toLocaleString()} />
              <DetailMetric label="Updated" value={formatShortDate(repository.lastUpdated)} />
            </div>
          </section>
        </article>

        <aside className="rounded-md border border-zinc-800 bg-zinc-950/70 p-4">
          <h2 className="text-sm font-semibold text-zinc-200">Revisit History</h2>
          {revisits.length ? (
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                <tr>
                  <th className="border-b border-zinc-900 pb-2 font-medium">Opened</th>
                </tr>
              </thead>
              <tbody>
                {revisits.map((revisit) => (
                  <tr key={revisit.id}>
                    <td className="border-b border-zinc-900 py-3 text-zinc-300">{formatShortDate(revisit.visitedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="mt-4 text-sm leading-6 text-zinc-500">No revisit history yet.</div>
          )}
        </aside>
      </div>
    </section>
  )
}

function MemoryField({
  label,
  onChange,
  placeholder,
  value
}: {
  label: string
  onChange: (value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-zinc-200">{label}</span>
      <input
        className="mt-3 h-11 w-full rounded-md border border-zinc-800 bg-[#080a0f] px-3 text-sm text-zinc-100 outline-none ring-github/40 placeholder:text-zinc-600 focus:ring-2"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  )
}
