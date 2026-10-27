import crypto from 'crypto';
import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { Category } from '../models/Category';
import { ALL_DEFAULT_CATEGORIES } from '../constants/categories';
import { hashPassword, comparePassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { emailService } from './email.service';
import { googleAuthService } from './google-auth.service';
import { AppError } from '../middleware/errorHandler';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: any;
}

class AuthService {
  /**
   * Seed default categories for a new user if not already present
   */
  async seedUserCategories(userId: mongoose.Types.ObjectId): Promise<void> {
    const existing = await Category.countDocuments({ userId });
    if (existing > 0) return;

    const categoriesToInsert = ALL_DEFAULT_CATEGORIES.map((cat) => ({
      userId,
      name: cat.name,
      type: cat.type,
      icon: cat.icon,
      color: cat.color,
      isDefault: true,
      isActive: true,
    }));

    await Category.insertMany(categoriesToInsert, { ordered: false }).catch(() => {});
  }

  /**
   * Store refresh token hash securely in DB
   */
  private async storeRefreshToken(
    userId: mongoose.Types.ObjectId,
    token: string,
    deviceInfo?: string
  ): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await RefreshToken.create({
      userId,
      tokenHash,
      expiresAt,
      deviceInfo,
    });
  }

  /**
   * Register a new user with email and password
   */
  async register(
    name: string,
    email: string,
    password: string,
    currency = 'INR'
  ): Promise<AuthTokens> {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new AppError('An account with this email address already exists.', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      currency,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Seed default categories
    await this.seedUserCategories(user._id as mongoose.Types.ObjectId);

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken);

    // Generate tokens
    const accessToken = signAccessToken({ userId: user._id.toString(), email: user.email });
    const refreshToken = signRefreshToken({ userId: user._id.toString(), email: user.email });

    await this.storeRefreshToken(user._id as mongoose.Types.ObjectId, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: user.toJSON(),
    };
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string, deviceInfo?: string): Promise<AuthTokens> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user || !user.passwordHash) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const accessToken = signAccessToken({ userId: user._id.toString(), email: user.email });
    const refreshToken = signRefreshToken({ userId: user._id.toString(), email: user.email });

    await this.storeRefreshToken(user._id as mongoose.Types.ObjectId, refreshToken, deviceInfo);

    return {
      accessToken,
      refreshToken,
      user: user.toJSON(),
    };
  }

  /**
   * Google OAuth / OIDC sign-in
   */
  async googleAuth(idToken: string, deviceInfo?: string): Promise<AuthTokens> {
    const googleUser = await googleAuthService.verifyIdToken(idToken);

    let user = await User.findOne({
      $or: [{ googleSubject: googleUser.googleSubject }, { email: googleUser.email }],
    });

    if (!user) {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        googleSubject: googleUser.googleSubject,
        emailVerified: true,
        currency: 'INR',
      });
      await this.seedUserCategories(user._id as mongoose.Types.ObjectId);
    } else if (!user.googleSubject) {
      user.googleSubject = googleUser.googleSubject;
      user.emailVerified = true;
      await user.save();
    }

    const accessToken = signAccessToken({ userId: user._id.toString(), email: user.email });
    const refreshToken = signRefreshToken({ userId: user._id.toString(), email: user.email });

    await this.storeRefreshToken(user._id as mongoose.Types.ObjectId, refreshToken, deviceInfo);

    return {
      accessToken,
      refreshToken,
      user: user.toJSON(),
    };
  }

  /**
   * Refresh token rotation: verifies existing token, checks revocation, revokes it, issues new pair
   */
  async refreshTokens(refreshToken: string, deviceInfo?: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token.', 401, 'INVALID_REFRESH_TOKEN');
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const stored = await RefreshToken.findOne({ tokenHash });

    if (!stored || stored.revoked) {
      // Possible token reuse attack; revoke all tokens for this user
      if (stored && stored.revoked) {
        await RefreshToken.updateMany({ userId: stored.userId }, { revoked: true, revokedAt: new Date() });
      }
      throw new AppError('Refresh token has been revoked or is invalid.', 401, 'REVOKED_TOKEN');
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      throw new AppError('User not found.', 401, 'USER_NOT_FOUND');
    }

    // Revoke old token and rotate
    stored.revoked = true;
    stored.revokedAt = new Date();

    const newAccessToken = signAccessToken({ userId: user._id.toString(), email: user.email });
    const newRefreshToken = signRefreshToken({ userId: user._id.toString(), email: user.email });
    const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    stored.replacedByTokenHash = newTokenHash;
    await stored.save();

    await this.storeRefreshToken(user._id as mongoose.Types.ObjectId, newRefreshToken, deviceInfo);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout user by revoking refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await RefreshToken.findOneAndUpdate(
      { tokenHash },
      { revoked: true, revokedAt: new Date() }
    );
  }

  /**
   * Verify email address with token
   */
  async verifyEmail(token: string): Promise<boolean> {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      throw new AppError('Invalid or expired verification token.', 400, 'INVALID_VERIFICATION_TOKEN');
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return true;
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<void> {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return gracefully to prevent email enumeration
      return;
    }
    if (user.emailVerified) {
      throw new AppError('Email is already verified.', 400, 'ALREADY_VERIFIED');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await emailService.sendVerificationEmail(user.email, verificationToken);
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Silently succeed to prevent email enumeration
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      throw new AppError('Invalid or expired password reset token.', 400, 'INVALID_RESET_TOKEN');
    }

    user.passwordHash = await hashPassword(newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Revoke all existing sessions for security
    await RefreshToken.updateMany({ userId: user._id }, { revoked: true, revokedAt: new Date() });
  }
}

export const authService = new AuthService();
