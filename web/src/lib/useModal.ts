import { useEffect } from "react"

/**
 * Small shared behavior for overlays: closes with Escape and locks the page
 * scroll while the overlay is open.
 */
export function useModalBehavior(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])
}
