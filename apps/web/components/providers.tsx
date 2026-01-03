"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@workspace/ui/components/sonner";
import { store } from "@/lib/store";
import { Provider } from "react-redux";
import { ImpersonationIndicator } from "@/components/auth/impersonation-indicator";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      enableColorScheme
    >
      <Provider store={store}>
        {children}
        <Toaster />
        <ImpersonationIndicator />
      </Provider>
    </NextThemesProvider>
  );
}
