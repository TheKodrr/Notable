import { useState, useCallback } from 'react'
import { useNavigate, useParams, Outlet } from 'react-router-dom'
import { useNotes } from '../store'
import { NoteList } from '../components/NoteList'
import { SearchBar } from '../components/SearchBar'
import { FilterBar } from '../components/FilterBar'
import { NoteEditor } from '../components/NoteEditor'

export function NotesPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { state, getFilteredNotes, createNote, dispatch, getCategory } = useNotes()

  const filteredNotes = getFilteredNotes()
  const selectedNote = state.notes.find((n) => n.id === id)
  const activeCategory = getCategory(state.filterCategoryId)

  const handleCreateNote = useCallback(() => {
    const note = createNote()
    dispatch({ type: 'ADD_NOTE', note })
    navigate(`/notes/${note.id}`)
  }, [createNote, dispatch, navigate])

  const handleClearCategory = useCallback(() => {
    dispatch({ type: 'SET_FILTER_VIEW', view: 'all' })
    dispatch({ type: 'SET_FILTER_CATEGORY', id: null })
  }, [dispatch])

  // If viewing a note on mobile, show only editor
  if (id && selectedNote) {
    return (
      <div className="lg:hidden h-screen flex flex-col">
        <NoteEditor
          note={selectedNote}
          onClose={() => {
            if (window.history.length > 1) {
              navigate(-1)
            } else {
              navigate('/notes')
            }
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* List panel */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${
          id && selectedNote ? 'hidden lg:flex lg:w-[420px] lg:flex-shrink-0 lg:border-r lg:border-zinc-800' : ''
        }`}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-zinc-800 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-100">
                  {state.filterView === 'category' && activeCategory
                    ? `${activeCategory.icon} ${activeCategory.name}`
                    : 'Notes'}
                </h1>
                {state.filterView === 'category' && activeCategory && (
                  <button
                    onClick={handleClearCategory}
                    className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
                    title="Clear category filter"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {filteredNotes.length} note
                {filteredNotes.length !== 1 ? 's' : ''}
                {state.searchQuery && ` matching "${state.searchQuery}"`}
                {state.filterView === 'category' && activeCategory && ` in ${activeCategory.name}`}
              </p>
            </div>
            <button
              onClick={handleCreateNote}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Note
            </button>
          </div>
          <SearchBar />
          <FilterBar />
        </div>

        {/* Notes grid */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <NoteList
            notes={filteredNotes}
            onSelectNote={(noteId) => navigate(`/notes/${noteId}`)}
            emptyTitle="No notes yet"
            emptyDescription="Click 'New Note' to create your first note"
          />
        </div>
      </div>

      {/* Detail panel (desktop) */}
      {id && selectedNote && (
        <div className="hidden lg:flex flex-1 flex-col min-w-0">
          <NoteEditor
            note={selectedNote}
            onClose={() => navigate('/notes')}
          />
        </div>
      )}

      {/* Empty selection on desktop */}
      {!id && (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-zinc-950/50">
          <div className="text-center">
            <span className="text-5xl block mb-4">📝</span>
            <p className="text-zinc-500 text-sm">
              Select a note or create a new one
            </p>
            <button
              onClick={handleCreateNote}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              Create Note
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
