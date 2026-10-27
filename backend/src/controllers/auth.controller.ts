import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { googleAuthService } from '../services/google-auth.service';
import { sendSuccess } from '../utils/response';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, currency } = req.body;
      const result = await authService.register(name, email, password, currency);
      sendSuccess(res, result, 'Registration successful. Please verify your email.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const deviceInfo = req.headers['user-agent'];
      const result = await authService.login(email, password, deviceInfo);
      sendSuccess(res, result, 'Login successful.');
    } catch (error) {
      next(error);
    }
  }

  static async getGoogleAuthUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const url = googleAuthService.getAuthorizationUrl();
      sendSuccess(res, { url });
    } catch (error) {
      next(error);
    }
  }

  static async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.query;
      if (!code || typeof code !== 'string') {
        throw new AppError('Missing authorization code from Google', 400, 'INVALID_CODE');
      }

      const deviceInfo = req.headers['user-agent'];
      const idToken = await googleAuthService.exchangeCodeForIdToken(code);
      const result = await authService.googleAuth(idToken, deviceInfo);

      const deepLink = `${env.APP_DEEP_LINK}auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;

      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Finly - Google Sign In</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0A0D14; color: #FFF; text-align: center; }
              .card { background: #131722; padding: 40px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); max-width: 420px; width: 90%; }
              .btn { display: inline-block; background: #635BFF; color: #FFF; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2 style="margin: 0 0 10px;">Authenticated!</h2>
              <p style="color: #94A3B8; margin: 0 0 20px;">Your Google account (${result.user.email}) was verified with Finly.</p>
              <a href="${deepLink}" class="btn">Open Finly App</a>
            </div>
            <script>
              setTimeout(() => { window.location.href = "${deepLink}"; }, 400);
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      next(error);
    }
  }

  static async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idToken } = req.body;
      const deviceInfo = req.headers['user-agent'];
      const result = await authService.googleAuth(idToken, deviceInfo);
      sendSuccess(res, result, 'Google authentication successful.');
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const deviceInfo = req.headers['user-agent'];
      const tokens = await authService.refreshTokens(refreshToken, deviceInfo);
      sendSuccess(res, tokens, 'Tokens refreshed successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      sendSuccess(res, { loggedOut: true }, 'Logged out successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;
      await authService.verifyEmail(token);
      sendSuccess(res, { verified: true }, 'Email verified successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await authService.resendVerification(email);
      sendSuccess(res, { sent: true }, 'Verification email sent if account exists.');
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      sendSuccess(res, { sent: true }, 'Password reset email sent if account exists.');
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      sendSuccess(res, { reset: true }, 'Password has been reset successfully. Please login.');
    } catch (error) {
      next(error);
    }
  }
}

