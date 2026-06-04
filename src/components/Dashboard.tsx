import { cn, formatDate, getDueLabel, getChecklistProgress, isOverdue } from '../utils'
import { useNotes } from '../store'
import type { Note } from '../types'

interface DashboardProps {
  onSelectNote: (id: string) => void
}

export function Dashboard({ onSelectNote }: DashboardProps) {
  const { getOverdueNotes, getUpcomingNotes, getRecentNotes, state, getCategory } =
    useNotes()

  const overdue = getOverdueNotes()
  const upcoming = getUpcomingNotes(7)
  const recent = getRecentNotes(5)
  const totalActive = state.notes.filter((n) => !n.isArchived).length
  const totalPinned = state.notes.filter(
    (n) => n.isPinned && !n.isArchived,
  ).length
  const totalFavorites = state.notes.filter(
    (n) => n.isFavorite && !n.isArchived,
  ).length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon="📝" label="Active Notes" value={totalActive} />
        <StatCard icon="📌" label="Pinned" value={totalPinned} />
        <StatCard icon="⭐" label="Favorites" value={totalFavorites} />
        <StatCard
          icon="⚠️"
          label="Overdue"
          value={overdue.length}
          highlight={overdue.length > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue */}
        <DashboardSection
          title="Overdue"
          icon="⚠️"
          notes={overdue}
          onSelectNote={onSelectNote}
          emptyMessage="No overdue notes — great job!"
          getCategory={getCategory}
          highlight
        />

        {/* Upcoming */}
        <DashboardSection
          title="Upcoming (7 days)"
          icon="📅"
          notes={upcoming}
          onSelectNote={onSelectNote}
          emptyMessage="Nothing due this week"
          getCategory={getCategory}
        />
      </div>

      {/* Recent */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Recently Updated
        </h2>
        <div className="space-y-2">
          {recent.length > 0 ? (
            recent.map((note) => (
              <RecentNoteRow
                key={note.id}
                note={note}
                onSelect={onSelectNote}
                getCategory={getCategory}
              />
            ))
          ) : (
            <p className="text-sm text-zinc-600 py-4">
              No notes yet — create your first one!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: string
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors',
        highlight
          ? 'bg-red-500/5 border-red-500/20'
          : 'bg-zinc-900 border-zinc-800',
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-zinc-500 font-medium">{label}</span>
      </div>
      <p
        className={cn(
          'text-2xl font-bold',
          highlight ? 'text-red-400' : 'text-zinc-100',
        )}
      >
        {value}
      </p>
    </div>
  )
}

function DashboardSection({
  title,
  icon,
  notes,
  onSelectNote,
  emptyMessage,
  getCategory,
  highlight,
}: {
  title: string
  icon: string
  notes: Note[]
  onSelectNote: (id: string) => void
  emptyMessage: string
  getCategory: (id: string | null) => { name: string; color: string; icon: string } | undefined
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        highlight ? 'border-red-500/20 bg-red-500/5' : 'border-zinc-800 bg-zinc-900',
      )}
    >
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span>{icon}</span>
        {title}
        <span className="text-xs text-zinc-600 ml-auto">
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </span>
      </h2>
      {notes.length > 0 ? (
        <div className="space-y-1.5">
          {notes.map((note) => {
            const dueLabel = note.dueDate ? getDueLabel(note.dueDate) : null
            const category = getCategory(note.categoryId)
            const progress = getChecklistProgress(note.checklist)
            return (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-800/50 transition-colors text-left group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">
                    {note.title || 'Untitled'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {category && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${category.color}20`,
                          color: category.color,
                        }}
                      >
                        {category.icon} {category.name}
                      </span>
                    )}
                    {dueLabel && (
                      <span
                        className={cn(
                          'text-[10px]',
                          dueLabel.urgent ? 'text-red-400' : 'text-zinc-500',
                        )}
                      >
                        {dueLabel.text}
                      </span>
                    )}
                  </div>
                </div>
                {progress.total > 0 && (
                  <span className="text-xs text-zinc-500">
                    {progress.done}/{progress.total}
                  </span>
                )}
                {note.isPinned && (
                  <span className="text-xs opacity-50">📌</span>
                )}
                {note.isFavorite && (
                  <span className="text-xs opacity-50">⭐</span>
                )}
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-zinc-600 py-4 text-center">
          {emptyMessage}
        </p>
      )}
    </div>
  )
}

function RecentNoteRow({
  note,
  onSelect,
  getCategory,
}: {
  note: Note
  onSelect: (id: string) => void
  getCategory: (id: string | null) => { name: string; color: string; icon: string } | undefined
}) {
  const category = getCategory(note.categoryId)
  return (
    <button
      onClick={() => onSelect(note.id)}
      className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-left group"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200 truncate">
          {note.title || 'Untitled'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {category && (
            <span className="text-[10px] text-zinc-500">
              {category.icon} {category.name}
            </span>
          )}
          <span className="text-[10px] text-zinc-600">
            {formatDate(note.updatedAt)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {note.isPinned && <span className="text-xs">📌</span>}
        {note.isFavorite && <span className="text-xs">⭐</span>}
        {note.priority === 'urgent' && <span className="text-xs">🔴</span>}
      </div>
    </button>
  )
}
