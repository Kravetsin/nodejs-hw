import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshSession,
  requestResetEmail,
} from '../controllers/authController.js';
import {
  registerUserSchema,
  loginUserSchema,
  requestResetEmailSchema,
} from '../validations/authValidation.js';

const router = Router();

//* Route for user registration
router.post('/auth/register', celebrate(registerUserSchema), registerUser);

//* Route for user login
router.post('/auth/login', celebrate(loginUserSchema), loginUser);

//* Route for user logout
router.post('/auth/logout', logoutUser);

//* Route for refreshing session
router.post('/auth/refresh', refreshSession);

//* Route for requesting password reset
router.post(
  '/auth/request-reset-email',
  celebrate(requestResetEmailSchema),
  requestResetEmail
);

export default router;
