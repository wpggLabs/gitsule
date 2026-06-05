import { useMemo, useState } from "react"
import { AppShell } from "./components/layout/AppShell"
import { CollectionsView } from "./app/routes/CollectionsView"
import { FavoritesView } from "./app/routes/FavoritesView"
import { HomeView } from "./app/routes/HomeView"
import { LibraryView } from "./app/routes/LibraryView"
import { RepositoryDetailView } from "./app/routes/RepositoryDetailView"
import { SettingsView } from "./app/routes/SettingsView"
import {
  getDashboardData,
  getCollectionsForRepository,
  getRepositoryNoteDrafts,
  getRepositoryStoreSnapshot,
  type StatusFilter
} from "./data/repositories/repositoryStore"
import type { View } from "./types/navigation"
import type { Repository } from "./types/repository"
import { filterRepositories } from "./utils/filters"

function App() {
  const store = useMemo(() => getRepositoryStoreSnapshot(), [])
  const dashboard = useMemo(() => getDashboardData(), [])
  const [view, setView] = useState<View>("home")
  const [selectedRepoId, setSelectedRepoId] = useState(store.repositories[0].id)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [notesByRepoId, setNotesByRepoId] = useState(() => getRepositoryNoteDrafts())

  const selectedRepo = store.repositories.find((repository) => repository.id === selectedRepoId) ?? store.repositories[0]
  const filteredRepositories = useMemo(
    () => filterRepositories(store.repositories, query, statusFilter),
    [store.repositories, query, statusFilter]
  )
  const selectedRepoCollections = useMemo(
    () => getCollectionsForRepository(selectedRepo.id),
    [selectedRepo.id]
  )

  function openRepository(repository: Repository) {
    setSelectedRepoId(repository.id)
    setView("detail")
  }

  return (
    <AppShell
      activeView={view}
      collectionCount={store.collections.length}
      onNavigate={setView}
      repositoryCount={store.repositories.length}
    >
      {view === "home" && (
        <HomeView
          collectionSummaries={store.collectionSummaries}
          dashboard={dashboard}
          onNavigate={setView}
          onOpenRepository={openRepository}
          repositoryCount={store.repositories.length}
        />
      )}

      {view === "library" && (
        <LibraryView
          filteredRepositories={filteredRepositories}
          onOpenRepository={openRepository}
          query={query}
          selectedRepoId={selectedRepoId}
          setQuery={setQuery}
          setStatusFilter={setStatusFilter}
          statusFilter={statusFilter}
        />
      )}

      {view === "collections" && <CollectionsView collectionSummaries={store.collectionSummaries} />}

      {view === "favorites" && (
        <FavoritesView
          favorites={dashboard.favorites}
          onOpenRepository={openRepository}
          selectedRepoId={selectedRepoId}
        />
      )}

      {view === "detail" && (
        <RepositoryDetailView
          collections={selectedRepoCollections}
          notes={notesByRepoId[selectedRepo.id] ?? ""}
          repository={selectedRepo}
          setNotes={(nextNotes) =>
            setNotesByRepoId((current) => ({ ...current, [selectedRepo.id]: nextNotes }))
          }
        />
      )}

      {view === "settings" && <SettingsView preferences={store.userPreferences} />}
    </AppShell>
  )
}

export default App
