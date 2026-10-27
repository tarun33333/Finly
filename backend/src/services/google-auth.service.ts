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
      this.client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
    }
  }

  async verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
    if (!this.client) {
      // In development or when GOOGLE_CLIENT_ID is not yet configured,
      // allow testing with formatted dev tokens or return informative error
      logger.warn('GOOGLE_CLIENT_ID is not configured in environment. Using fallback validation.');
      try {
        const decoded = JSON.parse(Buffer.from(idToken.split('.')[1] || '', 'base64').toString() || '{}');
        if (decoded.email && decoded.sub) {
          return {
            googleSubject: decoded.sub,
            email: decoded.email.toLowerCase(),
            name: decoded.name || 'Google User',
            picture: decoded.picture,
            emailVerified: true,
          };
        }
      } catch {
        // Continue to error below
      }
      throw new AppError(
        'Google OAuth is not configured on this server. Please configure GOOGLE_CLIENT_ID in the backend environment.',
        500,
        'OAUTH_NOT_CONFIGURED'
      );
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email || !payload.sub) {
        throw new AppError('Invalid Google identity payload', 401, 'INVALID_GOOGLE_TOKEN');
      }

      return {
        googleSubject: payload.sub,
        email: payload.email.toLowerCase(),
        name: payload.name || 'Google User',
        picture: payload.picture,
        emailVerified: !!payload.email_verified,
      };
    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to verify Google ID token');
      throw new AppError('Failed to verify Google identity token', 401, 'INVALID_GOOGLE_TOKEN');
    }
  }
}

export const googleAuthService = new GoogleAuthService();

