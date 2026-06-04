import { useNotes } from '../store'
import { cn } from '../utils'
import type { Priority, SortField } from '../types'
import { PRIORITY_LABELS } from '../types'

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'createdAt', label: 'Date Created' },
  { value: 'title', label: 'Title' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
]

export function FilterBar() {
  const { state, dispatch } = useNotes()

  const activeFilters =
    (state.filterPriority ? 1 : 0) + (state.filterTag ? 1 : 0)

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Priority filter */}
      <div className="flex items-center gap-1">
        {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
          <button
            key={p}
            onClick={() =>
              dispatch({
                type: 'SET_FILTER_PRIORITY',
                priority: state.filterPriority === p ? null : p,
              })
            }
            className={cn(
              'text-xs font-medium px-2.5 py-1 rounded-full border transition-all',
              state.filterPriority === p
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300',
            )}
          >
            {PRIORITY_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-1 ml-auto">
        <select
          value={state.sortField}
          onChange={(e) =>
            dispatch({
              type: 'SET_SORT',
              field: e.target.value as SortField,
              direction: state.sortDirection,
            })
          }
          className="text-xs bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-400 outline-none focus:border-zinc-600 appearance-none cursor-pointer"
          aria-label="Sort by"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          onClick={() =>
            dispatch({
              type: 'SET_SORT',
              field: state.sortField,
              direction: state.sortDirection === 'asc' ? 'desc' : 'asc',
            })
          }
          className="p-1.5 rounded-lg border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-colors"
          aria-label={`Sort ${state.sortDirection === 'asc' ? 'descending' : 'ascending'}`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={cn(
              'transition-transform',
              state.sortDirection === 'asc' && 'rotate-180',
            )}
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
      </div>

      {/* Clear all filters */}
      {activeFilters > 0 && (
        <button
          onClick={() => {
            dispatch({ type: 'SET_FILTER_PRIORITY', priority: null })
            dispatch({ type: 'SET_FILTER_TAG', tag: null })
          }}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
