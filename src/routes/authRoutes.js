import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshSession,
} from '../controllers/authController.js';
import {
  registerUserSchema,
  loginUserSchema,
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

export default router;
