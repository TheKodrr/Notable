export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: 'image' | 'file' | 'link'
}

export interface Note {
  id: string
  title: string
  content: string
  categoryId: string | null
  tags: string[]
  dueDate: string | null
  reminderTime: string | null
  priority: Priority
  isPinned: boolean
  isFavorite: boolean
  isArchived: boolean
  checklist: ChecklistItem[]
  attachments: Attachment[]
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string
}

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Personal', color: '#8b5cf6', icon: '👤' },
  { name: 'Work', color: '#3b82f6', icon: '💼' },
  { name: 'Health', color: '#22c55e', icon: '🏥' },
  { name: 'Finance', color: '#f59e0b', icon: '💰' },
  { name: 'Learning', color: '#ec4899', icon: '📚' },
]

export type ViewFilter = 'all' | 'favorites' | 'archived' | 'pinned' | 'category'
export type SortField = 'updatedAt' | 'createdAt' | 'title' | 'dueDate' | 'priority'
export type SortDirection = 'asc' | 'desc'

export interface NotesState {
  notes: Note[]
  categories: Category[]
  selectedNoteId: string | null
  searchQuery: string
  filterView: ViewFilter
  filterCategoryId: string | null
  filterPriority: Priority | null
  filterTag: string | null
  sortField: SortField
  sortDirection: SortDirection
}

export type NotesAction =
  | { type: 'ADD_NOTE'; note: Note }
  | { type: 'UPDATE_NOTE'; note: Note }
  | { type: 'DELETE_NOTE'; id: string }
  | { type: 'SET_SELECTED_NOTE'; id: string | null }
  | { type: 'ADD_CATEGORY'; category: Category }
  | { type: 'UPDATE_CATEGORY'; category: Category }
  | { type: 'DELETE_CATEGORY'; id: string }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'SET_FILTER_VIEW'; view: ViewFilter }
  | { type: 'SET_FILTER_CATEGORY'; id: string | null }
  | { type: 'SET_FILTER_PRIORITY'; priority: Priority | null }
  | { type: 'SET_FILTER_TAG'; tag: string | null }
  | { type: 'SET_SORT'; field: SortField; direction: SortDirection }
  | { type: 'TOGGLE_PIN'; id: string }
  | { type: 'TOGGLE_FAVORITE'; id: string }
  | { type: 'TOGGLE_ARCHIVE'; id: string }
  | { type: 'LOAD_STATE'; state: Pick<NotesState, 'notes' | 'categories'> }
