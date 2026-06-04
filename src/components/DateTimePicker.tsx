import { useState, useRef, useEffect } from 'react'
import { cn, formatDateTime } from '../utils'

interface DateTimePickerProps {
  value: string
  onChange: (isoString: string) => void
  label: string
  id: string
  error?: string
  note?: string
}

export function DateTimePicker({
  value,
  onChange,
  label,
  id,
  error,
  note,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [draftDate, setDraftDate] = useState('')
  const [draftTime, setDraftTime] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize draft from value when opening
  function open() {
    if (value) {
      const d = new Date(value)
      setDraftDate(d.toISOString().slice(0, 10))
      setDraftTime(d.toISOString().slice(11, 16))
    } else {
      const now = new Date()
      setDraftDate(now.toISOString().slice(0, 10))
      setDraftTime(now.toISOString().slice(11, 16))
    }
    setIsOpen(true)
  }

  function handleSave() {
    if (draftDate && draftTime) {
      const iso = new Date(`${draftDate}T${draftTime}:00`).toISOString()
      onChange(iso)
    } else if (draftDate) {
      const iso = new Date(`${draftDate}T23:59:00`).toISOString()
      onChange(iso)
    }
    setIsOpen(false)
  }

  function handleCancel() {
    setIsOpen(false)
  }

  function handleClear() {
    onChange('')
    setIsOpen(false)
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKey)
    }
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <label
        htmlFor={id}
        className="block text-xs font-medium text-zinc-500 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          readOnly
          value={value ? formatDateTime(value) : ''}
          placeholder="Not set"
          onClick={open}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-3 pr-10 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        />
        <button
          type="button"
          onClick={open}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          aria-label={`Pick ${label.toLowerCase()}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl animate-scale-in">
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                Date
              </label>
              <input
                type="date"
                value={draftDate}
                onChange={(e) => setDraftDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500/50 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                Time
              </label>
              <input
                type="time"
                value={draftTime}
                onChange={(e) => setDraftTime(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500/50 [color-scheme:dark]"
              />
            </div>
            {note && (
              <p className="text-[10px] text-zinc-500">{note}</p>
            )}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs px-3 py-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Clear
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-xs px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="text-xs px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}
