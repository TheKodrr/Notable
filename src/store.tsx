import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react'
import type {
  Note,
  Category,
  NotesState,
  NotesAction,
  Priority,
} from './types'
import { DEFAULT_CATEGORIES, PRIORITY_ORDER } from './types'

const STORAGE_KEY = 'notable-data'

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function loadState(): Pick<NotesState, 'notes' | 'categories'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        notes: parsed.notes || [],
        categories: parsed.categories || [],
      }
    }
  } catch {
    // Corrupted data — reset
  }
  const categories: Category[] = DEFAULT_CATEGORIES.map((c) => ({
    ...c,
    id: generateId(),
  }))
  return { notes: [], categories }
}

function saveState(notes: Note[], categories: Category[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes, categories }))
  } catch {
    // Storage full — silently fail
  }
}

const initialState: NotesState = {
  notes: [],
  categories: [],
  selectedNoteId: null,
  searchQuery: '',
  filterView: 'all',
  filterCategoryId: null,
  filterPriority: null,
  filterTag: null,
  sortField: 'updatedAt',
  sortDirection: 'desc',
}

function reducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.state }

    case 'ADD_NOTE':
      return { ...state, notes: [action.note, ...state.notes] }

    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.note.id ? action.note : n,
        ),
      }

    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter((n) => n.id !== action.id),
        selectedNoteId:
          state.selectedNoteId === action.id ? null : state.selectedNoteId,
      }

    case 'SET_SELECTED_NOTE':
      return { ...state, selectedNoteId: action.id }

    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.category] }

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.category.id ? action.category : c,
        ),
      }

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.id),
        notes: state.notes.map((n) =>
          n.categoryId === action.id ? { ...n, categoryId: null } : n,
        ),
        filterCategoryId:
          state.filterCategoryId === action.id ? null : state.filterCategoryId,
      }

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.query }

    case 'SET_FILTER_VIEW':
      return { ...state, filterView: action.view }

    case 'SET_FILTER_CATEGORY':
      return { ...state, filterCategoryId: action.id }

    case 'SET_FILTER_PRIORITY':
      return { ...state, filterPriority: action.priority }

    case 'SET_FILTER_TAG':
      return { ...state, filterTag: action.tag }

    case 'SET_SORT':
      return { ...state, sortField: action.field, sortDirection: action.direction }

    case 'TOGGLE_PIN':
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.id ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n,
        ),
      }

    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.id ? { ...n, isFavorite: !n.isFavorite, updatedAt: new Date().toISOString() } : n,
        ),
      }

    case 'TOGGLE_ARCHIVE':
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.id ? { ...n, isArchived: !n.isArchived, updatedAt: new Date().toISOString() } : n,
        ),
      }

    default:
      return state
  }
}

interface NotesContextValue {
  state: NotesState
  dispatch: React.Dispatch<NotesAction>
  createNote: (partial?: Partial<Note>) => Note
  updateNote: (note: Note) => void
  deleteNote: (id: string) => void
  addCategory: (category: Category) => void
  updateCategory: (category: Category) => void
  deleteCategory: (id: string) => void
  getFilteredNotes: () => Note[]
  getCategory: (id: string | null) => Category | undefined
  getAllTags: () => string[]
  getOverdueNotes: () => Note[]
  getUpcomingNotes: (days?: number) => Note[]
  getRecentNotes: (count?: number) => Note[]
}

const NotesContext = createContext<NotesContextValue | null>(null)

export function NotesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const saved = loadState()
    dispatch({ type: 'LOAD_STATE', state: saved })
  }, [])

  useEffect(() => {
    if (state.notes.length > 0 || state.categories.length > 0) {
      saveState(state.notes, state.categories)
    }
  }, [state.notes, state.categories])

  const createNote = useCallback(
    (partial?: Partial<Note>): Note => {
      const now = new Date().toISOString()
      return {
        id: generateId(),
        title: '',
        content: '',
        categoryId: null,
        tags: [],
        dueDate: null,
        reminderTime: null,
        priority: 'medium' as Priority,
        isPinned: false,
        isFavorite: false,
        isArchived: false,
        checklist: [],
        attachments: [],
        createdAt: now,
        updatedAt: now,
        ...partial,
      }
    },
    [],
  )

  const updateNote = useCallback(
    (note: Note) => {
      const updated = { ...note, updatedAt: new Date().toISOString() }
      dispatch({ type: 'UPDATE_NOTE', note: updated })
    },
    [],
  )

  const deleteNote = useCallback(
    (id: string) => dispatch({ type: 'DELETE_NOTE', id }),
    [],
  )

  const addCategory = useCallback(
    (category: Category) => dispatch({ type: 'ADD_CATEGORY', category }),
    [],
  )

  const updateCategory = useCallback(
    (category: Category) => dispatch({ type: 'UPDATE_CATEGORY', category }),
    [],
  )

  const deleteCategory = useCallback(
    (id: string) => dispatch({ type: 'DELETE_CATEGORY', id }),
    [],
  )

  const getCategory = useCallback(
    (id: string | null) => state.categories.find((c) => c.id === id),
    [state.categories],
  )

  const getAllTags = useCallback(() => {
    const tagSet = new Set<string>()
    state.notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [state.notes])

  const getFilteredNotes = useCallback((): Note[] => {
    let result = [...state.notes]

    switch (state.filterView) {
      case 'favorites':
        result = result.filter((n) => n.isFavorite && !n.isArchived)
        break
      case 'archived':
        result = result.filter((n) => n.isArchived)
        break
      case 'pinned':
        result = result.filter((n) => n.isPinned && !n.isArchived)
        break
      case 'category':
        if (state.filterCategoryId) {
          result = result.filter(
            (n) => n.categoryId === state.filterCategoryId && !n.isArchived,
          )
        }
        break
      default:
        result = result.filter((n) => !n.isArchived)
    }

    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase()
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }

    if (state.filterPriority) {
      result = result.filter((n) => n.priority === state.filterPriority)
    }

    if (state.filterTag) {
      result = result.filter((n) => n.tags.includes(state.filterTag!))
    }

    result.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1

      let cmp = 0
      switch (state.sortField) {
        case 'title':
          cmp = a.title.localeCompare(b.title) || b.updatedAt.localeCompare(a.updatedAt)
          break
        case 'createdAt':
          cmp = b.createdAt.localeCompare(a.createdAt)
          break
        case 'dueDate': {
          const da = a.dueDate ?? '9999'
          const db = b.dueDate ?? '9999'
          cmp = da.localeCompare(db)
          break
        }
        case 'priority':
          cmp = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]
          break
        case 'updatedAt':
        default:
          cmp = b.updatedAt.localeCompare(a.updatedAt)
      }
      return state.sortDirection === 'asc' ? -cmp : cmp
    })

    return result
  }, [state])

  const getOverdueNotes = useCallback((): Note[] => {
    const now = new Date()
    return state.notes.filter((n) => {
      if (!n.dueDate || n.isArchived) return false
      return new Date(n.dueDate) < now && !isCompleted(n)
    })
  }, [state.notes])

  const getUpcomingNotes = useCallback(
    (days = 7): Note[] => {
      const now = new Date()
      const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
      return state.notes.filter((n) => {
        if (!n.dueDate || n.isArchived) return false
        const due = new Date(n.dueDate)
        return due >= now && due <= future && !isCompleted(n)
      })
    },
    [state.notes],
  )

  const getRecentNotes = useCallback(
    (count = 5): Note[] => {
      return [...state.notes]
        .filter((n) => !n.isArchived)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, count)
    },
    [state.notes],
  )

  const value: NotesContextValue = {
    state,
    dispatch,
    createNote,
    updateNote,
    deleteNote,
    addCategory,
    updateCategory,
    deleteCategory,
    getFilteredNotes,
    getCategory,
    getAllTags,
    getOverdueNotes,
    getUpcomingNotes,
    getRecentNotes,
  }

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}

export function useNotes(): NotesContextValue {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error('useNotes must be used within NotesProvider')
  return ctx
}

function isCompleted(note: Note): boolean {
  return note.checklist.length > 0 && note.checklist.every((i) => i.completed)
}
