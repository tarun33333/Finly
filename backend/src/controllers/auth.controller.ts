import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';

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

