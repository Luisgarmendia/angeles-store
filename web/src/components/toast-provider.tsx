"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { Toast, type ToastData } from "./Toast"

type ToastState = ToastData & { id: number }

interface ToastContextValue {
  showToast: (message: string, action?: { label: string; onClick: () => void }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used inside ToastProvider")
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = useCallback(
    (message: string, action?: { label: string; onClick: () => void }) => {
      setToast({
        id: Date.now(),
        message,
        actionLabel: action?.label,
        onAction: action?.onClick,
      })
    },
    [],
  )

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 4500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </ToastContext.Provider>
  )
}
