import { useState, useEffect, useCallback } from 'react'
import { cn } from '../utils'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
}

let addToastFn: ((type: ToastType, message: string) => void) | null = null

export function showToast(type: ToastType, message: string) {
  addToastFn?.(type, message)
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  useEffect(() => {
    addToastFn = addToast
    return () => {
      addToastFn = null
    }
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium animate-slide-up backdrop-blur-sm',
            toast.type === 'success' &&
              'bg-green-900/90 border-green-700/50 text-green-200',
            toast.type === 'error' &&
              'bg-red-900/90 border-red-700/50 text-red-200',
            toast.type === 'info' &&
              'bg-zinc-800/90 border-zinc-700/50 text-zinc-200',
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
