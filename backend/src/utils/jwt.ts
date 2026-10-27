import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
}

export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as any,
    jwtid: crypto.randomUUID(),
  });
};

export const signRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d` as any,
    jwtid: crypto.randomUUID(),
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};

