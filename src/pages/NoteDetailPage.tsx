import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNotes } from '../store'
import { NoteEditor } from '../components/NoteEditor'

export function NoteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useNotes()

  const note = state.notes.find((n) => n.id === id)

  useEffect(() => {
    if (!note && state.notes.length > 0) {
      navigate('/notes', { replace: true })
    }
  }, [note, state.notes.length, navigate])

  if (!note) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <span className="text-5xl block mb-4">🔍</span>
          <p className="text-zinc-500">Note not found</p>
          <button
            onClick={() => navigate('/notes')}
            className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Back to Notes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col max-w-4xl mx-auto">
      <NoteEditor
        note={note}
        onClose={() => navigate('/notes')}
      />
    </div>
  )
}
