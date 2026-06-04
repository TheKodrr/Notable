import { useState } from 'react'
import { useNotes } from '../store'
import { cn, formatDate, getDueLabel, getChecklistProgress, truncate, highlightText } from '../utils'
import { PRIORITY_COLORS } from '../types'
import type { Note } from '../types'

interface NoteCardProps {
  note: Note
  onSelect: (id: string) => void
  compact?: boolean
  showRestore?: boolean
}

export function NoteCard({ note, onSelect, compact, showRestore }: NoteCardProps) {
  const { dispatch, getCategory, state } = useNotes()
  const category = getCategory(note.categoryId)
  const progress = getChecklistProgress(note.checklist)
  const [imgError, setImgError] = useState(false)

  const dueLabel = note.dueDate ? getDueLabel(note.dueDate) : null
  const firstImage = note.attachments.find((a) => a.type === 'image')

  return (
    <article
      onClick={() => onSelect(note.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(note.id)
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Note: ${note.title || 'Untitled'}`}
      className={cn(
        'group relative bg-zinc-900 border border-zinc-800 rounded-xl p-4 cursor-pointer transition-all duration-200',
        'hover:border-zinc-700 hover:bg-zinc-800/50 hover:shadow-lg hover:shadow-zinc-950/30',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/30',
        note.isPinned && 'border-l-2 border-l-blue-500',
        compact ? 'text-sm' : '',
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-zinc-100 truncate leading-snug">
            {note.title ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: state.searchQuery
                    ? highlightText(note.title, state.searchQuery)
                    : note.title,
                }}
              />
            ) : (
              <span className="text-zinc-500 italic">Untitled</span>
            )}
          </h3>
          {!compact && note.content && (
            <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
              <span
                dangerouslySetInnerHTML={{
                  __html: state.searchQuery
                    ? highlightText(
                        truncate(note.content, 120),
                        state.searchQuery,
                      )
                    : truncate(note.content, 120),
                }}
              />
            </p>
          )}
        </div>

        {/* Priority indicator */}
        <span
          className={cn(
            'shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border',
            PRIORITY_COLORS[note.priority],
          )}
        >
          {note.priority === 'urgent' ? '!!' : note.priority === 'high' ? '!' : '·'}
        </span>
      </div>

      {/* Thumbnail */}
      {!compact && firstImage && !imgError && (
        <div className="mb-3 -mx-4 overflow-hidden">
          <img
            src={firstImage.url}
            alt={firstImage.name}
            onError={() => setImgError(true)}
            className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
        </div>
      )}

      {/* Checklist progress */}
      {note.checklist.length > 0 && (
        <div className="mb-2.5">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <span>
              {progress.done}/{progress.total}
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Category badge */}
        {category && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </span>
        )}

        {/* Tags */}
        {!compact &&
          note.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[11px] text-zinc-500 bg-zinc-800/50 px-1.5 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
        {!compact && note.tags.length > 2 && (
          <span className="text-[11px] text-zinc-600">
            +{note.tags.length - 2}
          </span>
        )}

        {/* Due date */}
        {dueLabel && (
          <span
            className={cn(
              'text-[11px] font-medium ml-auto',
              dueLabel.urgent ? 'text-red-400' : 'text-zinc-500',
            )}
          >
            {dueLabel.text}
          </span>
        )}

        {/* Reminder indicator */}
        {note.reminderTime && (
          <span className="text-[11px]" title={`Reminder: ${note.reminderTime}`}>
            🔔
          </span>
        )}

        {/* Updated */}
        <span className="text-[10px] text-zinc-600 ml-auto">
          {formatDate(note.updatedAt, { compact: true })}
        </span>
      </div>

      {/* Restore button (Archive page) */}
      {showRestore && (
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <button
            onClick={(e) => {
              e.stopPropagation()
              dispatch({ type: 'TOGGLE_ARCHIVE', id: note.id })
            }}
            className="w-full py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-lg transition-colors"
          >
            ↩ Restore
          </button>
        </div>
      )}

      {/* Action buttons on hover */}
      <div className="absolute top-3 right-3 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <ActionBtn
          title={note.isPinned ? 'Unpin' : 'Pin'}
          active={note.isPinned}
          onClick={(e) => {
            e.stopPropagation()
            dispatch({ type: 'TOGGLE_PIN', id: note.id })
          }}
        >
          📌
        </ActionBtn>
        <ActionBtn
          title={note.isFavorite ? 'Unfavorite' : 'Favorite'}
          active={note.isFavorite}
          onClick={(e) => {
            e.stopPropagation()
            dispatch({ type: 'TOGGLE_FAVORITE', id: note.id })
          }}
        >
          {note.isFavorite ? '⭐' : '☆'}
        </ActionBtn>
      </div>
    </article>
  )
}

function ActionBtn({
  children,
  title,
  active,
  onClick,
}: {
  children: React.ReactNode
  title: string
  active: boolean
  onClick: (e: React.MouseEvent) => void
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        'p-1 rounded text-xs leading-none transition-colors',
        active
          ? 'bg-blue-600/30 text-blue-400'
          : 'bg-zinc-800/60 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300',
      )}
    >
      {children}
    </button>
  )
}
