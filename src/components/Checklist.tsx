import { useState } from 'react'
import { cn } from '../utils'
import type { ChecklistItem } from '../types'

interface ChecklistProps {
  items: ChecklistItem[]
  onChange: (items: ChecklistItem[]) => void
}

export function Checklist({ items, onChange }: ChecklistProps) {
  const [newItemText, setNewItemText] = useState('')

  function toggleItem(id: string) {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    )
  }

  function updateItemText(id: string, text: string) {
    onChange(
      items.map((item) => (item.id === id ? { ...item, text } : item)),
    )
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id))
  }

  function addItem() {
    if (!newItemText.trim()) return
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        text: newItemText.trim(),
        completed: false,
      },
    ])
    setNewItemText('')
  }

  const completed = items.filter((i) => i.completed).length

  return (
    <div className="space-y-2">
      {/* Header */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
          <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{
                width: `${items.length > 0 ? Math.round((completed / items.length) * 100) : 0}%`,
              }}
            />
          </div>
          <span>
            {completed}/{items.length}
          </span>
        </div>
      )}

      {/* Items */}
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2 group">
            <button
              onClick={() => toggleItem(item.id)}
              className={cn(
                'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                item.completed
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-zinc-600 hover:border-zinc-500',
              )}
              aria-label={item.completed ? 'Uncheck' : 'Check'}
            >
              {item.completed && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateItemText(item.id, e.target.value)}
              className={cn(
                'flex-1 bg-transparent text-sm py-0.5 outline-none border-b border-transparent focus:border-zinc-700 transition-colors',
                item.completed
                  ? 'text-zinc-500 line-through'
                  : 'text-zinc-200',
              )}
              placeholder="List item..."
            />
            <button
              onClick={() => removeItem(item.id)}
              className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all p-0.5"
              aria-label="Remove item"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      {/* Add new */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addItem()
            }
          }}
          placeholder="Add an item..."
          className="flex-1 bg-zinc-800/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-300 placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors"
          aria-label="New checklist item"
        />
        <button
          onClick={addItem}
          disabled={!newItemText.trim()}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  )
}
