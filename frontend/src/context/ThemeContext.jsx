import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "itops-theme";

function getInitialTheme() {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    window.localStorage.setItem(STORAGE_KEY, theme);
    // Keep the mobile browser-chrome/status-bar tint in sync with the
    // actual page background instead of leaving it hardcoded to dark.
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#f6f7fb" : "#0b0f19");
  }, [theme]);

  function toggleTheme() {
    setTheme(t => t === "light" ? "dark" : "light");
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
