type Props = {
  kicker: string
  title: string
}

export function PageHeader({ kicker, title }: Props) {
  return (
    <header className="mb-6">
      <div className="text-xs uppercase tracking-[0.2em] text-github">{kicker}</div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">{title}</h1>
    </header>
  )
}
