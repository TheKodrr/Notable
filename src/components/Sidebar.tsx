import { useState, useEffect, useRef, useCallback } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useNotes } from '../store'
import { cn } from '../utils'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/notes', label: 'All Notes', icon: '📝' },
  { to: '/favorites', label: 'Favorites', icon: '⭐' },
  { to: '/archive', label: 'Archive', icon: '📦' },
  { to: '/categories', label: 'Categories', icon: '🏷️' },
]

export function Sidebar() {
  const { state, dispatch, getCategory, getAllTags } = useNotes()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)

  const activeCounts = {
    all: state.notes.filter((n) => !n.isArchived).length,
    favorites: state.notes.filter((n) => n.isFavorite && !n.isArchived).length,
    archived: state.notes.filter((n) => n.isArchived).length,
    pinned: state.notes.filter((n) => n.isPinned && !n.isArchived).length,
  }

  const allTags = getAllTags()

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Close mobile sidebar on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        mobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [mobileOpen])

  // Reset filters when clicking top-level nav items
  const resetFilters = useCallback(() => {
    dispatch({ type: 'SET_FILTER_VIEW', view: 'all' })
    dispatch({ type: 'SET_FILTER_CATEGORY', id: null })
    dispatch({ type: 'SET_FILTER_PRIORITY', priority: null })
    dispatch({ type: 'SET_FILTER_TAG', tag: null })
  }, [dispatch])

  function handleCategoryClick(catId: string, isActive: boolean) {
    if (isActive) {
      // Deselect — reset to all
      resetFilters()
      if (location.pathname !== '/notes') {
        navigate('/notes')
      }
    } else {
      // Select category — clear any stale priority/tag filters so only the category filter applies
      dispatch({ type: 'SET_FILTER_PRIORITY', priority: null })
      dispatch({ type: 'SET_FILTER_TAG', tag: null })
      dispatch({ type: 'SET_FILTER_VIEW', view: 'category' })
      dispatch({ type: 'SET_FILTER_CATEGORY', id: catId })
      if (location.pathname !== '/notes') {
        navigate('/notes')
      }
    }
  }

  function handleTagClick(tag: string) {
    // Clear category filter when filtering by tag to avoid conflicting filters
    dispatch({ type: 'SET_FILTER_VIEW', view: 'all' })
    dispatch({ type: 'SET_FILTER_CATEGORY', id: null })
    if (state.filterTag === tag) {
      dispatch({ type: 'SET_FILTER_TAG', tag: null })
    } else {
      dispatch({ type: 'SET_FILTER_TAG', tag })
      if (location.pathname !== '/notes') {
        navigate('/notes')
      }
    }
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
        aria-label="Open sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40 animate-fade-in" />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed lg:sticky top-0 left-0 z-40 h-screen bg-zinc-900/95 backdrop-blur-sm border-r border-zinc-800 flex flex-col transition-all duration-300',
          collapsed ? 'w-[60px]' : 'w-[260px]',
          mobileOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-800 shrink-0">
          {!collapsed && (
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-blue-400">Note</span>able
            </h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={cn('transition-transform', collapsed && 'rotate-180')}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const key = item.to === '/' ? 'all' : item.to.slice(1) as keyof typeof activeCounts
            const count = activeCounts[key]
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => {
                  // Clear all filters when navigating to a top-level view
                  if (item.to === '/notes') {
                    resetFilters()
                  }
                }}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                    isActive
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80',
                  )
                }
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {count !== undefined && count > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700">
                        {count}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}

          {/* Category filter section */}
          {!collapsed && (
            <>
              <div className="pt-4 pb-1 px-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                  Categories
                </p>
              </div>
              {state.categories.map((cat) => {
                const count = state.notes.filter(
                  (n) => n.categoryId === cat.id && !n.isArchived,
                ).length
                const isActive =
                  state.filterView === 'category' &&
                  state.filterCategoryId === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id, isActive)}
                    className={cn(
                      'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80',
                    )}
                  >
                    <span className="text-base shrink-0">{cat.icon}</span>
                    <span className="flex-1 truncate text-left">{cat.name}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    {count > 0 && (
                      <span className="text-xs text-zinc-500">{count}</span>
                    )}
                  </button>
                )
              })}
              {state.categories.length === 0 && (
                <p className="text-xs text-zinc-600 px-3 py-2">No categories yet</p>
              )}
            </>
          )}

          {/* Tags section */}
          {!collapsed && allTags.length > 0 && (
            <>
              <div className="pt-4 pb-1 px-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                  Tags
                </p>
              </div>
              <div className="px-2 flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-full border transition-colors',
                      state.filterTag === tag
                        ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200',
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="px-4 py-3 border-t border-zinc-800 text-xs text-zinc-600">
            <p>{state.notes.length} notes total</p>
          </div>
        )}
      </aside>
    </>
  )
}
