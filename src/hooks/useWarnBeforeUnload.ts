import { useEffect } from "react";
export function useWarnBeforeUnload(when: boolean)
{
    useEffect(() => {
  if (!when) return;              // לא שומרים: לא מאזינים בכלל

  function handleBeforeUnload(event: BeforeUnloadEvent) {
    event.preventDefault();           // זה מה שגורם לדפדפן לשאול
  }

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [when]);
}