import { cn } from '../utils'
import { PRIORITY_COLORS, PRIORITY_LABELS, type Priority } from '../types'

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded border',
        PRIORITY_COLORS[priority],
        className,
      )}
    >
      {priority === 'urgent' ? '🔴' : priority === 'high' ? '🟠' : priority === 'medium' ? '🟡' : '🔵'}{' '}
      {PRIORITY_LABELS[priority]}
    </span>
  )
}
