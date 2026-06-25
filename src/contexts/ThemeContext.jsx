import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "snapfix_theme";

const ThemeContext = createContext({ theme: "light", toggle: () => {} });

/**
 * ThemeProvider — single source of truth for the app theme.
 * Must wrap the entire app (outside BrowserRouter and AuthProvider).
 * Applies the `dark` class to <html> and persists to localStorage.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Read the class already set by the blocking inline script in index.html.
    // This avoids a double-read of localStorage on first render.
    if (document.documentElement.classList.contains("dark")) return "dark";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") return stored;
    } catch { /* private browsing */ }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch { /* private browsing */ }
  }, [theme]);

  const toggle = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useThemeContext — consume theme state from anywhere in the tree.
 * Throws if used outside ThemeProvider.
 */
export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used inside <ThemeProvider>");
  return ctx;
}
