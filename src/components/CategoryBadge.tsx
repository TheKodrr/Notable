import { cn } from '../utils'

export function CategoryBadge({
  name,
  color,
  icon,
  className,
}: {
  name: string
  color: string
  icon: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
        className,
      )}
      style={{
        backgroundColor: `${color}20`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      <span>{icon}</span>
      <span>{name}</span>
    </span>
  )
}
