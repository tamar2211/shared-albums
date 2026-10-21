// שגיאה עם קוד HTTP. זורקים אותה מכל שכבה, ו-errorHandler מחזיר אותה ללקוח כ-JSON.

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const badRequest = (message: string) => new HttpError(400, message);
export const unauthorized = (message = 'צריך להתחבר כדי לבצע את הפעולה') => new HttpError(401, message);
export const forbidden = (message = 'אין לך הרשאה לבצע את הפעולה') => new HttpError(403, message);
export const notFound = (message: string) => new HttpError(404, message);
export const conflict = (message: string) => new HttpError(409, message);
