import { CheckIcon, XIcon } from "./Icons"

export interface ToastData {
  message: string
  actionLabel?: string
  onAction?: () => void
}

interface ToastProps {
  toast: ToastData
  onClose: () => void
}

export function Toast({ toast, onClose }: ToastProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4">
      <div
        className="pointer-events-auto flex w-full max-w-md animate-[toast-in_.25s_ease-out] items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-cream shadow-xl"
        role="status"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream/15">
          <CheckIcon className="h-4 w-4" />
        </span>
        <p className="min-w-0 flex-1 text-sm leading-snug">{toast.message}</p>
        {toast.actionLabel && (
          <button
            type="button"
            onClick={() => {
              toast.onAction?.()
              onClose()
            }}
            className="shrink-0 rounded-full bg-cream px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-white"
          >
            {toast.actionLabel}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar aviso"
          className="shrink-0 rounded-full p-1 text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
