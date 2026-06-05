import type { Collection } from "../../types/collection"

type Props = {
  collection: Collection
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
    </article>
  )
}
