import React from "react";
import { ThemeProvider } from "./components/ThemeToggle";
import { LanguageProvider } from "./components/i18n/LanguageContext";
import PWAConfig from "./components/PWAConfig";
import { Toaster } from "@/components/ui/sonner";

export default function Layout({ children, currentPageName }) {
  return (
    <ThemeProvider defaultTheme="dark">
      <LanguageProvider>
        <PWAConfig />
        <div className="min-h-screen bg-background">
          {children}
          <Toaster position="top-center" richColors closeButton />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}