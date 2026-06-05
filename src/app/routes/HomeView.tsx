import { DashboardPanel } from "../../components/ui/DashboardPanel"
import { DiscoveryRow } from "../../components/repo/DiscoveryRow"
import { PageHeader } from "../../components/ui/PageHeader"
import { StatCard } from "../../components/ui/StatCard"
import type { CollectionSummary, DashboardData } from "../../data/repositories/repositoryStore"
import { getRepositorySignal } from "../../data/repositories/repositoryStore"
import type { Repository } from "../../types/repository"
import type { View } from "../../types/navigation"
import { formatShortDate } from "../../utils/dates"

type Props = {
  collectionSummaries: CollectionSummary[]
  dashboard: DashboardData
  onNavigate: (view: View) => void
  onOpenRepository: (repository: Repository) => void
  repositoryCount: number
}

export function HomeView({ collectionSummaries, dashboard, onNavigate, onOpenRepository, repositoryCount }: Props) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-6">
        <PageHeader kicker="Rediscovery" title="Revisit what you saved for later." />
        <button className="mb-1 text-sm text-github hover:text-sky-300" onClick={() => onNavigate("library")} type="button">
          Open library
        </button>
      </div>

      <div className="grid grid-cols-6 gap-3">
        <StatCard label="Forgotten" value={dashboard.forgottenRepositories.length.toString()} />
        <StatCard label="Unvisited" value={dashboard.unvisitedCount.toString()} />
        <StatCard label="Need Notes" value={dashboard.needsNotesCount.toString()} />
        <StatCard label="Favorites" value={dashboard.favorites.length.toString()} />
        <StatCard label="Testing" value={dashboard.testingCount.toString()} />
        <StatCard label="Collections" value={collectionSummaries.length.toString()} />
      </div>

      <div className="mt-5 grid grid-cols-[1.35fr_0.65fr] gap-5">
        <div className="space-y-5">
          <DashboardPanel actionLabel="Review all" onAction={() => onNavigate("library")} title="Forgotten Repositories">
            <div className="grid grid-cols-2 gap-3">
              {dashboard.forgottenRepositories.map((repository) => (
                <DiscoveryRow
                  key={repository.id}
                  meta={`Starred ${formatShortDate(getRepositorySignal(repository).starredAt)}`}
                  onOpen={() => onOpenRepository(repository)}
                  repository={repository}
                  signal={formatLastVisited(repository)}
                />
              ))}
            </div>
          </DashboardPanel>

          <div className="grid grid-cols-2 gap-5">
            <DashboardPanel title="Recently Starred">
              <div className="space-y-2">
                {dashboard.recentlyStarred.map((repository) => (
                  <DiscoveryRow
                    compact
                    key={repository.id}
                    meta={`Starred ${formatShortDate(getRepositorySignal(repository).starredAt)}`}
                    onOpen={() => onOpenRepository(repository)}
                    repository={repository}
                    signal={repository.language}
                  />
                ))}
              </div>
            </DashboardPanel>

            <DashboardPanel title="Recently Updated">
              <div className="space-y-2">
                {dashboard.recentlyUpdated.map((repository) => (
                  <DiscoveryRow
                    compact
                    key={repository.id}
                    meta={`Updated ${formatShortDate(repository.lastUpdated)}`}
                    onOpen={() => onOpenRepository(repository)}
                    repository={repository}
                    signal={`${repository.stars.toLocaleString()} stars`}
                  />
                ))}
              </div>
            </DashboardPanel>
          </div>
        </div>

        <aside className="space-y-5">
          <DashboardPanel title="Collection Overview">
            <div className="space-y-3">
              {collectionSummaries.map((collection) => (
                <button
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900/40 p-3 text-left hover:border-github/50"
                  key={collection.id}
                  onClick={() => onNavigate("collections")}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm font-medium text-zinc-100">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: collection.color }} />
                      {collection.name}
                    </span>
                    <span className="font-mono text-sm text-zinc-400">{collection.repoCount}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-zinc-800">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        backgroundColor: collection.color,
                        width: `${Math.max(14, (collection.repoCount / repositoryCount) * 100)}%`
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </DashboardPanel>

          <DashboardPanel title="Discovery Insights">
            <div className="space-y-3 text-sm">
              <InsightLine label="Best revisit" value={dashboard.bestRevisit?.fullName ?? "None"} />
              <InsightLine label="Most saved area" value={dashboard.mostSavedCollection?.name ?? "None"} />
              <InsightLine label="Cleanup candidate" value="Abandoned repos" />
              <InsightLine label="Fast win" value={`${dashboard.needsNotesCount} repo needs notes`} />
            </div>
          </DashboardPanel>

          <DashboardPanel title="Continue Exploring">
            <div className="space-y-2">
              {dashboard.favorites.slice(0, 3).map((repository) => (
                <DiscoveryRow
                  compact
                  key={repository.id}
                  meta={repository.language}
                  onOpen={() => onOpenRepository(repository)}
                  repository={repository}
                  signal="Favorite"
                />
              ))}
            </div>
          </DashboardPanel>
        </aside>
      </div>
    </section>
  )
}

function formatLastVisited(repository: Repository) {
  const lastVisitedAt = getRepositorySignal(repository).lastVisitedAt
  return lastVisitedAt ? `Last opened ${formatShortDate(lastVisitedAt)}` : "Never opened"
}

function InsightLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-zinc-900 pb-3 last:border-b-0 last:pb-0">
      <span className="text-zinc-500">{label}</span>
      <span className="truncate text-right text-zinc-200">{value}</span>
    </div>
  )
}
