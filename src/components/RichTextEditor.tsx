import { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '../utils'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const COLOR_PRESETS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6',
  '#8b5cf6', '#ec4899', '#f43f5e', '#84cc16', '#14b8a6', '#6366f1',
  '#a855f7', '#d946ef', '#f472b6', '#ffffff', '#a1a1aa', '#71717a',
  '#52525b', '#18181b',
]

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const colorBtnRef = useRef<HTMLButtonElement>(null)
  const colorPaletteRef = useRef<HTMLDivElement>(null)
  const isUpdatingRef = useRef(false)
  const [focused, setFocused] = useState(false)
  const [showColorPalette, setShowColorPalette] = useState(false)
  const [isEmpty, setIsEmpty] = useState(!content || content === '')

  // Sync external content changes into the editor (only when not focused)
  useEffect(() => {
    const editor = editorRef.current
    if (!editor || isUpdatingRef.current) return
    if (editor.innerHTML !== content) {
      editor.innerHTML = content
      setIsEmpty(!content || content === '')
    }
  }, [content])

  // Close color palette on outside click
  useEffect(() => {
    if (!showColorPalette) return
    function handleClick(e: MouseEvent) {
      if (
        colorPaletteRef.current &&
        !colorPaletteRef.current.contains(e.target as Node) &&
        colorBtnRef.current &&
        !colorBtnRef.current.contains(e.target as Node)
      ) {
        setShowColorPalette(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showColorPalette])

  // Close palette on Escape
  useEffect(() => {
    if (!showColorPalette) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowColorPalette(false)
        colorBtnRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [showColorPalette])

  const emitChange = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return
    const html = editor.innerHTML
    const text = editor.textContent?.trim() || ''
    setIsEmpty(text === '' && !html.includes('<img') && !html.includes('<hr'))
    isUpdatingRef.current = true
    onChange(html)
    requestAnimationFrame(() => {
      isUpdatingRef.current = false
    })
  }, [onChange])

  const execCmd = useCallback(
    (command: string, value?: string) => {
      const editor = editorRef.current
      if (!editor) return
      editor.focus()
      document.execCommand(command, false, value)
      emitChange()
    },
    [emitChange],
  )

  function applyColor(color: string) {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()

    // Get current selection
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      // No selection — insert colored placeholder text
      const span = document.createElement('span')
      span.style.color = color
      span.textContent = 'colored text'
      const range = selection?.getRangeAt(0)
      if (range) {
        range.deleteContents()
        range.insertNode(span)
        // Move cursor after the span
        range.setStartAfter(span)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    } else {
      // Apply color to selected text
      document.execCommand('foreColor', false, color)
    }

    setShowColorPalette(false)
    emitChange()
  }

  function insertLink() {
    const url = window.prompt('Enter URL:')
    if (!url) return
    const editor = editorRef.current
    if (!editor) return
    editor.focus()

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const selectedText = selection.toString()
    if (!selectedText) {
      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.textContent = url
      link.style.color = '#60a5fa'
      link.style.textDecoration = 'underline'

      const range = selection.getRangeAt(0)
      range.insertNode(link)
      range.setStartAfter(link)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    } else {
      document.execCommand('createLink', false, url)
      // Style the link
      const links = editor.querySelectorAll('a')
      links.forEach((a) => {
        if (a.getAttribute('href') === url) {
          a.style.color = '#60a5fa'
          a.style.textDecoration = 'underline'
          a.setAttribute('target', '_blank')
          a.setAttribute('rel', 'noopener noreferrer')
        }
      })
    }

    emitChange()
  }

  function insertCheckbox() {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.disabled = true
    checkbox.style.marginRight = '8px'
    checkbox.style.verticalAlign = 'middle'

    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.insertNode(checkbox)
      // Add a space after
      const space = document.createTextNode('\u00A0')
      range.setStartAfter(checkbox)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    }

    emitChange()
  }

  function insertDivider() {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()
    document.execCommand('insertHorizontalRule')
    emitChange()
  }

  const handleFocus = useCallback(() => {
    setFocused(true)
  }, [])

  const handleBlur = useCallback(() => {
    setFocused(false)
    emitChange()
  }, [emitChange])

  const handleInput = useCallback(() => {
    emitChange()
  }, [emitChange])

  // Handle paste to clean up unwanted formatting
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const text = e.clipboardData.getData('text/plain')
      // Insert as plain text
      document.execCommand('insertText', false, text)
      emitChange()
    },
    [emitChange],
  )

  return (
    <div
      className={cn(
        'border rounded-xl overflow-hidden transition-all',
        focused
          ? 'border-blue-500/50 ring-2 ring-blue-500/20'
          : 'border-zinc-800',
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-zinc-900 border-b border-zinc-800 flex-wrap">
        <ToolbarBtn label="Bold" onClick={() => execCmd('bold')}>
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn label="Italic" onClick={() => execCmd('italic')}>
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn label="Heading" onClick={() => execCmd('formatBlock', 'h2')}>
          H
        </ToolbarBtn>
        <ToolbarBtn
          label="Bullet List"
          onClick={() => execCmd('insertUnorderedList')}
        >
          •
        </ToolbarBtn>
        <ToolbarBtn
          label="Numbered List"
          onClick={() => execCmd('insertOrderedList')}
        >
          1.
        </ToolbarBtn>
        <ToolbarBtn label="Checkbox" onClick={insertCheckbox}>
          ☐
        </ToolbarBtn>
        <ToolbarBtn label="Link" onClick={insertLink}>
          🔗
        </ToolbarBtn>
        <ToolbarBtn label="Divider" onClick={insertDivider}>
          —
        </ToolbarBtn>

        {/* Color button */}
        <div className="relative">
          <button
            ref={colorBtnRef}
            type="button"
            onClick={() => setShowColorPalette(!showColorPalette)}
            title="Text color"
            className={cn(
              'w-7 h-7 flex items-center justify-center text-xs font-medium rounded transition-colors',
              showColorPalette
                ? 'text-blue-400 bg-blue-600/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800',
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
              <path d="M12 2a10 10 0 0 1 0 20" />
              <path d="M12 2a10 10 0 0 0 0 20" />
              <path d="M2 12h20" />
            </svg>
          </button>

          {/* Color palette dropdown */}
          {showColorPalette && (
            <div
              ref={colorPaletteRef}
              className="absolute top-full left-0 mt-1 p-3 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl z-50 animate-scale-in min-w-[220px]"
            >
              <div className="grid grid-cols-6 gap-1.5 mb-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => applyColor(color)}
                    title={color}
                    className="w-7 h-7 rounded-lg border border-zinc-600 hover:scale-110 hover:border-zinc-400 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: color }}
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-700">
                <label className="text-[10px] text-zinc-500">Custom:</label>
                <input
                  type="color"
                  onChange={(e) => {
                    if (e.target.value) applyColor(e.target.value)
                  }}
                  className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0"
                  aria-label="Custom color picker"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onPaste={handlePaste}
          className={cn(
            'w-full bg-zinc-950 text-sm text-zinc-200 px-4 py-3 outline-none min-h-[200px] leading-relaxed',
            'focus:outline-none',
            'note-content',
          )}
          style={{ resize: 'vertical', overflow: 'auto' }}
          aria-label="Note content"
        />
        {/* Placeholder */}
        {isEmpty && !focused && (
          <div
            className="absolute top-3 left-4 text-sm text-zinc-600 pointer-events-none select-none leading-relaxed"
            aria-hidden
          >
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
}

function ToolbarBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="w-7 h-7 flex items-center justify-center text-xs font-medium rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
    >
      {children}
    </button>
  )
}
