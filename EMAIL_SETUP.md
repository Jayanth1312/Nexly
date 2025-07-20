# Modern Email Setup with Resend

## Why Resend?

- ✅ Modern API (no SMTP hassles)
- ✅ 3,000 free emails per month
- ✅ No 2FA setup required
- ✅ Better deliverability
- ✅ Real-time analytics
- ✅ Simple integration

## Quick Setup (2 minutes)

### Step 1: Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up with your email (free account)
3. Verify your email
4. Go to API Keys section
5. Click "Create API Key"
6. Name it "Nexly Development"
7. Copy the API key (starts with `re_`)

### Step 2: Update .env File

Replace `your-resend-api-key` in your .env file:

```bash
RESEND_API_KEY=re_your_actual_api_key_here
EMAIL_FROM=Nexly <noreply@yourdomain.com>
```

### Step 3: Test It!

1. Start your backend: `npm start`
2. Go to http://localhost:3000/forgot-password
3. Enter any email address
4. Check the console for the reset link

## For Production

### Add Your Domain (Optional)

1. In Resend dashboard, go to Domains
2. Add your domain (e.g., nexly.com)
3. Update DNS records as instructed
4. Use `noreply@yourdomain.com` as EMAIL_FROM

### Alternative: Use Resend's Domain

For development/testing, you can use:

```bash
EMAIL_FROM=Nexly <onboarding@resend.dev>
```

## Benefits Over Gmail App Passwords

| Feature        | Gmail App Password | Resend             |
| -------------- | ------------------ | ------------------ |
| Setup Time     | 10+ minutes        | 2 minutes          |
| 2FA Required   | Yes                | No                 |
| Deliverability | Poor               | Excellent          |
| Analytics      | None               | Full dashboard     |
| Rate Limits    | Strict             | Generous           |
| Modern API     | No                 | Yes                |
| Free Tier      | Limited            | 3,000 emails/month |

## Fallback: Development Console Mode

If you don't want to set up any email service right now, the system will automatically log reset links to the console when RESEND_API_KEY is not configured.

## Test the Complete Flow

1. Create a user account at http://localhost:3000/sign-up
2. Go to http://localhost:3000/sign-in
3. Click "Reset password"
4. Enter your email
5. Check email (or console if not configured)
6. Click the reset link
7. Set a new password

That's it! Modern email setup complete! 🎉
