import { useLayoutEffect, useRef, useState } from "react";

type RotatingWordProps = {
  words: string[];
  index: number;
};

/**
 * מילה שמתחלפת בתוך הכותרת. כל המילים מונחות זו על זו, והמילה הפעילה נכנסת מלמטה
 * בזמן שהקודמת יוצאת למעלה. רוחב המסגרת עובר בהדרגה לרוחב המילה החדשה,
 * כך ששאר השורה לא קופצת.
 */
function RotatingWord({ words, index }: RotatingWordProps) {
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [widths, setWidths] = useState<number[]>([]);

  // ⚠️ מודדים אחרי שהגופן נטען, אחרת הרוחב יחושב לפי גופן החלופה
  useLayoutEffect(() => {
    const measure = () => setWidths(wordRefs.current.map((el) => el?.offsetWidth ?? 0));
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [words]);

  const previous = (index - 1 + words.length) % words.length;

  return (
    <span className="rotating-word" style={widths[index] ? { width: widths[index] } : undefined}>
      {words.map((word, i) => (
        <span
          key={word}
          ref={(el) => { wordRefs.current[i] = el; }}
          className={i === index ? "is-active" : i === previous ? "is-leaving" : ""}
          aria-hidden={i !== index}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

export default RotatingWord;
