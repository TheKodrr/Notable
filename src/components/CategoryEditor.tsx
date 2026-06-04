import { cn } from '../utils'
import { useNotes } from '../store'
import type { Category } from '../types'
import { useState, useEffect } from 'react'

const ICON_OPTIONS = ['👤', '💼', '🏥', '💰', '📚', '🎯', '🏠', '✈️', '🎮', '🎨', '🍔', '🏋️', '🧠', '💡', '❤️', '🌟', '🔥', '📱', '🎵', '📷']

const COLOR_OPTIONS = [
  '#8b5cf6', '#3b82f6', '#06b6d4', '#22c55e', '#eab308',
  '#f97316', '#ef4444', '#ec4899', '#a855f7', '#14b8a6',
  '#64748b', '#f43f5e', '#84cc16', '#7c3aed', '#2563eb',
]

interface CategoryEditorProps {
  isOpen: boolean
  onClose: () => void
  editingCategory?: Category | null
}

export function CategoryEditor({ isOpen, onClose, editingCategory }: CategoryEditorProps) {
  const { addCategory, updateCategory, deleteCategory, state } = useNotes()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('👤')
  const [color, setColor] = useState('#8b5cf6')
  const [errors, setErrors] = useState<{ name?: string }>({})

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name)
      setColor(editingCategory.color)
      setIcon(editingCategory.icon)
    } else {
      setName('')
      setColor('#8b5cf6')
      setIcon('👤')
    }
    setErrors({})
  }, [editingCategory, isOpen])

  if (!isOpen) return null

  function validate(): boolean {
    const errs: { name?: string } = {}
    if (!name.trim()) errs.name = 'Name is required'
    else if (name.trim().length > 30) errs.name = 'Name must be 30 characters or less'
    else {
      const duplicate = state.categories.find(
        (c) =>
          c.name.toLowerCase() === name.trim().toLowerCase() &&
          c.id !== editingCategory?.id,
      )
      if (duplicate) errs.name = 'A category with this name already exists'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const trimmed = name.trim()
    if (editingCategory) {
      updateCategory({ ...editingCategory, name: trimmed, color, icon })
    } else {
      addCategory({ id: crypto.randomUUID(), name: trimmed, color, icon })
    }
    onClose()
  }

  function handleDelete() {
    if (!editingCategory) return
    const count = state.notes.filter(
      (n) => n.categoryId === editingCategory.id,
    ).length
    const msg =
      count > 0
        ? `Delete "${editingCategory.name}"? ${count} note(s) in this category will become uncategorized.`
        : `Delete "${editingCategory.name}"?`
    if (window.confirm(msg)) {
      deleteCategory(editingCategory.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
        <h2 className="text-lg font-semibold mb-5">
          {editingCategory ? 'Edit Category' : 'New Category'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="cat-name" className="block text-sm font-medium text-zinc-400 mb-1.5">
              Name
            </label>
            <input
              id="cat-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Personal, Work..."
              autoFocus
              className={cn(
                'w-full bg-zinc-800 border rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors',
                errors.name
                  ? 'border-red-500/50 focus:ring-red-500/20'
                  : 'border-zinc-700 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20',
              )}
            />
            {errors.name && (
              <p className="text-xs text-red-400 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Icon
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ICON_OPTIONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={cn(
                    'w-9 h-9 flex items-center justify-center text-lg rounded-lg border transition-all',
                    icon === i
                      ? 'border-blue-500 bg-blue-600/20 scale-110'
                      : 'border-zinc-700 hover:border-zinc-500 bg-zinc-800',
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    color === c
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-transparent hover:scale-105',
                  )}
                  style={{ backgroundColor: c }}
                                    aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-zinc-950 rounded-lg p-3 flex items-center gap-2">
            <span className="text-sm text-zinc-500">Preview:</span>
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: `${color}20`,
                color,
                border: `1px solid ${color}40`,
              }}
            >
              <span>{icon}</span>
              <span>{name || 'Category'}</span>
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            {editingCategory && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-sm text-red-400 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors mr-auto"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-sm px-4 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors ml-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            >
              {editingCategory ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
