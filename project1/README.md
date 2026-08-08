<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/a4e494b9-6659-4f1c-bc7c-513fc2b2f10a

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
