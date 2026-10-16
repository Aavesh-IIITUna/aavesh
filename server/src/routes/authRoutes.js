import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createAuthHandlers } from '../controllers/authController.js';

export const createAuthRouter = (db) => {
  const router = Router();
  const { register, login, logout } = createAuthHandlers(db);

  router.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
  }));

  router.post('/register', register);
  router.post('/login', login);
  router.post('/logout', logout);

  return router;
};

export default createAuthRouter();
