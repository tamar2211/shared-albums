import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * מחזיר true כשהמשתמש ביקש במערכת ההפעלה פחות תנועה.
 * ⚠️ useSyncExternalStore מתעדכן גם אם ההגדרה משתנה בזמן שהדף פתוח.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
