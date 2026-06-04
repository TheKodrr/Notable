import { useNavigate } from 'react-router-dom'
import { useNotes } from '../store'
import { NoteList } from '../components/NoteList'
import { SearchBar } from '../components/SearchBar'

export function FavoritesPage() {
  const navigate = useNavigate()
  const { state, getFilteredNotes, dispatch } = useNotes()

  // Quick filter: show favorites
  const favorites = state.notes.filter((n) => n.isFavorite && !n.isArchived)

  // Apply search on top
  const searchResults = state.searchQuery
    ? favorites.filter(
        (n) =>
          n.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          n.tags.some((t) =>
            t.toLowerCase().includes(state.searchQuery.toLowerCase()),
          ),
      )
    : favorites

  return (
    <div className="px-4 sm:px-6 py-6 lg:py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">⭐ Favorites</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {favorites.length} favorite note{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <SearchBar />
      </div>

      <NoteList
        notes={searchResults}
        onSelectNote={(id) => navigate(`/notes/${id}`)}
        emptyTitle="No favorites yet"
        emptyDescription="Star notes to see them here for quick access"
        emptyIcon="⭐"
      />
    </div>
  )
}
