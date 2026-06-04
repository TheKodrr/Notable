import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { cn, formatDate, isOverdue, isToday, isTomorrow, getDueLabel, truncate, getChecklistProgress, highlightText, formatDateTime } from '../utils'

describe('cn (classname utility)', () => {
  it('joins truthy values', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('filters out falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b')
  })

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('')
  })
})

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2024-03-15T10:00:00.000Z')
    expect(result).toContain('Mar')
    expect(result).toContain('15')
  })

  it('returns compact format', () => {
    const now = new Date()
    const recent = new Date(now.getTime() - 5 * 60000).toISOString()
    const result = formatDate(recent, { compact: true })
    expect(result).toContain('m ago')
  })

  it('shows hours for less than a day', () => {
    const now = new Date()
    const recent = new Date(now.getTime() - 3 * 3600000).toISOString()
    const result = formatDate(recent, { compact: true })
    expect(result).toContain('h ago')
  })

  it('shows days for less than a week', () => {
    const now = new Date()
    const recent = new Date(now.getTime() - 3 * 86400000).toISOString()
    const result = formatDate(recent, { compact: true })
    expect(result).toContain('d ago')
  })
})

describe('isOverdue', () => {
  it('returns true for past dates', () => {
    expect(isOverdue('2020-01-01T00:00:00.000Z')).toBe(true)
  })

  it('returns false for future dates', () => {
    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    expect(isOverdue(future.toISOString())).toBe(false)
  })
})

describe('isToday', () => {
  it('returns true for today', () => {
    expect(isToday(new Date().toISOString())).toBe(true)
  })

  it('returns false for other days', () => {
    expect(isToday('2020-01-01T00:00:00.000Z')).toBe(false)
  })
})

describe('isTomorrow', () => {
  it('returns true for tomorrow', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(isTomorrow(tomorrow.toISOString())).toBe(true)
  })

  it('returns false for today', () => {
    expect(isTomorrow(new Date().toISOString())).toBe(false)
  })
})

describe('getDueLabel', () => {
  it('returns Overdue for past dates', () => {
    expect(getDueLabel('2020-01-01T00:00:00.000Z').text).toBe('Overdue')
    expect(getDueLabel('2020-01-01T00:00:00.000Z').urgent).toBe(true)
  })

  it('returns Today for today', () => {
    expect(getDueLabel(new Date().toISOString()).text).toBe('Today')
  })
})

describe('truncate', () => {
  it('returns full text if under max', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('truncates with ellipsis', () => {
    const result = truncate('hello world this is long', 10)
    expect(result).toHaveLength(11) // 10 chars + …
    expect(result.endsWith('…')).toBe(true)
  })
})

describe('getChecklistProgress', () => {
  it('returns zero for empty list', () => {
    expect(getChecklistProgress([])).toEqual({
      done: 0,
      total: 0,
      percent: 0,
    })
  })

  it('calculates progress correctly', () => {
    const items = [
      { id: '1', text: 'a', completed: true },
      { id: '2', text: 'b', completed: false },
      { id: '3', text: 'c', completed: true },
    ]
    expect(getChecklistProgress(items)).toEqual({
      done: 2,
      total: 3,
      percent: 67,
    })
  })

  it('returns 100 when all completed', () => {
    const items = [
      { id: '1', text: 'a', completed: true },
      { id: '2', text: 'b', completed: true },
    ]
    expect(getChecklistProgress(items).percent).toBe(100)
  })
})

describe('highlightText', () => {
  it('wraps matches in mark tags', () => {
    const result = highlightText('hello world', 'world')
    expect(result).toContain('<mark')
    expect(result).toContain('world')
  })

  it('is case insensitive', () => {
    const result = highlightText('Hello World', 'hello')
    expect(result).toContain('<mark')
  })

  it('returns original if no query', () => {
    expect(highlightText('hello', '')).toBe('hello')
  })
})

describe('formatDateTime', () => {
  it('includes time', () => {
    const result = formatDateTime('2024-03-15T14:30:00.000Z')
    expect(result).toContain('Mar')
    expect(result).toContain('15')
  })
})
