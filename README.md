

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Email OTP Setup

The forgot-password flow sends a real 6-digit OTP to the user's email when SMTP is configured.

Add these values to [.env.local](.env.local) or [.env](.env):

```env
JWT_SECRET=your-jwt-secret
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-password-or-app-password
SMTP_FROM="Manufactory ERP <your-email@example.com>"
```

If you use a Gmail address in `SMTP_USER`, the app will automatically infer `smtp.gmail.com` even when `SMTP_HOST` is omitted.

If SMTP is not configured, the server falls back to a simulated inbox for development only.
