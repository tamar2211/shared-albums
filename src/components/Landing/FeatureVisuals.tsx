import { unsplash, FEATURE_PHOTOS, SAMPLE_PEOPLE } from "./landingContent";
import type { FeatureId } from "./landingContent";

// ⚠️ ההמחשות הן תצוגה בלבד: כל התנועה בהן מוגדרת ב-CSS, והן לא מחזיקות state.

function DuplicatesVisual() {
  const src = unsplash(FEATURE_PHOTOS.duplicate, 500);
  return (
    <div className="fx-dups">
      <img className="fx-dups__copy fx-dups__copy--left" src={src} alt="" />
      <img className="fx-dups__copy fx-dups__copy--right" src={src} alt="" />
      <img className="fx-dups__main" src={src} alt="" />
      <span className="fx-dups__tag">2 כפולות דולגו</span>
    </div>
  );
}

function LinkVisual() {
  return (
    <div className="fx-link">
      <div className="fx-link__box">
        <span>pixx.app/j/Qx7Lm2</span>
        <b>העתקה</b>
      </div>
      <div className="fx-link__people">
        {SAMPLE_PEOPLE.map((person, i) => (
          <span key={i} className={`avatar avatar--${person.tone}`}>{person.initial}</span>
        ))}
        <em>+41 הצטרפו</em>
      </div>
    </div>
  );
}

function ZipVisual() {
  return (
    <div className="fx-zip">
      {FEATURE_PHOTOS.zip.map((id) => (
        <img key={id} className="fx-zip__photo" src={unsplash(id, 240)} alt="" />
      ))}
      <div className="fx-zip__file">
        <i>ZIP</i>
        <div>
          <strong>album.zip</strong>
          <small>212 תמונות</small>
        </div>
      </div>
    </div>
  );
}

function ControlVisual() {
  return (
    <div className="fx-panel">
      <div className="fx-panel__head">ניהול אלבום<i>×</i></div>
      <div className="fx-panel__tabs"><span className="is-active">הרשאות</span><span>משתתפים</span><span>קישור</span></div>
      <div className="fx-panel__row">
        <div>אורחים מעלים תמונות<small>כל מי שבפנים יכול להוסיף</small></div>
        <span className="fx-switch is-on" />
      </div>
      <div className="fx-panel__row">
        <div>אורחים מורידים תמונות<small>כולל הורדה של הכול כ-ZIP</small></div>
        <span className="fx-switch fx-switch--auto" />
      </div>
      <div className="fx-panel__foot">
        <span className="avatar-stack">
          {SAMPLE_PEOPLE.slice(0, 3).map((person, i) => (
            <span key={i} className={`avatar avatar--sm avatar--${person.tone}`}>{person.initial}</span>
          ))}
        </span>
        9 משתתפים באלבום
      </div>
    </div>
  );
}

export function FeatureVisual({ id }: { id: FeatureId }) {
  switch (id) {
    case "duplicates": return <DuplicatesVisual />;
    case "link": return <LinkVisual />;
    case "zip": return <ZipVisual />;
    case "control": return <ControlVisual />;
  }
}
