"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckIcon, DownloadIcon, ShareIcon } from "@/components/Icons"

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

type InstallMode = "checking" | "installed" | "ios" | "prompt" | "manual"

function isStandalone() {
  if (typeof window === "undefined") return false
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone
  return window.matchMedia("(display-mode: standalone)").matches || iosStandalone === true
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

/** Prompts the admin to install the panel as a PWA, which iOS requires for push. */
export function InstallApp() {
  // The initial mode is derived once, during render. The effect below only
  // subscribes to browser events, so nothing calls setState synchronously.
  const [mode, setMode] = useState<InstallMode>(() => {
    if (typeof window === "undefined") return "checking"
    if (isStandalone()) return "installed"
    if (isIosDevice()) return "ios"
    return "checking"
  })
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null)

  useEffect(() => {
    if (isStandalone() || isIosDevice()) return

    const onPrompt = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as InstallPromptEvent)
      setMode("prompt")
    }

    const onInstalled = () => {
      setPromptEvent(null)
      setMode("installed")
    }

    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)

    const fallback = window.setTimeout(() => {
      setMode((current) => (current === "checking" ? "manual" : current))
    }, 1500)

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
      window.clearTimeout(fallback)
    }
  }, [])

  const install = useCallback(async () => {
    if (!promptEvent) return

    await promptEvent.prompt()
    const choice = await promptEvent.userChoice
    setPromptEvent(null)
    setMode(choice.outcome === "accepted" ? "installed" : "prompt")
  }, [promptEvent])

  return (
    <section className="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-sand p-2 text-ink">
          {mode === "installed" ? (
            <CheckIcon className="h-5 w-5" />
          ) : (
            <DownloadIcon className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Aplicación</p>
          <h3 className="font-display text-xl text-ink">Instalá el panel en tu teléfono</h3>

          {mode === "checking" && (
            <p className="mt-1 text-sm text-muted">Comprobando si ya está instalada…</p>
          )}

          {mode === "installed" && (
            <p className="mt-1 text-sm text-muted">
              Ya está instalada en este dispositivo. Abrila desde tu pantalla de inicio.
            </p>
          )}

          {mode === "prompt" && (
            <>
              <p className="mt-1 text-sm text-muted">
                Instalala para abrir el panel sin barra del navegador y recibir notificaciones.
              </p>
              <button
                type="button"
                onClick={install}
                className="mt-3 rounded-full bg-ink px-4 py-2 text-sm text-cream transition-colors hover:bg-wine"
              >
                Instalar app
              </button>
            </>
          )}

          {mode === "ios" && (
            <p className="mt-1 text-sm text-muted">
              Tocá <ShareIcon className="mx-1 inline h-4 w-4 align-text-bottom" /> y elegí
              «Agregar a pantalla de inicio». En iPhone, las notificaciones push solo funcionan
              con la app instalada.
            </p>
          )}

          {mode === "manual" && (
            <p className="mt-1 text-sm text-muted">
              Abrí el menú del navegador y elegí «Instalar app» o «Agregar a pantalla de inicio».
              En iPhone, las notificaciones push solo funcionan con la app instalada.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
