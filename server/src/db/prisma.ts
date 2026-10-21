// חיבור יחיד למסד הנתונים, משותף לכל השרת.
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
