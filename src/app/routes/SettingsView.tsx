import { PageHeader } from "../../components/ui/PageHeader"
import type { UserPreferences } from "../../types/userPreferences"

type Props = {
  preferences: UserPreferences
}

export function SettingsView({ preferences }: Props) {
  return (
    <section>
      <PageHeader kicker="Settings" title="Local-first defaults." />
      <div className="max-w-2xl rounded-md border border-zinc-800 bg-zinc-950/70 p-5">
        <SettingRow label="GitHub Account" value={preferences.githubUsername || "Not connected"} />
        <SettingRow label="Sync" value="Manual import placeholder" />
        <SettingRow label="Theme" value={preferences.theme === "dark" ? "Dark" : "Light"} />
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
