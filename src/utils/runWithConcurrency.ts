/**
 * מריצה פעולה אסינכרונית על כל הפריטים, עם לכל היותר `limit` פעולות בו-זמנית.
 * הפונקציה worker לא אמורה לזרוק שגיאה — כל שגיאה מטופלת בתוכה.
 */
export async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>
): Promise<void> {
  let index = 0;

  async function runNext(): Promise<void> {
    while (index < items.length) {
      const item = items[index];
      index++;
      await worker(item);
    }
  }

  const runners = Array.from({ length: Math.min(limit, items.length) }, () => runNext());
  await Promise.all(runners);
}