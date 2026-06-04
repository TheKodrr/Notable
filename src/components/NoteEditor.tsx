import { useState, useEffect, useCallback, useRef } from 'react'
import { useNotes } from '../store'
import { cn } from '../utils'
import { RichTextEditor } from './RichTextEditor'
import { TagInput } from './TagInput'
import { Checklist } from './Checklist'
import { PriorityBadge } from './PriorityBadge'
import { DueDateBadge } from './DueDateBadge'
import { CategoryBadge } from './CategoryBadge'
import { DateTimePicker } from './DateTimePicker'
import { ConfirmDialog } from './ConfirmDialog'
import { showToast } from './Toast'
import type { Note, Priority, Attachment } from '../types'
import { PRIORITY_LABELS } from '../types'

interface NoteEditorProps {
  note: Note
  onClose: () => void
}

export function NoteEditor({ note, onClose }: NoteEditorProps) {
  const { updateNote, deleteNote, dispatch, state, getCategory, getAllTags } =
    useNotes()
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [categoryId, setCategoryId] = useState<string | null>(note.categoryId)
  const [tags, setTags] = useState<string[]>(note.tags)
  const [dueDate, setDueDate] = useState(note.dueDate ?? '')
  const [reminderTime, setReminderTime] = useState(note.reminderTime ?? '')
  const [priority, setPriority] = useState<Priority>(note.priority)
  const [checklist, setChecklist] = useState(note.checklist)
  const [attachments, setAttachments] = useState<Attachment[]>(note.attachments)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDelete, setShowDelete] = useState(false)
  const [showUnsaved, setShowUnsaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const category = getCategory(categoryId)
  const allTags = getAllTags()

  // Track changes
  useEffect(() => {
    const changed =
      title !== note.title ||
      content !== note.content ||
      categoryId !== note.categoryId ||
      JSON.stringify(tags) !== JSON.stringify(note.tags) ||
      dueDate !== (note.dueDate ?? '') ||
      reminderTime !== (note.reminderTime ?? '') ||
      priority !== note.priority ||
      JSON.stringify(checklist) !== JSON.stringify(note.checklist) ||
      JSON.stringify(attachments) !== JSON.stringify(note.attachments)
    setHasChanges(changed)
  }, [
    title,
    content,
    categoryId,
    tags,
    dueDate,
    reminderTime,
    priority,
    checklist,
    attachments,
    note,
  ])

  const save = useCallback(() => {
    if (!hasChanges) return
    setIsSaving(true)
    const updated: Note = {
      ...note,
      title: title.trim(),
      content,
      categoryId,
      tags,
      dueDate: dueDate || null,
      reminderTime: reminderTime || null,
      priority,
      checklist,
      attachments,
    }
    updateNote(updated)
    setHasChanges(false)
    showToast('success', 'Note saved')
    setTimeout(() => setIsSaving(false), 600)
  }, [
    hasChanges,
    note,
    title,
    content,
    categoryId,
    tags,
    dueDate,
    reminderTime,
    priority,
    checklist,
    attachments,
    updateNote,
  ])

  function handleClose() {
    if (hasChanges) {
      setShowUnsaved(true)
    } else {
      onClose()
    }
  }

  function handleDiscardAndClose() {
    setShowUnsaved(false)
    onClose()
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        save()
      }
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [save, hasChanges])

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (dueDate && reminderTime && new Date(reminderTime) > new Date(dueDate)) {
      errs.reminderTime = 'Reminder should be before due date'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleDelete() {
    deleteNote(note.id)
    showToast('info', 'Note deleted')
    onClose()
  }

  function handleArchive() {
    dispatch({ type: 'TOGGLE_ARCHIVE', id: note.id })
    showToast('info', note.isArchived ? 'Note unarchived' : 'Note archived')
    if (!note.isArchived) onClose()
  }

  function handlePin() {
    dispatch({ type: 'TOGGLE_PIN', id: note.id })
  }

  function handleFavorite() {
    dispatch({ type: 'TOGGLE_FAVORITE', id: note.id })
  }

  function handleAttachment() {
    const url = window.prompt('Enter image or file URL:')
    if (!url || !url.trim()) return
    const isImage = /\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i.test(url.trim())
    const name = url.trim().split('/').pop() || 'attachment'
    const newAttachment: Attachment = {
      id: crypto.randomUUID(),
      name,
      url: url.trim(),
      type: isImage ? 'image' : 'file',
    }
    setAttachments([...attachments, newAttachment])
    showToast('success', 'Attachment added')
  }

  function removeAttachment(id: string) {
    setAttachments(attachments.filter((a) => a.id !== id))
  }

  return (
    <div className="flex flex-col h-full animate-slide-in-right">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 sm:px-6 py-3 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
        <button
          onClick={handleClose}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors lg:hidden"
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Pin / Favorite toggles */}
          <button
            onClick={handlePin}
            title={note.isPinned ? 'Unpin' : 'Pin'}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              note.isPinned
                ? 'text-blue-400 bg-blue-600/20'
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800',
            )}
          >
            📌
          </button>
          <button
            onClick={handleFavorite}
            title={note.isFavorite ? 'Unfavorite' : 'Favorite'}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              note.isFavorite
                ? 'text-yellow-400 bg-yellow-600/20'
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800',
            )}
          >
            {note.isFavorite ? '⭐' : '☆'}
          </button>

          {hasChanges && (
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" title="Unsaved changes" />
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Save button */}
          <button
            onClick={save}
            disabled={!hasChanges || isSaving}
            className={cn(
              'text-xs px-3 py-1.5 rounded-lg font-medium transition-all',
              hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed',
              isSaving && 'opacity-70',
            )}
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={handleArchive}
            className="text-xs px-3 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            {note.isArchived ? 'Unarchive' : 'Archive'}
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="text-xs px-3 py-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={handleClose}
            className="hidden lg:block text-xs px-3 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full bg-transparent text-2xl font-bold text-zinc-100 placeholder-zinc-700 outline-none"
          aria-label="Note title"
        />

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <select
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value || null)}
            className="text-xs bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-400 outline-none focus:border-zinc-600 cursor-pointer"
            aria-label="Category"
          >
            <option value="">No category</option>
            {state.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          {category && (
            <CategoryBadge
              name={category.name}
              color={category.color}
              icon={category.icon}
            />
          )}

          {/* Priority */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="text-xs bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-400 outline-none focus:border-zinc-600 cursor-pointer"
            aria-label="Priority"
          >
            {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>

          <PriorityBadge priority={priority} />

          {/* Metadata display */}
          {note.createdAt !== note.updatedAt && (
            <span className="text-[10px] text-zinc-600">
              Updated {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
          <span className="text-[10px] text-zinc-600">
            Created {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>

        {/* Due date & reminder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <DateTimePicker
              id="due-date"
              label="Due Date"
              value={dueDate}
              onChange={(val) => {
                setDueDate(val)
                validate()
              }}
            />
            {dueDate && (
              <div className="mt-1">
                <DueDateBadge dueDate={dueDate} />
              </div>
            )}
          </div>
          <div>
            <DateTimePicker
              id="reminder"
              label="Reminder"
              value={reminderTime}
              onChange={(val) => {
                setReminderTime(val)
                validate()
              }}
              error={errors.reminderTime}
            />
            {reminderTime && !errors.reminderTime && (
              <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                🔔 Reminder set
              </p>
            )}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">
            Tags
          </label>
          <TagInput
            tags={tags}
            onChange={setTags}
            suggestions={allTags.filter((t) => !tags.includes(t))}
          />
        </div>

        {/* Rich text content */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">
            Content
          </label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your note..."
          />
        </div>

        {/* Checklist */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-zinc-400 mb-3">
            Checklist
          </h3>
          <Checklist items={checklist} onChange={setChecklist} />
        </div>

        {/* Attachments */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-400">
              Attachments
            </h3>
            <button
              onClick={handleAttachment}
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            >
              + Add
            </button>
          </div>
          {attachments.length > 0 ? (
            <div className="space-y-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/50 group"
                >
                  {att.type === 'image' ? (
                    <div className="w-10 h-10 rounded bg-zinc-700 overflow-hidden shrink-0">
                      <img
                        src={att.url}
                        alt={att.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  ) : (
                    <span className="text-lg shrink-0">📎</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 truncate">
                      {att.name}
                    </p>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400 hover:text-blue-300 truncate block"
                    >
                      {att.url}
                    </a>
                  </div>
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all p-1"
                    aria-label="Remove attachment"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-600 text-center py-4">
              No attachments yet
            </p>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={showDelete}
        title="Delete Note"
        message={
          note.title
            ? `Are you sure you want to delete "${note.title}"? This cannot be undone.`
            : 'Are you sure you want to delete this note? This cannot be undone.'
        }
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />

      {/* Unsaved changes confirmation */}
      <ConfirmDialog
        isOpen={showUnsaved}
        title="Unsaved Changes"
        message="You have unsaved changes. Discard them and close?"
        confirmLabel="Discard"
        variant="danger"
        onConfirm={handleDiscardAndClose}
        onCancel={() => setShowUnsaved(false)}
      />
    </div>
  )
}
