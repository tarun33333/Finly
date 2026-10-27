import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (env.EMAIL_PROVIDER === 'smtp' && env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      });
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const link = `${env.APP_DEEP_LINK}verify-email?token=${token}`;
    logger.info({ email, link, token }, `[EmailService] Verification Token: ${token}`);

    if (process.env.NODE_ENV === 'test' || env.EMAIL_PROVIDER === 'console' || !this.transporter) {
      console.log('\n=================== EMAIL VERIFICATION ===================');
      console.log(`To: ${email}`);
      console.log(`Verification Token: ${token}`);
      console.log(`Direct Link: ${link}`);
      console.log('==========================================================\n');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject: 'Verify your Finly account',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px;">
            <h2 style="color: #635BFF;">Welcome to Finly</h2>
            <p>Please verify your email address to complete your registration.</p>
            <p>Your verification code: <strong>${token}</strong></p>
            <a href="${link}" style="display:inline-block; padding: 12px 24px; background-color: #635BFF; color: #fff; text-decoration: none; border-radius: 8px;">Verify Email</a>
          </div>
        `,
      });
    } catch (err) {
      logger.error({ err, email }, 'Failed to deliver verification email');
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const link = `${env.APP_DEEP_LINK}reset-password?token=${token}`;
    logger.info({ email, link, token }, `[EmailService] Password Reset Token: ${token}`);

    if (process.env.NODE_ENV === 'test' || env.EMAIL_PROVIDER === 'console' || !this.transporter) {
      console.log('\n=================== PASSWORD RESET ===================');
      console.log(`To: ${email}`);
      console.log(`Password Reset Token: ${token}`);
      console.log(`Direct Link: ${link}`);
      console.log('======================================================\n');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject: 'Reset your Finly password',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px;">
            <h2 style="color: #635BFF;">Finly Password Reset</h2>
            <p>You requested to reset your password. Use the code or click the link below:</p>
            <p>Reset code: <strong>${token}</strong></p>
            <a href="${link}" style="display:inline-block; padding: 12px 24px; background-color: #635BFF; color: #fff; text-decoration: none; border-radius: 8px;">Reset Password</a>
            <p>This code will expire in 1 hour. If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });
    } catch (err) {
      logger.error({ err, email }, 'Failed to deliver password reset email');
    }
  }
}

export const emailService = new EmailService();

