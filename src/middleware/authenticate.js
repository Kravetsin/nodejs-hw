import createHttpError from 'http-errors';
import { Session } from '../models/session.js';
import { User } from '../models/user.js';

//! Authentication middleware
export const authenticate = async (req, res, next) => {
  //* 1. Check if access token cookie exists
  if (!req.cookies.accessToken) {
    throw createHttpError(401, 'Missing access token');
  }

  //* 2. Find session by access token
  const session = await Session.findOne({
    accessToken: req.cookies.accessToken,
  });

  //* 3. If session not found
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  //* 4. Check if access token is expired
  const isAccessTokenExpired =
    new Date() > new Date(session.accessTokenValidUntil);

  if (isAccessTokenExpired) {
    throw createHttpError(401, 'Access token expired');
  }

  //* 5. Find user by session's userId
  const user = await User.findById(session.userId);

  //* 6. If user not found
  if (!user) {
    throw createHttpError(401);
  }

  //* 7. If user exists, add to request
  req.user = user;

  //* 8. Pass control to the next middleware
  next();
};
