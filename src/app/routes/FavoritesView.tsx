import { EmptyState } from "../../components/ui/EmptyState"
import { PageHeader } from "../../components/ui/PageHeader"
import { RepoCard } from "../../components/repo/RepoCard"
import type { Repository } from "../../types/repository"

type Props = {
  favorites: Repository[]
  onOpenRepository: (repository: Repository) => void
  selectedRepoId: number
}

export function FavoritesView({ favorites, onOpenRepository, selectedRepoId }: Props) {
  return (
    <section>
      <PageHeader kicker="Favorites" title="Repos worth coming back to." />
      {favorites.length ? (
        <div className="space-y-3">
          {favorites.map((repository) => (
            <RepoCard
              key={repository.id}
              onSelect={() => onOpenRepository(repository)}
              repository={repository}
              selected={repository.id === selectedRepoId}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No favorites yet" body="Mark repositories as favorites to keep them close." />
      )}
    </section>
  )
}
