import nodemailer from 'nodemailer';
import { createTransporter } from '../config/email';

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export class EmailService {
    private static transporter: ReturnType<typeof nodemailer.createTransport>;

    static async initialize() {
        this.transporter = await createTransporter();
    }

    static async sendEmail(options: EmailOptions): Promise<void> {
        if (!this.transporter) {
            await this.initialize();
        }

        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send email');
        }
    }

    static async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 10px;
              border: 1px solid #ddd;
            }
            .header {
              text-align: center;
              color: #2c3e50;
              margin-bottom: 30px;
            }
            .content {
              background-color: white;
              padding: 25px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              background-color: #3498db;
              color: white;
              padding: 12px 25px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              color: #7f8c8d;
              font-size: 14px;
              margin-top: 30px;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset Request</h1>
            </div>

            <div class="content">
              <p>Hello,</p>

              <p>We received a request to reset your password for your Scripelle account. If you made this request, click the button below to reset your password:</p>

              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Your Password</a>
              </div>

              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #3498db;">${resetUrl}</p>

              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link will expire in 1 hour for security reasons</li>
                  <li>If you didn't request this password reset, please ignore this email</li>
                  <li>Your password will remain unchanged unless you click the link above</li>
                </ul>
              </div>

              <p>If you continue to have problems, please contact our support team.</p>

              <p>Best regards,<br>The Scripelle Team</p>
            </div>

            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} Scripelle. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        const text = `
      Password Reset Request

      Hello,

      We received a request to reset your password for your Scripelle account.

      Click the following link to reset your password:
      ${resetUrl}

      This link will expire in 1 hour for security reasons.

      If you didn't request this password reset, please ignore this email.

      Best regards,
      The Scripelle Team
    `;

        await this.sendEmail({
            to: email,
            subject: '🔒 Reset Your Password - Scripelle',
            html,
            text,
        });
    }
}
