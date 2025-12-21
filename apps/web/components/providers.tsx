"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "@workspace/ui/components/sonner"
import { store } from '@/lib/store'
import { Provider } from 'react-redux'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <Provider store={store}>
        {children}
        <Toaster />
      </Provider>
    </NextThemesProvider>
  )
}
