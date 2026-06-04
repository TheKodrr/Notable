import { cn } from '../utils'
import { getDueLabel } from '../utils'

interface DueDateBadgeProps {
  dueDate: string
  className?: string
}

export function DueDateBadge({ dueDate, className }: DueDateBadgeProps) {
  const { text, urgent } = getDueLabel(dueDate)
  const date = new Date(dueDate)
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
  const isMidnight = timeStr === '12:00 AM'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border',
        urgent
          ? 'bg-red-500/15 text-red-400 border-red-500/30'
          : 'bg-zinc-800 text-zinc-400 border-zinc-700',
        className,
      )}
    >
      <span>{urgent ? '⚠️' : '📅'}</span>
      <span>{text}</span>
      {!isMidnight && <span className="text-zinc-500">{timeStr}</span>}
    </span>
  )
}
