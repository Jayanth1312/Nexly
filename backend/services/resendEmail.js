const { Resend } = require("resend");

class ModernEmailService {
  constructor() {
    if (
      !process.env.RESEND_API_KEY ||
      process.env.RESEND_API_KEY === "your-resend-api-key"
    ) {
      console.warn(
        "Resend API key not configured. Password reset emails will not be sent."
      );
      console.warn(
        "Please get a free API key from https://resend.com and add RESEND_API_KEY to your .env file"
      );
      console.warn(
        "Resend offers 3,000 free emails per month - perfect for development!"
      );
      this.configured = false;
      return;
    }

    this.configured = true;
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendPasswordResetEmail(email, name, resetToken) {
    // Check if email service is configured
    if (!this.configured) {
      console.log(
        `Email not configured - would send password reset to ${email}`
      );
      console.log(
        `Reset URL would be: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      );
      console.log(`Reset token: ${resetToken}`);
      throw new Error(
        "Email service not configured. Please check your Resend API key."
      );
    }

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || "Nexly <onboarding@resend.dev>",
        to: [email],
        subject: "Reset Your Nexly Password",
        html: this.generatePasswordResetHTML(name || "User", resetUrl, email),
      });

      if (error) {
        console.error("Resend API error:", error);
        throw new Error("Failed to send password reset email");
      }

      console.log(`Password reset email sent successfully to ${email}`);
      console.log(`Email ID: ${data.id}`);
      return data;
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  }

  generatePasswordResetHTML(name, resetUrl, email) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Nexly Password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .title { color: #1f2937; font-size: 24px; font-weight: 600; margin: 20px 0; }
        .content { color: #4b5563; margin-bottom: 30px; }
        .button { display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 500; margin: 20px 0, text-decoration: none; }
        .button:hover { background: #1d4ed8; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; color: #92400e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🚀 Nexly</div>
          <h1 class="title">Reset Your Password</h1>
        </div>

        <div class="content">
          <p>Hi ${name},</p>
          <p>We received a request to reset the password for your Nexly account associated with <strong>${email}</strong>.</p>
          <p>If you made this request, click the button below to reset your password:</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>This link will expire in 10 minutes</li>
              <li>Only use this link if you requested a password reset</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>

          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>

          <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
        </div>

        <div class="footer">
          <p>Best regards,<br>The Nexly Team</p>
          <p><small>This email was sent to ${email}. If you have any questions, please contact our support team.</small></p>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}

module.exports = new ModernEmailService();
