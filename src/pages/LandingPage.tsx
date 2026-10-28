import { useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useCycle } from "../hooks/useCycle";
import RotatingWord from "../components/Landing/RotatingWord";
import HeroCollage from "../components/Landing/HeroCollage";
import FeatureShowcase from "../components/Landing/FeatureShowcase";
import Reveal from "../components/Landing/Reveal";
import {
  HERO_SETS, HERO_WORDS, HERO_INTERVAL_MS, CATEGORIES, SAMPLE_PEOPLE, STEPS, ALL_PHOTOS, unsplash,
} from "../components/Landing/landingContent";

// קיר התמונות בסיום: 6 עמודות, בכל אחת 4 תמונות שחוזרות פעמיים כדי שהגלילה תהיה רציפה
const WALL_COLUMNS = Array.from({ length: 6 }, (_, c) =>
  Array.from({ length: 4 }, (_, r) => ALL_PHOTOS[(c * 4 + r * 3) % ALL_PHOTOS.length]),
);

function LandingPage() {
  const { user } = useAuth();
  const reduceMotion = usePrefersReducedMotion();
  const setIndex = useCycle(HERO_SETS.length, HERO_INTERVAL_MS, !reduceMotion);
  const heroSet = HERO_SETS[setIndex];

  // טעינה מוקדמת של כל תמונות הקולאז', כדי שההחלפות יהיו חלקות
  useEffect(() => {
    ALL_PHOTOS.forEach((id) => {
      const image = new Image();
      image.src = unsplash(id);
    });
  }, []);

  return (
    <main className="landing">
      <section className="landing-hero">
        <div className="landing-wrap landing-hero__grid">
          <div className="landing-hero__text">
            <span className="landing-eyebrow"><i aria-hidden="true" />אלבום משותף, בלי אפליקציה</span>
            <h1 className="landing-title">
              <span className="landing-title__line">כל התמונות של <RotatingWord words={HERO_WORDS} index={setIndex} /></span>
              <br />
              במקום אחד.
            </h1>
            <p className="landing-lede">שולחים קישור, וכל מי שהיה שם מעלה את התמונות שלו. כפילויות מסוננות לבד, והכול נשאר מסודר.</p>
            <div className="landing-actions">
              <Link to="/albums/new" className="btn btn-primary landing-btn">פתיחת אלבום חינם<i className="landing-btn__arrow" aria-hidden="true" /></Link>
              {user
                ? <Link to="/albums" className="btn btn-secondary landing-btn">לאלבומים שלי</Link>
                : <a href="#how" className="btn btn-secondary landing-btn">איך זה עובד</a>}
            </div>
            <div className="landing-proof">
              <span className="avatar-stack">
                {SAMPLE_PEOPLE.slice(0, 4).map((person, i) => (
                  <span key={i} className={`avatar avatar--${person.tone}`}>{person.initial}</span>
                ))}
              </span>
              אורחים נכנסים עם שם בלבד
            </div>
          </div>

          <HeroCollage set={heroSet} setIndex={setIndex} reduceMotion={reduceMotion} />
        </div>
      </section>

      <div className="landing-marquee" aria-label="סוגי אירועים">
        <div className="landing-marquee__track">
          {/* הרשימה מופיעה פעמיים כדי שהפס ירוץ בלולאה בלי קפיצה */}
          {[...CATEGORIES, ...CATEGORIES].map((category, i) => (
            <span key={i} aria-hidden={i >= CATEGORIES.length}>{category}</span>
          ))}
        </div>
      </div>

      <section className="landing-section" id="features">
        <div className="landing-wrap">
          <Reveal className="landing-head">
            <h2>פשוט לאורחים. מסודר בשבילכם.</h2>
            <p>בלי לאסוף תמונות אחת אחת, ובלי עשרה עותקים של אותה תמונה.</p>
          </Reveal>
          <Reveal>
            <FeatureShowcase reduceMotion={reduceMotion} />
          </Reveal>
        </div>
      </section>

      <section className="landing-section" id="how">
        <div className="landing-wrap">
          <Reveal className="landing-head">
            <h2>שלוש דקות, וכולם בפנים.</h2>
          </Reveal>
          <Reveal>
            <ol className="landing-steps">
              {STEPS.map((step) => (
                <li key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <div className="landing-wrap">
        <Reveal>
          <section className="landing-final">
            <div className="landing-final__wall" aria-hidden="true">
              {WALL_COLUMNS.map((column, c) => (
                <div key={c} className="landing-final__column">
                  {[...column, ...column].map((id, r) => (
                    <img key={r} src={unsplash(id, 400)} alt="" loading="lazy" />
                  ))}
                </div>
              ))}
            </div>
            <h2 className="landing-final__slogan">Everyone’s in<i aria-hidden="true" /></h2>
            <p>אלבום אחד, וכל מי שהיה שם מביא את הרגעים שלו.</p>
            <Link to="/albums/new" className="btn btn-primary landing-btn">פתיחת אלבום חינם<i className="landing-btn__arrow" aria-hidden="true" /></Link>
          </section>
        </Reveal>

        <footer className="landing-footer">
          <Link to="/" className="landing-footer__mark" aria-label="pixx">pixx</Link>
          <nav aria-label="קישורים בתחתית">
            <a href="#features">יתרונות</a>
            <a href="#how">איך זה עובד</a>
            {!user && <Link to="/login">התחברות</Link>}
          </nav>
          <span>© {new Date().getFullYear()}</span>
        </footer>
      </div>
    </main>
  );
}

export default LandingPage;
