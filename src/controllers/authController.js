import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { Session } from '../models/session.js';

//* User registration
export const registerUser = async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });

  //* Check if user with the given email already exists
  if (existingUser) {
    throw createHttpError(409, 'Email is already in use');
  }

  //* Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  //* Create new user
  const newUser = await User.create({ email, password: hashedPassword });

  //* Create session for the new user
  const newSession = await createSession(newUser._id);
  setSessionCookies(res, newSession);

  //* Respond with the created user (excluding password)
  res.status(201).json(newUser);
};

//* User login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  //* Check if user exists
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  //* Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid credentials');
  }

  //* Create session for the user
  await Session.deleteOne({ userId: user._id });

  //* Create new session
  const newSession = await createSession(user._id);
  setSessionCookies(res, newSession);

  //* Respond with the logged-in user (excluding password)
  res.status(200).json(user);
};
