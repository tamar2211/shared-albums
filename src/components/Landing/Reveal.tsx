import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
};

type RevealState = "rest" | "waiting" | "shown";

/**
 * עוטף תוכן שמופיע בעדינות כשהוא נכנס למסך בגלילה.
 * ⚠️ ברירת המחדל היא "rest": התוכן גלוי. רק תוכן שנמצא מתחת לקצה המסך ברגע הטעינה
 * מוסתר ("waiting") ומחכה לגלילה. כך שום דבר לא נשאר מוסתר אם הדפדפן לא תומך,
 * ותוכן שכבר על המסך לא מהבהב.
 */
function Reveal({ children, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<RevealState>("rest");

  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) return;
    if (element.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    setState("waiting");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal is-${state} ${className}`.trim()}>
      {children}
    </div>
  );
}

export default Reveal;
