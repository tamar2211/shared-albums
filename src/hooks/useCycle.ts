import { useEffect, useState } from "react";

/**
 * מונה שמתקדם כל `intervalMs` מילישניות וחוזר להתחלה אחרי `length` צעדים.
 * כש-`enabled` הוא false (למשל כשהמשתמש ביקש פחות תנועה) המונה נשאר במקום.
 */
export function useCycle(length: number, intervalMs: number, enabled = true): number {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!enabled || length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % length), intervalMs);
    return () => window.clearInterval(id);
  }, [length, intervalMs, enabled]);

  return index;
}
