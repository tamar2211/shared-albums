// מוסיף ל-Request של Express את המשתמש המחובר (req.user), שנקבע לפי הטוקן.

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
    }
  }
}

export {};
