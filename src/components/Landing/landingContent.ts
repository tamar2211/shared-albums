// ⚠️ כל התוכן הקבוע של דף הנחיתה יושב כאן, מחוץ לקומפוננטות, כי הוא לא משתנה בין רינדורים.
// התמונות מגיעות מ-Unsplash (רישיון חופשי לשימוש). נבחרו רק נופים, חפצים ותמונות מופשטות.

/** בונה כתובת לתמונה ב-Unsplash ברוחב המבוקש (Unsplash חותך ומכווץ בצד שלו) */
export function unsplash(id: string, width = 900): string {
  return `https://images.unsplash.com/${id}?w=${width}&q=72&auto=format&fit=crop`;
}

export type HeroSet = {
  word: string;       // המילה שמתחלפת בכותרת
  album: string;      // שם האלבום שמופיע על הקולאז'
  meta: string;       // שורת הפרטים מתחת לשם
  toastInitial: string;
  toast: string;      // ההודעה הצפה
  photos: string[];   // 5 תמונות, הראשונה תמיד בהירה כי היא בריבוע הגדול
};

export const HERO_SETS: HeroSet[] = [
  {
    word: "המפגש",
    album: "אסיפת כיתה תשפ״א",
    meta: "86 תמונות · 27 משתתפים",
    toastInitial: "ס",
    toast: "סבתא רחל הצטרפה",
    photos: [
      "photo-1758810742974-b92459867642",
      "photo-1490750967868-88aa4486c946",
      "photo-1509910110001-4e756f86fbd3",
      "photo-1768594407433-40b4b11039e8",
      "photo-1582794543139-8ac9cb0f7b11",
    ],
  },
  {
    word: "יום ההולדת",
    album: "יום הולדת 70 לסבא",
    meta: "96 תמונות · 18 משתתפים",
    toastInitial: "א",
    toast: "אבא העלה 22 תמונות",
    photos: [
      "photo-1530103862676-de8c9debad1d",
      "photo-1777120032206-7094d3ef151f",
      "photo-1513151233558-d860c5398176",
      "photo-1610670444950-0b29430891b4",
      "photo-1761296152332-88ada22be48a",
    ],
  },
  {
    word: "הטיול",
    album: "טיול משפחתי לגליל",
    meta: "128 תמונות · 9 משתתפים",
    toastInitial: "י",
    toast: "3 כפולות דולגו",
    photos: [
      "photo-1559310589-2673bfe16970",
      "photo-1432405972618-c60b0225b8f9",
      "photo-1418065460487-3e41a6c84dc5",
      "photo-1505142468610-359e7d316be0",
      "photo-1528353518104-dbd48bee7bc4",
    ],
  },
  {
    word: "החופשה בים",
    album: "חופשה באילת",
    meta: "74 תמונות · 6 משתתפים",
    toastInitial: "ד",
    toast: "דודה מירי הצטרפה",
    photos: [
      "photo-1508624217470-5ef0f947d8be",
      "photo-1513553404607-988bf2703777",
      "photo-1501898047706-55903296cd09",
      "photo-1767658598839-11136feb425c",
      "photo-1512641406448-6574e777bec6",
    ],
  },
  {
    word: "הטיול השנתי",
    album: "טיול שנתי · כיתה ח׳",
    meta: "340 תמונות · 31 משתתפים",
    toastInitial: "מ",
    toast: "המחנך שיתף קישור",
    photos: [
      "photo-1542401886-65d6c61db217",
      "photo-1488197047962-b48492212cda",
      "photo-1785270101227-b989c85cab00",
      "photo-1765498069280-b863094c17bf",
      "photo-1475274047050-1d0c0975c63e",
    ],
  },
];

/** מספר הלייקים שמופיע על כל ריבוע בקולאז' (null = בלי תגית) */
export const TILE_LIKES: (number | null)[] = [24, null, 9, null, null];

export const HERO_INTERVAL_MS = 4200;

export const CATEGORIES = [
  "חתונה", "בר מצווה", "בת מצווה", "שבע ברכות", "ברית", "יום הולדת",
  "טיול משפחתי", "טיול שנתי", "סיום שנה", "חנוכת בית", "כנס משפחה", "אירוע חברה",
];

/** אווטרים לדוגמה: אות ראשונה וגוון. רק שחור, אפורים והכחול של המותג */
export const SAMPLE_PEOPLE = [
  { initial: "ת", tone: "ink" },
  { initial: "י", tone: "brand" },
  { initial: "ש", tone: "graphite" },
  { initial: "ד", tone: "silver" },
  { initial: "ר", tone: "ink" },
] as const;

export type FeatureId = "duplicates" | "link" | "zip" | "control";

export const FEATURES: { id: FeatureId; title: string; text: string }[] = [
  { id: "duplicates", title: "תמונה אחת. פעם אחת.", text: "pixx מזהה תמונה שכבר נמצאת באלבום ומדלג עליה, גם אם עשרה אורחים העלו אותה." },
  { id: "link", title: "מצטרפים בקישור", text: "שולחים את הקישור איך שנוח, וכל אחד נכנס עם שם. בלי הרשמה ובלי אפליקציה." },
  { id: "zip", title: "הכול בקובץ אחד", text: "בוחרים כמה תמונות או את כולן, ומורידים קובץ ZIP מסודר." },
  { id: "control", title: "אתם מחליטים", text: "מי מעלה, מי מוריד ומי בכלל בפנים. אפשר לשנות בכל רגע." },
];

/** תמונות לדוגמה בהמחשות של היכולות */
export const FEATURE_PHOTOS = {
  duplicate: "photo-1559310589-2673bfe16970",
  zip: ["photo-1530103862676-de8c9debad1d", "photo-1418065460487-3e41a6c84dc5", "photo-1513553404607-988bf2703777"],
};

export const STEPS = [
  { title: "פותחים אלבום", text: "שם, תאריך וסוג האירוע." },
  { title: "שולחים קישור", text: "בהודעה, במייל או בכל דרך שנוחה לכם." },
  { title: "כולם מעלים", text: "מהטלפון או מהמחשב, והכול מתאסף למקום אחד." },
];

/** כל תמונות הקולאז' יחד, לקיר התמונות בסיום ולטעינה מוקדמת */
export const ALL_PHOTOS = HERO_SETS.flatMap((set) => set.photos);

/** ⚠️ מערך קבוע (ולא map בתוך הקומפוננטה), כדי ש-RotatingWord לא ימדוד מחדש בכל רינדור */
export const HERO_WORDS = HERO_SETS.map((set) => set.word);
