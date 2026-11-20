# Email Verification Setup (Brevo API + 6-digit OTP)

Smart Travel Planner sends a **6-digit verification code** through the **Brevo API v3**. The API key stays on the backend in `backend/.env` only. Never put it in React, frontend JavaScript, or public files.

Brevo is **not configured** until you add a real API v3 key and a verified sender, restart the backend, and a test email is accepted.

The free plan currently allows **300 emails per day**. Transactional OTP emails count toward that limit. Free-plan emails may include Brevo branding.

---

## 1. Create a Brevo account

1. Visit the [Brevo website](https://www.brevo.com) and create a free account.
2. Complete account verification.
3. Log in to the Brevo dashboard.

---

## 2. Generate an API key

1. Open **Settings → SMTP & API** (wording may vary).
2. Open **API Keys**.
3. Generate a new **API v3** key.
4. Copy it once and store it only in `backend/.env` as `BREVO_API_KEY`.

Do **not** put this key in frontend code.

---

## 3. Configure your sender email

1. Open **Senders, Domains & Dedicated IPs**.
2. Add a sender such as `noreply@yourdomain.com` or a mailbox you control.
3. Complete sender verification.
4. For production, authenticate your domain with the DNS records Brevo shows.

Use that verified address as `BREVO_SENDER_EMAIL`.

---

## 4. How verification works in this project

1. The customer registers with name, username, email, password, and phone.
2. The backend creates an **unverified** user and a random **6-digit OTP**.
3. Only a **hash** of the OTP is stored in MySQL (10-minute expiry, 5 incorrect attempts max, 60-second resend cooldown).
4. Brevo API sends the code to the user's inbox.
5. The user opens `/verify-email` and enters the code.
6. If the code is valid, `email_verified` is set to true and they can log in.

Unverified customers cannot log in. Staff and admin logins are unchanged.

---

## 5. Environment variables

```env
CLIENT_URL=http://localhost:5173
BREVO_API_KEY=your_brevo_api_v3_key
BREVO_SENDER_EMAIL=your_verified_sender_email
BREVO_SENDER_NAME=Smart Travel Planner
```

Restart the backend after changing `.env`.

If the MySQL database already exists:

```powershell
cd backend
npm run migrate:email
```

---

## 6. Test locally

```powershell
cd backend
npm run test-email you@your-inbox.com
```

Then register in the app, read the 6-digit code, and submit it on **Email Verification**.

Automated tests mock the Brevo HTTP API and do not send real mail:

```powershell
cd backend
npm test
cd ..\frontend
npm test
```

---

## 7. Troubleshooting

| Problem | What to check |
|--------|----------------|
| Email delivery is not configured | `BREVO_API_KEY` and `BREVO_SENDER_EMAIL` are set; restart backend |
| HTTP 401 from Brevo | Invalid or revoked API v3 key |
| Sender rejected | Sender email is verified in Brevo |
| Daily limit | Free plan: 300 emails/day |
| Invalid / expired code | Codes last 10 minutes; use Resend (60s cooldown) |
| Too many incorrect attempts | Request a new code after 5 failed tries |
