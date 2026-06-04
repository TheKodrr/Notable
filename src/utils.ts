import { type ClassValue, clsx } from 'clsx'

// Simple classname utility without external dependency
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ')
}

export function formatDate(isoString: string, options?: { compact?: boolean }): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (options?.compact) {
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function isOverdue(isoString: string): boolean {
  return new Date(isoString) < new Date()
}

export function isToday(isoString: string): boolean {
  const d = new Date(isoString)
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

export function isTomorrow(isoString: string): boolean {
  const d = new Date(isoString)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  )
}

export function getDueLabel(isoString: string): { text: string; urgent: boolean } {
  if (isOverdue(isoString)) return { text: 'Overdue', urgent: true }
  if (isToday(isoString)) return { text: 'Today', urgent: true }
  if (isTomorrow(isoString)) return { text: 'Tomorrow', urgent: false }
  return { text: formatDate(isoString), urgent: false }
}

export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(
    new RegExp(`(${escaped})`, 'gi'),
    '<mark class="bg-yellow-400/30 text-yellow-200 rounded px-0.5">$1</mark>',
  )
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '…'
}

export function getChecklistProgress(
  items: { completed: boolean }[],
): { done: number; total: number; percent: number } {
  const total = items.length
  if (total === 0) return { done: 0, total: 0, percent: 0 }
  const done = items.filter((i) => i.completed).length
  return { done, total, percent: Math.round((done / total) * 100) }
}
