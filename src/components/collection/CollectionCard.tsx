import type { CollectionSummary } from "../../data/repositories/repositoryStore"

type Props = {
  collection: CollectionSummary
  repoCount: number
}

export function CollectionCard({ collection, repoCount }: Props) {
  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: collection.color }} />
          <h3 className="font-semibold text-zinc-100">{collection.name}</h3>
        </div>
        <span className="rounded-full border border-zinc-800 px-2.5 py-1 text-xs text-zinc-400">
          {repoCount} repos
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{collection.description}</p>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-zinc-900 pt-4">
        <CollectionMetric label="Forgotten" value={collection.forgottenCount} />
        <CollectionMetric label="Unvisited" value={collection.unvisitedCount} />
        <CollectionMetric label="Need Notes" value={collection.needsNotesCount} />
      </div>
    </article>
  )
}

function CollectionMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-mono text-base text-zinc-100">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{label}</div>
    </div>
  )
}
