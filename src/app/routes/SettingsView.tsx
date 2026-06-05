import { PageHeader } from "../../components/ui/PageHeader"
import type { UserPreferences } from "../../types/userPreferences"

type Props = {
  onResetDatabase: () => void
  onSeedDatabase: () => void
  preferences: UserPreferences
}

export function SettingsView({ onResetDatabase, onSeedDatabase, preferences }: Props) {
  return (
    <section>
      <PageHeader kicker="Settings" title="Local-first defaults." />
      <div className="max-w-2xl rounded-md border border-zinc-800 bg-zinc-950/70 p-5">
        <SettingRow label="GitHub Account" value={preferences.githubUsername || "Not connected"} />
        <SettingRow label="Sync" value="Manual import placeholder" />
        <SettingRow label="Theme" value={preferences.theme === "dark" ? "Dark" : "Light"} />
        <SettingRow label="Storage" value="SQLite with mock seed fallback" />
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
