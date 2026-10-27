import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export interface GoogleUserInfo {
  googleSubject: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
}

class GoogleAuthService {
  private client: OAuth2Client | null = null;

  constructor() {
    if (env.GOOGLE_CLIENT_ID) {
      this.client = new OAuth2Client(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        env.GOOGLE_REDIRECT_URI
      );
    }
  }

  /**
   * Generates the Google OAuth 2.0 authorization URL
   */
  getAuthorizationUrl(): string {
    if (!this.client || !env.GOOGLE_CLIENT_ID) {
      throw new AppError(
        'Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend .env',
        500,
        'OAUTH_NOT_CONFIGURED'
      );
    }

    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      prompt: 'consent',
      redirect_uri: env.GOOGLE_REDIRECT_URI,
    });
  }

  /**
   * Exchanges an authorization code for an ID token
   */
  async exchangeCodeForIdToken(code: string): Promise<string> {
    if (!this.client) {
      throw new AppError('Google OAuth is not configured on this server.', 500, 'OAUTH_NOT_CONFIGURED');
    }

    try {
      const { tokens } = await this.client.getToken(code);
      if (!tokens.id_token) {
        throw new AppError('Google did not return an identity token', 400, 'MISSING_ID_TOKEN');
      }
      return tokens.id_token;
    } catch (err: any) {
      logger.error({ err: err.message }, 'Failed to exchange authorization code for Google tokens');
      throw new AppError('Failed to exchange Google authorization code: ' + err.message, 400, 'INVALID_GOOGLE_CODE');
    }
  }

  /**
   * Verifies a Google ID token cryptographically, with dev fallback
   */
  async verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
    // 1. Attempt official Google cryptographic verification if client is configured
    if (this.client) {
      try {
        const ticket = await this.client.verifyIdToken({
          idToken,
          audience: env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (payload && payload.email && payload.sub) {
          return {
            googleSubject: payload.sub,
            email: payload.email.toLowerCase(),
            name: payload.name || 'Google User',
            picture: payload.picture,
            emailVerified: !!payload.email_verified,
          };
        }
      } catch (error: any) {
        logger.warn({ error: error.message }, 'Official Google verifyIdToken attempt failed');
        // If not in development mode, reject
        if (env.NODE_ENV !== 'development') {
          throw new AppError('Failed to verify Google identity token', 401, 'INVALID_GOOGLE_TOKEN');
        }
      }
    }

    // 2. In development mode, support formatted dev tokens
    if (env.NODE_ENV === 'development') {
      try {
        const parts = idToken.split('.');
        const b64 = parts[1] || parts[0];
        const normalized = b64.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(Buffer.from(normalized, 'base64').toString('utf8'));
        if (decoded.email && decoded.sub) {
          return {
            googleSubject: decoded.sub,
            email: decoded.email.toLowerCase(),
            name: decoded.name || 'Google User',
            picture: decoded.picture,
            emailVerified: true,
          };
        }
      } catch (err: any) {
        logger.warn({ err: err.message }, 'Failed to parse dev token in fallback');
      }
    }

    throw new AppError('Failed to verify Google identity token', 401, 'INVALID_GOOGLE_TOKEN');
  }
}

export const googleAuthService = new GoogleAuthService();
