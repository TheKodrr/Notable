import { useNotes } from '../store'
import { NoteCard } from './NoteCard'
import { EmptyState } from './EmptyState'
import { LoadingState } from './LoadingState'
import type { Note } from '../types'

interface NoteListProps {
  notes: Note[]
  onSelectNote: (id: string) => void
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: string
  compact?: boolean
  showRestore?: boolean
}

export function NoteList({
  notes,
  onSelectNote,
  isLoading,
  emptyTitle = 'No notes found',
  emptyDescription = 'Create a new note to get started',
  emptyIcon = '📝',
  compact,
  showRestore,
}: NoteListProps) {
  if (isLoading) return <LoadingState />

  if (notes.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div
      className={
        compact
          ? 'grid gap-3'
          : 'grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
      }
    >
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onSelect={onSelectNote}
          compact={compact}
          showRestore={showRestore}
        />
      ))}
    </div>
  )
}
