export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
      <span className="text-6xl mb-5">{icon}</span>
      <h2 className="text-xl font-semibold text-zinc-300 mb-2">{title}</h2>
      <p className="text-zinc-500 max-w-md mb-6">{description}</p>
      {action}
    </div>
  )
}
