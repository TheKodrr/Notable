import { useMemo } from 'react'
import { useNotes } from '../store'

export function useFilteredNotes() {
  const { state } = useNotes()

  return useMemo(() => {
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

    return result
  }, [state])
}
