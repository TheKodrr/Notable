import { useNavigate } from 'react-router-dom'
import { useNotes } from '../store'
import { NoteList } from '../components/NoteList'
import { SearchBar } from '../components/SearchBar'

export function ArchivePage() {
  const navigate = useNavigate()
  const { state } = useNotes()

  const archived = state.notes.filter((n) => n.isArchived)

  const searchResults = state.searchQuery
    ? archived.filter(
        (n) =>
          n.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          n.tags.some((t) =>
            t.toLowerCase().includes(state.searchQuery.toLowerCase()),
          ),
      )
    : archived

  return (
    <div className="px-4 sm:px-6 py-6 lg:py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">📦 Archive</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {archived.length} archived note{archived.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <SearchBar />
      </div>

      <NoteList
        notes={searchResults}
        onSelectNote={(id) => navigate(`/notes/${id}`)}
        emptyTitle="No archived notes"
        emptyDescription="Archive notes to keep them but hide them from the main view"
        emptyIcon="📦"
        showRestore
      />
    </div>
  )
}
