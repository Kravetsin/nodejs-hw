import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { Session } from '../models/session.js';
import jwt from 'jsonwebtoken';
import { sendMail } from '../utils/sendMail.js';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

//! User registration
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

//! User login
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

//! User logout
export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;

  if (sessionId) {
    await Session.findByIdAndDelete(sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).json({ message: 'Logged out successfully' });
};

//! Refresh session
export const refreshSession = async (req, res) => {
  const session = await Session.findOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  //* Validate session
  if (!session) {
    throw createHttpError(401, 'Invalid session');
  }

  //* Check if refresh token is expired
  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  //* If expired, throw error
  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session has expired');
  }

  //* Create new session and set cookies
  await Session.deleteOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  //* Create new session and set cookies
  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  res.status(200).json({ message: 'Session refreshed successfully' });
};

//! Request password reset
export const requestResetEmail = async (req, res) => {
  const { email } = req.body;

  //* Find user by email
  const user = await User.findOne({ email });

  //* If user not found, respond with success message to prevent email enumeration
  if (!user) {
    return res.status(200).json({
      message: 'If that email is registered, a reset link has been sent.',
    });
  }

  //* Generate reset token
  const resetToken = jwt.sign(
    { sub: user._id, email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  //* Prepare email template
  const templatePath = path.resolve('src/templates/reset-password-email.html');
  //* Read the template file
  const templateSource = await fs.readFile(templatePath, 'utf-8');
  //* Compile the template
  const template = handlebars.compile(templateSource);
  //* Generate HTML document from the template with dynamic data
  const html = template({
    name: user.username,
    link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`,
  });

  //* Send reset email
  try {
    await sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.'
    );
  }

  res.status(200).json({
    message: 'If that email is registered, a reset link has been sent.',
  });
};

//! Reset password
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  //* Verify reset token
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(400, 'Invalid or expired reset token');
  }

  //* Find user by ID and email from token payload
  const user = await User.findOne({ _id: payload.sub, email: payload.email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  //* Hash the new password
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  await User.updateOne({ _id: user._id }, { password: hashedPassword });

  //* Invalidate all existing sessions for the user
  await Session.deleteMany({ userId: user._id });

  res.status(200).json({ message: 'Password has been reset successfully' });
};
