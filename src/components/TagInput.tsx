import { useState, useRef, useEffect } from 'react'
import { cn } from '../utils'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
}

export function TagInput({ tags, onChange, suggestions = [] }: TagInputProps) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s),
  )

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function addTag(tag: string) {
    const trimmed = tag.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (input.trim()) addTag(input)
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          'flex flex-wrap items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 min-h-[42px] cursor-text transition-colors',
          'focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20',
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 text-xs bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full"
          >
            #{tag}
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
              className="hover:text-red-400 transition-colors"
              aria-label={`Remove tag ${tag}`}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? 'Add tags...' : ''}
          className="flex-1 min-w-[80px] bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none py-0.5"
          aria-label="Add tags"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 py-1 animate-scale-in">
          {filteredSuggestions.slice(0, 6).map((s) => (
            <button
              key={s}
              onClick={() => addTag(s)}
              className="w-full text-left px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            >
              #{s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
