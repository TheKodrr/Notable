import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotes } from '../store'
import { Dashboard } from '../components/Dashboard'

export function DashboardPage() {
  const navigate = useNavigate()
  const { state, createNote, dispatch } = useNotes()

  const handleCreateNote = useCallback(() => {
    const note = createNote()
    dispatch({ type: 'ADD_NOTE', note })
    navigate(`/notes/${note.id}`)
  }, [createNote, dispatch, navigate])

  return (
    <div className="px-4 sm:px-6 py-6 lg:py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Overview of your notes and reminders
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

      {state.notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-6xl mb-5">📝</span>
          <h2 className="text-xl font-semibold text-zinc-300 mb-2">
            Welcome to Notable
          </h2>
          <p className="text-zinc-500 max-w-md mb-6">
            Start by creating your first note. Use categories, tags, and
            reminders to stay organized.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleCreateNote}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
            >
              Create a Note
            </button>
            <button
              onClick={() => navigate('/categories')}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700 transition-colors"
            >
              Set Up Categories
            </button>
          </div>
        </div>
      ) : (
        <Dashboard onSelectNote={(id) => navigate(`/notes/${id}`)} />
      )}
    </div>
  )
}
