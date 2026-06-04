interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 animate-fade-in"
        onClick={onCancel}
      />
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-sm text-zinc-400 mb-5">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="text-sm px-4 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              variant === 'danger'
                ? 'bg-red-600 text-white hover:bg-red-500'
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
