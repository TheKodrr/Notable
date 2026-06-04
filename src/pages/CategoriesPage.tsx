import { useState } from 'react'
import { useNotes } from '../store'
import { CategoryEditor } from '../components/CategoryEditor'
import { EmptyState } from '../components/EmptyState'
import type { Category } from '../types'

export function CategoriesPage() {
  const { state } = useNotes()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  function openEditor(category?: Category) {
    setEditingCategory(category ?? null)
    setEditorOpen(true)
  }

  return (
    <div className="px-4 sm:px-6 py-6 lg:py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">🏷️ Categories</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Organize your notes with categories
          </p>
        </div>
        <button
          onClick={() => openEditor()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Category
        </button>
      </div>

      {state.categories.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="No categories yet"
          description="Create categories to organize your notes by topic, project, or area of life"
          action={
            <button
              onClick={() => openEditor()}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              Create First Category
            </button>
          }
        />
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {state.categories.map((cat) => {
            const count = state.notes.filter(
              (n) => n.categoryId === cat.id && !n.isArchived,
            ).length
            return (
              <div
                key={cat.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors cursor-pointer group"
                onClick={() => openEditor(cat)}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{cat.icon}</span>
                  <div
                    className="w-3 h-3 rounded-full mt-1"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
                <h3 className="font-semibold text-zinc-200 mb-1">{cat.name}</h3>
                <p className="text-sm text-zinc-500">
                  {count} note{count !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openEditor(cat)
                  }}
                  className="mt-3 text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors"
                >
                  Edit →
                </button>
              </div>
            )
          })}
        </div>
      )}

      <CategoryEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        editingCategory={editingCategory}
      />
    </div>
  )
}
