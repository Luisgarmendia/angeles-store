"use client"

import { createContext, useContext, type ReactNode } from "react"
import { DEFAULT_SETTINGS } from "@/lib/settings"
import type { StoreSettings } from "@/lib/types"

const StoreSettingsContext = createContext<StoreSettings>(DEFAULT_SETTINGS)

export function useStoreSettings(): StoreSettings {
  return useContext(StoreSettingsContext)
}

export function StoreSettingsProvider({
  settings,
  children,
}: {
  settings: StoreSettings
  children: ReactNode
}) {
  return (
    <StoreSettingsContext.Provider value={settings}>{children}</StoreSettingsContext.Provider>
  )
}
