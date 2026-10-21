import { Router } from 'express';
import * as auth from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import { asyncHandler } from '../utils/asyncHandler';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(auth.register));
authRouter.post('/login', asyncHandler(auth.login));
authRouter.get('/me', authenticate, asyncHandler(auth.me));
