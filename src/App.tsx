import { useMemo, useState } from "react"
import { CollectionCard } from "./components/collection/CollectionCard"
import { RepoCard } from "./components/repo/RepoCard"
import { StatusBadge } from "./components/status/StatusBadge"
import { collections, repositories, repositoryCollections, repositorySignals } from "./data/mock"
import type { Repository } from "./types/repository"
import type { RepositoryStatus } from "./types/status"
import { statusLabels } from "./types/status"
import { formatShortDate } from "./utils/dates"
import { filterRepositories } from "./utils/filters"

type View = "home" | "library" | "collections" | "detail" | "settings"
type StatusFilter = RepositoryStatus | "all"

const navItems: Array<{ id: View; label: string }> = [
  { id: "home", label: "Home" },
  { id: "library", label: "Library" },
  { id: "collections", label: "Collections" },
  { id: "settings", label: "Settings" }
]

function App() {
  const [view, setView] = useState<View>("home")
  const [selectedRepoId, setSelectedRepoId] = useState(repositories[0].id)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [notesByRepoId, setNotesByRepoId] = useState<Record<number, string>>(
    Object.fromEntries(repositories.map((repository) => [repository.id, repository.notes]))
  )

  const selectedRepo = repositories.find((repository) => repository.id === selectedRepoId) ?? repositories[0]
  const filteredRepositories = useMemo(
    () => filterRepositories(repositories, query, statusFilter),
    [query, statusFilter]
  )
  const favorites = repositories.filter((repository) => repository.status === "favorite")
  const recentlyUpdated = [...repositories].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)).slice(0, 3)
  const recentlyStarred = [...repositories]
    .sort((a, b) => getSignal(b).starredAt.localeCompare(getSignal(a).starredAt))
    .slice(0, 4)
  const forgottenRepositories = [...repositories]
    .filter((repository) => {
      const signal = getSignal(repository)
      return repository.status !== "abandoned" && (!signal.lastVisitedAt || signal.lastVisitedAt < "2026-03-01")
    })
    .sort((a, b) => getSignal(a).starredAt.localeCompare(getSignal(b).starredAt))
    .slice(0, 4)

  function openRepository(repository: Repository) {
    setSelectedRepoId(repository.id)
    setView("detail")
  }

  return (
    <div className="min-h-screen bg-[#090b10] text-zinc-100">
      <div className="flex min-h-screen">
        <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-850 bg-[#0d1017] px-4 py-5">
          <div className="mb-8 flex items-center gap-3">
            <img alt="" className="block h-8 w-8 shrink-0" src="/gitsule-mark.svg" />
            <div className="min-w-0">
              <div className="text-xl font-semibold tracking-tight">Gitsule</div>
              <div className="mt-1 truncate text-xs text-zinc-500">GitHub discoveries capsule</div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                  view === item.id
                    ? "bg-github text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
                key={item.id}
                onClick={() => setView(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-md border border-zinc-800 bg-zinc-950/70 p-3">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Local Library</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <Metric label="Repos" value={repositories.length.toString()} />
              <Metric label="Collections" value={collections.length.toString()} />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden">
          <div className="mx-auto max-w-7xl px-8 py-7">
            {view === "home" && (
              <Home
                forgottenRepositories={forgottenRepositories}
                favorites={favorites}
                onOpenRepository={openRepository}
                recentlyUpdated={recentlyUpdated}
                recentlyStarred={recentlyStarred}
                setView={setView}
              />
            )}

            {view === "library" && (
              <Library
                filteredRepositories={filteredRepositories}
                onOpenRepository={openRepository}
                query={query}
                selectedRepoId={selectedRepoId}
                setQuery={setQuery}
                setStatusFilter={setStatusFilter}
                statusFilter={statusFilter}
              />
            )}

            {view === "collections" && <Collections />}

            {view === "detail" && (
              <RepositoryDetail
                notes={notesByRepoId[selectedRepo.id] ?? ""}
                repository={selectedRepo}
                setNotes={(nextNotes) =>
                  setNotesByRepoId((current) => ({ ...current, [selectedRepo.id]: nextNotes }))
                }
              />
            )}

            {view === "settings" && <Settings />}
          </div>
        </main>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-lg text-zinc-100">{value}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  )
}

function PageHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <header className="mb-6">
      <div className="text-xs uppercase tracking-[0.2em] text-github">{kicker}</div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">{title}</h1>
    </header>
  )
}

function getSignal(repository: Repository) {
  return repositorySignals[repository.id] ?? { starredAt: repository.lastUpdated, lastVisitedAt: null }
}

function formatLastVisited(repository: Repository) {
  const lastVisitedAt = getSignal(repository).lastVisitedAt
  return lastVisitedAt ? `Last opened ${formatShortDate(lastVisitedAt)}` : "Never opened"
}

function Home({
  forgottenRepositories,
  favorites,
  onOpenRepository,
  recentlyUpdated,
  recentlyStarred,
  setView
}: {
  forgottenRepositories: Repository[]
  favorites: Repository[]
  onOpenRepository: (repository: Repository) => void
  recentlyUpdated: Repository[]
  recentlyStarred: Repository[]
  setView: (view: View) => void
}) {
  const collectionCounts = repositoryCollections.reduce<Record<string, number>>((current, link) => {
    current[link.collectionId] = (current[link.collectionId] ?? 0) + 1
    return current
  }, {})
  const unvisitedCount = repositories.filter((repository) => !getSignal(repository).lastVisitedAt).length
  const needsNotesCount = repositories.filter((repository) => !repository.notes.trim()).length

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-6">
        <PageHeader kicker="Rediscovery" title="Revisit what you saved for later." />
        <button className="mb-1 text-sm text-github hover:text-sky-300" onClick={() => setView("library")} type="button">
          Open library
        </button>
      </div>

      <div className="grid grid-cols-6 gap-3">
        <StatCard label="Forgotten" value={forgottenRepositories.length.toString()} />
        <StatCard label="Unvisited" value={unvisitedCount.toString()} />
        <StatCard label="Need Notes" value={needsNotesCount.toString()} />
        <StatCard label="Favorites" value={favorites.length.toString()} />
        <StatCard label="Testing" value={repositories.filter((repo) => repo.status === "testing").length.toString()} />
        <StatCard label="Collections" value={collections.length.toString()} />
      </div>

      <div className="mt-5 grid grid-cols-[1.35fr_0.65fr] gap-5">
        <div className="space-y-5">
          <DashboardPanel
            actionLabel="Review all"
            onAction={() => setView("library")}
            title="Forgotten Repositories"
          >
            <div className="grid grid-cols-2 gap-3">
              {forgottenRepositories.map((repository) => (
                <DiscoveryRow
                  key={repository.id}
                  meta={`Starred ${formatShortDate(getSignal(repository).starredAt)}`}
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
                {recentlyStarred.map((repository) => (
                  <DiscoveryRow
                    compact
                    key={repository.id}
                    meta={`Starred ${formatShortDate(getSignal(repository).starredAt)}`}
                    onOpen={() => onOpenRepository(repository)}
                    repository={repository}
                    signal={repository.language}
                  />
                ))}
              </div>
            </DashboardPanel>

            <DashboardPanel title="Recently Updated">
              <div className="space-y-2">
                {recentlyUpdated.map((repository) => (
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
              {collections.map((collection) => (
                <button
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900/40 p-3 text-left hover:border-github/50"
                  key={collection.id}
                  onClick={() => setView("collections")}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm font-medium text-zinc-100">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: collection.color }} />
                      {collection.name}
                    </span>
                    <span className="font-mono text-sm text-zinc-400">{collectionCounts[collection.id] ?? 0}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-zinc-800">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        backgroundColor: collection.color,
                        width: `${Math.max(14, ((collectionCounts[collection.id] ?? 0) / repositories.length) * 100)}%`
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </DashboardPanel>

          <DashboardPanel title="Discovery Insights">
            <div className="space-y-3 text-sm">
              <InsightLine label="Best revisit" value={forgottenRepositories[0]?.fullName ?? "None"} />
              <InsightLine label="Most saved area" value="Self-hosted" />
              <InsightLine label="Cleanup candidate" value="Abandoned repos" />
              <InsightLine label="Fast win" value={`${needsNotesCount} repo needs notes`} />
            </div>
          </DashboardPanel>

          <DashboardPanel title="Continue Exploring">
            <div className="space-y-2">
              {favorites.slice(0, 3).map((repository) => (
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

function DashboardPanel({
  actionLabel,
  children,
  onAction,
  title
}: {
  actionLabel?: string
  children: React.ReactNode
  onAction?: () => void
  title: string
}) {
  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
        {actionLabel && (
          <button className="text-xs text-github hover:text-sky-300" onClick={onAction} type="button">
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

function DiscoveryRow({
  compact = false,
  meta,
  onOpen,
  repository,
  signal
}: {
  compact?: boolean
  meta: string
  onOpen: () => void
  repository: Repository
  signal: string
}) {
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

function InsightLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-zinc-900 pb-3 last:border-b-0 last:pb-0">
      <span className="text-zinc-500">{label}</span>
      <span className="truncate text-right text-zinc-200">{value}</span>
    </div>
  )
}
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="font-mono text-2xl text-zinc-50">{value}</div>
      <div className="mt-1 text-sm text-zinc-500">{label}</div>
    </div>
  )
}

function Library({
  filteredRepositories,
  onOpenRepository,
  query,
  selectedRepoId,
  setQuery,
  setStatusFilter,
  statusFilter
}: {
  filteredRepositories: Repository[]
  onOpenRepository: (repository: Repository) => void
  query: string
  selectedRepoId: number
  setQuery: (query: string) => void
  setStatusFilter: (status: StatusFilter) => void
  statusFilter: StatusFilter
}) {
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
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
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
    </section>
  )
}

function Collections() {
  const counts = repositoryCollections.reduce<Record<string, number>>((current, link) => {
    current[link.collectionId] = (current[link.collectionId] ?? 0) + 1
    return current
  }, {})

  return (
    <section>
      <PageHeader kicker="Collections" title="Group discoveries by intent." />
      <div className="grid grid-cols-3 gap-4">
        {collections.map((collection) => (
          <CollectionCard collection={collection} key={collection.id} repoCount={counts[collection.id] ?? 0} />
        ))}
      </div>
    </section>
  )
}

function RepositoryDetail({
  notes,
  repository,
  setNotes
}: {
  notes: string
  repository: Repository
  setNotes: (notes: string) => void
}) {
  const linkedCollections = repositoryCollections
    .filter((link) => link.repositoryId === repository.id)
    .map((link) => collections.find((collection) => collection.id === link.collectionId))
    .filter(Boolean)

  return (
    <section>
      <PageHeader kicker="Repository" title={repository.fullName} />
      <div className="grid grid-cols-[1fr_340px] gap-6">
        <article className="rounded-md border border-zinc-800 bg-zinc-950/70 p-5">
          <div className="flex items-start justify-between gap-4">
            <p className="max-w-3xl text-base leading-7 text-zinc-300">{repository.description}</p>
            <StatusBadge status={repository.status} />
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
              {linkedCollections.map((collection) => (
                <span
                  className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-300"
                  key={collection?.id}
                >
                  {collection?.name}
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
            </dl>
          </div>
        </aside>
      </div>
    </section>
  )
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="text-sm font-medium text-zinc-100">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{label}</div>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</dt>
      <dd className="mt-1 break-words text-zinc-300">{value}</dd>
    </div>
  )
}

function Settings() {
  return (
    <section>
      <PageHeader kicker="Settings" title="Local-first defaults." />
      <div className="max-w-2xl rounded-md border border-zinc-800 bg-zinc-950/70 p-5">
        <SettingRow label="GitHub Account" value="Not connected" />
        <SettingRow label="Sync" value="Manual import placeholder" />
        <SettingRow label="Theme" value="Dark" />
        <SettingRow label="Storage" value="Mock in-memory data" />
      </div>
    </section>
  )
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-900 py-4 last:border-b-0">
      <div className="font-medium text-zinc-100">{label}</div>
      <div className="text-sm text-zinc-500">{value}</div>
    </div>
  )
}

export default App
