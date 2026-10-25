// מוסיף ל-Request של Express את מי שמבצע את הבקשה, כפי שנקבע לפי הטוקן:
// משתמש רשום (req.user) או משתתף שהצטרף לאלבום דרך קישור (req.participantId).

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
      participantId?: number;
    }
  }
}

export {};
