// טוקנים של אורח: מי שהצטרף לאלבום דרך קישור בלי חשבון מקבל טוקן לאלבום הזה בלבד.
// אורח יכול להיות בכמה אלבומים, ולכן שומרים אובייקט { [albumId]: token } בדפדפן.

const GUEST_TOKENS_KEY = 'guestTokens';

function readAll(): Record<string, string> {
  try {
    const raw = localStorage.getItem(GUEST_TOKENS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeAll(tokens: Record<string, string>): void {
  try {
    localStorage.setItem(GUEST_TOKENS_KEY, JSON.stringify(tokens));
  } catch {
    // הדפדפן חוסם אחסון: האורח יצטרך להצטרף שוב אחרי רענון
  }
}

export const guestTokens = {
  get(albumId: number): string | null {
    return readAll()[albumId] ?? null;
  },
  set(albumId: number, token: string): void {
    writeAll({ ...readAll(), [albumId]: token });
  },
  remove(albumId: number): void {
    const tokens = readAll();
    delete tokens[albumId];
    writeAll(tokens);
  },
};
