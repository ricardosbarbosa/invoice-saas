"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@workspace/ui/components/sonner";
import { store } from "@/lib/store";
import { Provider } from "react-redux";
import { ImpersonationIndicator } from "@/components/auth/impersonation-indicator";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <Provider store={store}>
          {children}
          <Toaster />
          <ImpersonationIndicator />
        </Provider>
      </ThemeProvider>
    </NextThemesProvider>
  );
}
