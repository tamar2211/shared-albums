import { useEffect, useRef, useState } from "react";
import { unsplash, TILE_LIKES } from "./landingContent";
import type { HeroSet } from "./landingContent";

type CollageTileProps = {
  photo: string;
  delay: number;
  likes: number | null;
  reduceMotion: boolean;
};

/**
 * ריבוע אחד בקולאז'. כשמגיעה תמונה חדשה היא "נולדת" מנקודה כחולה:
 * הנקודה קופצת במרכז, ומתוכה התמונה החדשה נפתחת כעיגול שמתרחב עד שהיא מכסה את הריבוע.
 * ⚠️ האנימציה רצה עם Web Animations API ישירות על האלמנטים, ורק בסופה ה-state מתעדכן.
 */
function CollageTile({ photo, delay, likes, reduceMotion }: CollageTileProps) {
  const [shown, setShown] = useState(photo);
  const nextRef = useRef<HTMLImageElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const isChanging = photo !== shown;

  useEffect(() => {
    if (!isChanging) return;
    const next = nextRef.current;
    const dot = dotRef.current;
    if (reduceMotion || !next || !dot || !next.animate) {
      setShown(photo);
      return;
    }
    const ease = "cubic-bezier(.2,.8,.2,1)";
    const pop = dot.animate(
      [
        { transform: "scale(0)", opacity: 1 },
        { transform: "scale(1.2)", opacity: 1, offset: 0.45 },
        { transform: "scale(1)", opacity: 1, offset: 0.6 },
        { transform: "scale(3)", opacity: 0 },
      ],
      { duration: 900, delay, easing: ease, fill: "both" },
    );
    const open = next.animate(
      [{ clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)" }],
      { duration: 1000, delay: delay + 420, easing: "cubic-bezier(.65,0,.25,1)", fill: "forwards" },
    );
    open.onfinish = () => setShown(photo);
    return () => {
      pop.cancel();
      open.cancel();
    };
  }, [photo, isChanging, delay, reduceMotion]);

  return (
    <div className="collage-tile">
      {/* ⚠️ אותו אלמנט נשאר ורק ה-src משתנה, כדי שלא יהיה הבהוב בין התמונה הישנה לחדשה */}
      <img className="collage-photo" src={unsplash(shown)} alt="" draggable={false} />
      {isChanging && <img ref={nextRef} className="collage-photo collage-photo--next" src={unsplash(photo)} alt="" draggable={false} />}
      <span ref={dotRef} className="collage-dot" />
      {likes !== null && <span className="collage-likes">{likes}</span>}
    </div>
  );
}

type HeroCollageProps = {
  set: HeroSet;
  setIndex: number;
  reduceMotion: boolean;
};

/** הקולאז' של החלק העליון: חמש תמונות, שם האלבום והודעה צפה. הכול מתחלף יחד עם המילה בכותרת. */
function HeroCollage({ set, setIndex, reduceMotion }: HeroCollageProps) {
  const collageRef = useRef<HTMLDivElement>(null);

  // הטיה עדינה לפי מיקום העכבר. ⚠️ משנים style ישירות כדי לא לרנדר את הקומפוננטה בכל תזוזה
  useEffect(() => {
    const collage = collageRef.current;
    const hero = collage?.closest("section");
    if (!collage || !hero || reduceMotion) return;
    function handleMove(event: PointerEvent) {
      if (!collage) return;
      const rect = collage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      collage.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
    }
    function handleLeave() {
      if (collage) collage.style.transform = "";
    }
    hero.addEventListener("pointermove", handleMove);
    hero.addEventListener("pointerleave", handleLeave);
    return () => {
      hero.removeEventListener("pointermove", handleMove);
      hero.removeEventListener("pointerleave", handleLeave);
    };
  }, [reduceMotion]);

  return (
    <div className="collage" ref={collageRef} aria-hidden="true">
      {set.photos.map((photo, i) => (
        <CollageTile key={i} photo={photo} delay={i * 110} likes={TILE_LIKES[i]} reduceMotion={reduceMotion} />
      ))}

      <div className="collage-album">
        <span className="collage-album__icon" />
        {/* key מפעיל מחדש את אנימציית ההחלפה של הטקסט */}
        <div key={setIndex} className="collage-album__text">
          <strong>{set.album}</strong>
          <small>{set.meta}</small>
        </div>
      </div>

      <div key={`toast-${setIndex}`} className="collage-toast">
        <span className="collage-toast__avatar">{set.toastInitial}</span>
        {set.toast}
      </div>
    </div>
  );
}

export default HeroCollage;
