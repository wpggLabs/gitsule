import { CollectionCard } from "../../components/collection/CollectionCard"
import { PageHeader } from "../../components/ui/PageHeader"
import type { CollectionSummary } from "../../data/repositories/repositoryStore"

type Props = {
  collectionSummaries: CollectionSummary[]
}

export function CollectionsView({ collectionSummaries }: Props) {
  return (
    <section>
      <PageHeader kicker="Collections" title="Group discoveries by intent." />
      <div className="grid grid-cols-3 gap-4">
        {collectionSummaries.map((collection) => (
          <CollectionCard collection={collection} key={collection.id} repoCount={collection.repoCount} />
        ))}
      </div>
    </section>
  )
}
