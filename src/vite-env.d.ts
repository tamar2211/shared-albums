/// <reference types="vite/client" />

// משתני הסביבה של Vite שהאתר משתמש בהם (מוגדרים בקבצי .env.development ו-.env.production)
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
