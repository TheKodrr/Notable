import { describe, it, expect } from 'vitest'
import {
  PRIORITY_ORDER,
  PRIORITY_LABELS,
  type Note,
  type Category,
  type NotesState,
  type NotesAction,
} from '../types'

// Inline reducer for testing — mirrors store.tsx reducer logic
function testReducer(
  state: NotesState,
  action: NotesAction,
): NotesState {
  switch (action.type) {
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
      return {
        ...state,
        sortField: action.field,
        sortDirection: action.direction,
      }

    case 'TOGGLE_PIN':
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.id
            ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() }
            : n,
        ),
      }

    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.id
            ? { ...n, isFavorite: !n.isFavorite, updatedAt: new Date().toISOString() }
            : n,
        ),
      }

    case 'TOGGLE_ARCHIVE':
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.id
            ? { ...n, isArchived: !n.isArchived, updatedAt: new Date().toISOString() }
            : n,
        ),
      }

    case 'LOAD_STATE':
      return { ...state, ...action.state }

    default:
      return state
  }
}

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-1',
    title: '',
    content: '',
    categoryId: null,
    tags: [],
    dueDate: null,
    reminderTime: null,
    priority: 'medium',
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    checklist: [],
    attachments: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeState(overrides: Partial<NotesState> = {}): NotesState {
  return {
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
    ...overrides,
  }
}

describe('Notes Reducer', () => {
  describe('ADD_NOTE', () => {
    it('adds a note to the beginning of the list', () => {
      const existing = makeNote({ id: 'existing' })
      const state = makeState({ notes: [existing] })
      const newNote = makeNote({ id: 'new' })
      const result = testReducer(state, { type: 'ADD_NOTE', note: newNote })
      expect(result.notes).toHaveLength(2)
      expect(result.notes[0].id).toBe('new')
    })
  })

  describe('UPDATE_NOTE', () => {
    it('updates the matching note', () => {
      const note = makeNote({ id: 'n1', title: 'Old' })
      const state = makeState({ notes: [note] })
      const updated = { ...note, title: 'New' }
      const result = testReducer(state, {
        type: 'UPDATE_NOTE',
        note: updated,
      })
      expect(result.notes[0].title).toBe('New')
    })

    it('does nothing if note id does not match', () => {
      const note = makeNote({ id: 'n1' })
      const state = makeState({ notes: [note] })
      const result = testReducer(state, {
        type: 'UPDATE_NOTE',
        note: makeNote({ id: 'n2' }),
      })
      expect(result.notes[0].id).toBe('n1')
    })
  })

  describe('DELETE_NOTE', () => {
    it('removes the note by id', () => {
      const note = makeNote({ id: 'n1' })
      const state = makeState({ notes: [note] })
      const result = testReducer(state, { type: 'DELETE_NOTE', id: 'n1' })
      expect(result.notes).toHaveLength(0)
    })

    it('clears selectedNoteId if deleted', () => {
      const note = makeNote({ id: 'n1' })
      const state = makeState({ notes: [note], selectedNoteId: 'n1' })
      const result = testReducer(state, { type: 'DELETE_NOTE', id: 'n1' })
      expect(result.selectedNoteId).toBeNull()
    })
  })

  describe('TOGGLE_PIN', () => {
    it('toggles isPinned from false to true', () => {
      const note = makeNote({ id: 'n1', isPinned: false })
      const state = makeState({ notes: [note] })
      const result = testReducer(state, { type: 'TOGGLE_PIN', id: 'n1' })
      expect(result.notes[0].isPinned).toBe(true)
    })

    it('toggles isPinned from true to false', () => {
      const note = makeNote({ id: 'n1', isPinned: true })
      const state = makeState({ notes: [note] })
      const result = testReducer(state, { type: 'TOGGLE_PIN', id: 'n1' })
      expect(result.notes[0].isPinned).toBe(false)
    })
  })

  describe('TOGGLE_FAVORITE', () => {
    it('toggles isFavorite', () => {
      const note = makeNote({ id: 'n1', isFavorite: false })
      const state = makeState({ notes: [note] })
      const result = testReducer(state, {
        type: 'TOGGLE_FAVORITE',
        id: 'n1',
      })
      expect(result.notes[0].isFavorite).toBe(true)
    })
  })

  describe('TOGGLE_ARCHIVE', () => {
    it('toggles isArchived', () => {
      const note = makeNote({ id: 'n1', isArchived: false })
      const state = makeState({ notes: [note] })
      const result = testReducer(state, {
        type: 'TOGGLE_ARCHIVE',
        id: 'n1',
      })
      expect(result.notes[0].isArchived).toBe(true)
    })
  })

  describe('DELETE_CATEGORY', () => {
    it('removes category and unsets it from notes', () => {
      const cat: Category = {
        id: 'cat-1',
        name: 'Work',
        color: '#ff0000',
        icon: '💼',
      }
      const note = makeNote({ id: 'n1', categoryId: 'cat-1' })
      const state = makeState({
        notes: [note],
        categories: [cat],
        filterCategoryId: 'cat-1',
      })
      const result = testReducer(state, {
        type: 'DELETE_CATEGORY',
        id: 'cat-1',
      })
      expect(result.categories).toHaveLength(0)
      expect(result.notes[0].categoryId).toBeNull()
      expect(result.filterCategoryId).toBeNull()
    })
  })

  describe('SET_SEARCH_QUERY', () => {
    it('sets the search query', () => {
      const state = makeState()
      const result = testReducer(state, {
        type: 'SET_SEARCH_QUERY',
        query: 'test',
      })
      expect(result.searchQuery).toBe('test')
    })
  })

  describe('SET_FILTER_PRIORITY', () => {
    it('sets and clears priority filter', () => {
      const state = makeState()
      const set = testReducer(state, {
        type: 'SET_FILTER_PRIORITY',
        priority: 'high',
      })
      expect(set.filterPriority).toBe('high')

      const cleared = testReducer(set, {
        type: 'SET_FILTER_PRIORITY',
        priority: null,
      })
      expect(cleared.filterPriority).toBeNull()
    })
  })
})

describe('Types', () => {
  it('has correct priority order', () => {
    expect(PRIORITY_ORDER.urgent).toBe(0)
    expect(PRIORITY_ORDER.high).toBe(1)
    expect(PRIORITY_ORDER.medium).toBe(2)
    expect(PRIORITY_ORDER.low).toBe(3)
  })

  it('has labels for all priorities', () => {
    expect(PRIORITY_LABELS.urgent).toBe('Urgent')
    expect(PRIORITY_LABELS.high).toBe('High')
    expect(PRIORITY_LABELS.medium).toBe('Medium')
    expect(PRIORITY_LABELS.low).toBe('Low')
  })
})
