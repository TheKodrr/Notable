import { useState, useRef, useEffect } from 'react'
import { useNotes } from '../store'
import { cn } from '../utils'

export function SearchBar() {
  const { state, dispatch } = useNotes()
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur()
        dispatch({ type: 'SET_SEARCH_QUERY', query: '' })
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [dispatch])

  return (
    <div className="relative">
      <div
        className={cn(
          'flex items-center gap-2.5 bg-zinc-900 border rounded-lg px-3.5 py-2.5 transition-all duration-200',
          focused
            ? 'border-blue-500/50 ring-2 ring-blue-500/20'
            : 'border-zinc-800 hover:border-zinc-700',
        )}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-zinc-500 shrink-0"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={state.searchQuery}
          onChange={(e) =>
            dispatch({ type: 'SET_SEARCH_QUERY', query: e.target.value })
          }
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search notes..."
          className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none"
          aria-label="Search notes"
        />
        {state.searchQuery && (
          <button
            onClick={() => dispatch({ type: 'SET_SEARCH_QUERY', query: '' })}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
        {!focused && !state.searchQuery && (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        )}
      </div>
    </div>
  )
}
