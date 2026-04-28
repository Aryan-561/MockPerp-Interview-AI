import { Resend } from 'resend';
import { env } from '../../env.js';

const resend = new Resend(env.RESEND_API_KEY);

export const emailService = {
  async sendVerificationEmail(to: string, verificationToken: string) {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM || "noreply@resend.dev",
      to,
      subject: "Verify your email address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email</h2>
          <p>Thank you for registering! Please verify your email address by clicking the link below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
          <p style="margin-top: 20px; color: #666;">Or copy and paste this link:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p style="margin-top: 20px; color: #999; font-size: 12px;">This link expires in 24 hours.</p>
        </div>
      `,
      text: `Verify your email by visiting: ${verificationUrl}`,
    });

    if (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Failed to send verification email");
    }

    return data;
  },

  async sendWelcomeEmail(to: string, name: string) {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM || "noreply@resend.dev",
      to,
      subject: "Welcome to MockPerp!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome, ${name}!</h2>
          <p>Your email has been verified successfully. You can now login to your account.</p>
          <a href="${env.FRONTEND_URL}/login" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">
            Go to Login
          </a>
        </div>
      `,
      text: `Welcome ${name}! Your email has been verified.`,
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      throw new Error("Failed to send welcome email");
    }

    return data;
  },
};
