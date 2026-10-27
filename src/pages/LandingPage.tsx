import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";

// ⚠️ חשוב: התוכן הקבוע יושב במערכים מחוץ לקומפוננטה, כי הוא לא משתנה ואין סיבה ליצור אותו מחדש בכל רינדור
const FEATURES = [
  { title: "בלי כפילויות", text: "תמונה שכבר הועלתה מדולגת אוטומטית" },
  { title: "הצטרפות בקישור", text: "המשתתפים נכנסים עם שם בלבד, בלי הרשמה" },
  { title: "הורדה בלחיצה", text: "כל התמונות בקובץ ZIP אחד" },
];

const STEPS = ["פתיחת אלבום", "שיתוף קישור", "העלאת תמונות"];

const PREVIEW_TILES = 8;

function LandingPage() {
  const { user } = useAuth();

  return (
    <main className="landing">
      <section className="landing-hero">
        <h1>אלבומים משותפים. כל הרגעים במקום אחד.</h1>
        <p>אלבום משותף לאירוע: כל המשתתפים מעלים תמונות למקום אחד, בלי כפילויות.</p>
        <div className="landing-actions">
          <Link to="/albums/new" className="btn btn-primary">פתיחת אלבום חדש</Link>
          {user && <Link to="/albums" className="btn btn-secondary">לאלבומים שלי</Link>}
        </div>

        {/* ⚠️ מקום שמור לתמונות: כרגע אריחים ריקים, ובשלב העיצוב יוחלפו ב-<img> */}
        <div className="landing-preview" aria-hidden="true">
          {Array.from({ length: PREVIEW_TILES }, (_, i) => (
            <div key={i} className="landing-preview-tile" />
          ))}
        </div>
      </section>

      <section className="landing-features">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="landing-feature">
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </div>
        ))}
      </section>

      <section className="landing-steps">
        <h2>איך זה עובד</h2>
        <ol>
          {STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="landing-cta">
        <h2>כל התמונות מהאירוע, במקום אחד.</h2>
        <Link to="/albums/new" className="btn btn-primary">פתיחת אלבום חדש</Link>
      </section>

      <footer className="landing-footer">
        <span>אלבומים משותפים · {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}

export default LandingPage;