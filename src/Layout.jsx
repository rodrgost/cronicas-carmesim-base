import React from "react";
import { ThemeProvider, ThemeToggle } from "./components/ThemeToggle";

export default function Layout({ children, currentPageName }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        {currentPageName !== "Play" && (
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
        )}
        {children}
      </div>
    </ThemeProvider>
  );
}