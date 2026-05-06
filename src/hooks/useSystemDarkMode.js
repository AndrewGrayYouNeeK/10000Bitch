import { useEffect } from "react";

// Syncs the <html> "dark" class with the iOS / system theme preference.
export function useSystemDarkMode() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (matches) => {
      document.documentElement.classList.toggle("dark", matches);
    };
    apply(mq.matches);
    const handler = (e) => apply(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
}