import { PageHeader } from "../../components/ui/PageHeader"
import type { UserPreferences } from "../../types/userPreferences"

type Props = {
  githubToken: string
  importError: string
  importMessage: string
  importStatus: "idle" | "importing" | "success" | "error"
  onImportStarred: () => void
  onResetDatabase: () => void
  onSeedDatabase: () => void
  onTokenChange: (token: string) => void
  preferences: UserPreferences
  stats: SettingsStats
}

type SettingsStats = {
  collectionCount: number
  databaseSizeBytes: number
  importedRepositoryCount: number
  lastImportAt: string | null
  notesCount: number
  repositoryCount: number
}

export function SettingsView({
  githubToken,
  importError,
  importMessage,
  importStatus,
  onImportStarred,
  onResetDatabase,
  onSeedDatabase,
  onTokenChange,
  preferences,
  stats
}: Props) {
  const canImport = Boolean(githubToken.trim() || preferences.githubTokenStored)

  return (
    <section>
      <PageHeader kicker="Settings" title="Local-first defaults." />
      <div className="max-w-2xl rounded-md border border-zinc-800 bg-zinc-950/70 p-5">
        <SettingRow label="GitHub Username" value={preferences.githubUsername || "Not connected"} />
        <SettingRow label="PAT Status" value={preferences.githubTokenStored ? "Stored locally" : "Not stored"} />
        <SettingRow label="Imported Repositories" value={formatCount(stats.importedRepositoryCount)} />
        <SettingRow label="Last Import" value={formatTimestamp(stats.lastImportAt)} />
        <SettingRow label="Repository Count" value={formatCount(stats.repositoryCount)} />
        <SettingRow label="Notes Count" value={formatCount(stats.notesCount)} />
        <SettingRow label="Collection Count" value={formatCount(stats.collectionCount)} />
        <SettingRow label="Database Size" value={formatBytes(stats.databaseSizeBytes)} />
        <SettingRow label="Theme" value={preferences.theme === "dark" ? "Dark" : "Light"} />
        <SettingRow label="Storage" value="Local SQLite" />
        <div className="border-b border-zinc-900 py-4">
          <div className="font-medium text-zinc-100">GitHub Personal Access Token</div>
          <div className="mt-1 text-sm text-zinc-500">
            Personal V1 only: stored locally in SQLite on this device and only sent to GitHub API requests.
          </div>
          <input
            className="mt-3 h-10 w-full rounded-md border border-zinc-800 bg-[#080a0f] px-3 text-sm text-zinc-100 outline-none ring-github/40 placeholder:text-zinc-600 focus:ring-2"
            onChange={(event) => onTokenChange(event.target.value)}
            placeholder={preferences.githubTokenStored ? "Token saved locally" : "github_pat_..."}
            type="password"
            value={githubToken}
          />
          {preferences.githubTokenStored && !githubToken.trim() && (
            <div className="mt-2 text-xs text-zinc-500">A token is saved locally. Leave blank to reuse it.</div>
          )}
        </div>
        <div className="border-b border-zinc-900 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium text-zinc-100">Import Starred Repositories</div>
              <div className="mt-1 text-sm text-zinc-500">Fetch your GitHub stars and save them to local SQLite.</div>
            </div>
            <button
              className="rounded-md border border-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:border-github/60 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={importStatus === "importing" || !canImport}
              onClick={onImportStarred}
              type="button"
            >
              {importStatus === "importing" ? "Importing" : "Import"}
            </button>
          </div>
          {importMessage && <div className="mt-3 text-sm text-emerald-300">{importMessage}</div>}
          {importError && <div className="mt-3 text-sm text-red-300">{importError}</div>}
        </div>
        <div className="flex items-center justify-between gap-4 border-b border-zinc-900 py-4 last:border-b-0">
          <div>
            <div className="font-medium text-zinc-100">Seed Database</div>
            <div className="mt-1 text-sm text-zinc-500">Load the current mock library into local SQLite.</div>
          </div>
          <button
            className="rounded-md border border-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:border-github/60"
            onClick={onSeedDatabase}
            type="button"
          >
            Seed
          </button>
        </div>
        <div className="flex items-center justify-between gap-4 py-4">
          <div>
            <div className="font-medium text-zinc-100">Reset Dev Database</div>
            <div className="mt-1 text-sm text-zinc-500">Clear local SQLite and return to the seed fallback.</div>
          </div>
          <button
            className="rounded-md border border-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:border-github/60"
            onClick={onResetDatabase}
            type="button"
          >
            Reset
          </button>
        </div>
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

function formatCount(value: number) {
  return new Intl.NumberFormat().format(value)
}

function formatBytes(bytes: number) {
  if (!bytes) {
    return "Not created yet"
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Never"
  }

  const timestamp = Number(value)
  const date = Number.isFinite(timestamp) ? new Date(timestamp * 1000) : new Date(value)
  return date.toLocaleString()
}
