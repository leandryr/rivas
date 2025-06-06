// src/app/layout.tsx
"use client";

import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </NextThemesProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
