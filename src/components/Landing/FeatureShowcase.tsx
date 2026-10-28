import { useState } from "react";
import { FEATURES } from "./landingContent";
import { FeatureVisual } from "./FeatureVisuals";

type FeatureShowcaseProps = {
  reduceMotion: boolean;
};

/**
 * היכולות: רשימה בצד אחד ותצוגה אחת גדולה בצד השני.
 * היכולת הפעילה מתחלפת לבד כשפס ההתקדמות שלה מתמלא (ב-CSS), ואפשר גם ללחוץ.
 * ⚠️ אין כאן טיימר: האירוע onAnimationEnd של הפס הוא שמקדם לפריט הבא.
 * כך ריחוף העכבר (שעוצר את האנימציה ב-CSS) עוצר גם את ההחלפה, בלי קוד נוסף.
 */
function FeatureShowcase({ reduceMotion }: FeatureShowcaseProps) {
  const [active, setActive] = useState(0);
  // מונה שגדל בכל בחירה. משמש כ-key כדי שההמחשה והפס יתחילו מההתחלה גם כשבוחרים שוב את אותו פריט
  const [round, setRound] = useState(0);

  function select(index: number) {
    setActive(index);
    setRound((r) => r + 1);
  }

  return (
    <div className={`features ${reduceMotion ? "is-static" : ""}`.trim()}>
      <div className="features-list" role="tablist" aria-label="היכולות של pixx">
        {FEATURES.map((feature, i) => (
          <button
            key={feature.id}
            type="button"
            role="tab"
            id={`feature-tab-${feature.id}`}
            aria-selected={i === active}
            aria-controls="feature-stage"
            className={`features-item ${i === active ? "is-active" : ""}`.trim()}
            onClick={() => select(i)}
          >
            <span className="features-item__progress">
              {/* ⚠️ כשמבקשים פחות תנועה אין פס ואין החלפה אוטומטית, רק לחיצה */}
              {i === active && !reduceMotion && (
                <i key={round} onAnimationEnd={() => select((active + 1) % FEATURES.length)} />
              )}
            </span>
            <strong>{feature.title}</strong>
            <span className="features-item__text">
              <span><span>{feature.text}</span></span>
            </span>
          </button>
        ))}
      </div>

      <div className="features-stage" id="feature-stage" role="tabpanel" aria-labelledby={`feature-tab-${FEATURES[active].id}`}>
        {FEATURES.map((feature, i) => (
          <div key={feature.id} className={`features-pane ${i === active ? "is-active" : ""}`.trim()} aria-hidden={i !== active}>
            {/* ⚠️ רק ההמחשה הפעילה מקבלת key חדש, כדי שהאנימציות שלה יתחילו מההתחלה */}
            <FeatureVisual key={i === active ? `on-${round}` : "off"} id={feature.id} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeatureShowcase;
