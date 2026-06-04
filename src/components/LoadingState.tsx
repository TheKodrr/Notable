export function LoadingState() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 animate-fade-in">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3"
        >
          <div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-zinc-800 rounded w-full animate-pulse" />
          <div className="h-3 bg-zinc-800 rounded w-1/2 animate-pulse" />
          <div className="flex gap-2 pt-2">
            <div className="h-5 bg-zinc-800 rounded-full w-16 animate-pulse" />
            <div className="h-5 bg-zinc-800 rounded-full w-12 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
