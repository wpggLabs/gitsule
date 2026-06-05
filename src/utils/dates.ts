export function formatShortDate(value?: string | null) {
  if (!value) {
    return "Unknown"
  }

  const date = /^\d+$/.test(value)
    ? new Date(Number(value) * 1000)
    : new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value)

  if (Number.isNaN(date.getTime())) {
    return "Unknown"
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date)
}
