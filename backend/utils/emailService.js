const axios = require('axios');
const nodemailer = require('nodemailer');

const CLIENT_URL = () => process.env.CLIENT_URL || 'http://localhost:5173';
const BREVO_SEND_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_ACCOUNT_URL = 'https://api.brevo.com/v3/account';

let injectedHttp = null;
let smtpTransporter = null;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getBrevoConfig() {
  const apiKey = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.GMAIL_USER;
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  return {
    apiKey,
    senderEmail,
    senderName: process.env.BREVO_SENDER_NAME || 'Smart Travel Planner',
    smtpHost: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
    smtpPort: parseInt(process.env.BREVO_SMTP_PORT || '587', 10),
    smtpUser: process.env.BREVO_SMTP_USERNAME || senderEmail,
    gmailUser: process.env.GMAIL_USER || senderEmail,
    gmailPass,
    useGmail: !!(gmailPass && (process.env.GMAIL_USER || senderEmail)),
    useSmtp: !String(process.env.BREVO_API_KEY || '').startsWith('xkeysib-')
      && (String(apiKey || '').startsWith('xsmtpsib-') || !!process.env.BREVO_SMTP_KEY),
  };
}

const isBrevoConfigured = () => {
  const { apiKey, senderEmail, useGmail } = getBrevoConfig();
  return !!((apiKey && senderEmail) || useGmail);
};

function getSmtpTransporter() {
  if (smtpTransporter) return smtpTransporter;
  const { smtpHost, smtpPort, smtpUser, apiKey } = getBrevoConfig();
  smtpTransporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false,
    requireTLS: true,
    auth: { user: smtpUser, pass: apiKey },
  });
  return smtpTransporter;
}

/** @deprecated use isBrevoConfigured — kept so older imports keep working */
const isSmtpConfigured = isBrevoConfigured;

const setHttpClientForTests = (client) => {
  injectedHttp = client || null;
};

const httpPost = async (url, payload, headers) => {
  if (injectedHttp?.post) return injectedHttp.post(url, payload, { headers });
  return axios.post(url, payload, { headers, timeout: 15000 });
};

const httpGet = async (url, headers) => {
  if (injectedHttp?.get) return injectedHttp.get(url, { headers });
  return axios.get(url, { headers, timeout: 15000 });
};

const verifyBrevoConnection = async () => {
  if (!isBrevoConfigured()) {
    return {
      ok: false,
      mode: 'unconfigured',
      message: 'Brevo is not configured. Set BREVO_API_KEY or BREVO_SMTP_KEY, and BREVO_SENDER_EMAIL.',
    };
  }
  const cfg = getBrevoConfig();
  if (cfg.useSmtp) {
    try {
      await getSmtpTransporter().verify();
      return { ok: true, mode: 'brevo-smtp', message: 'Real emails enabled via Brevo SMTP' };
    } catch (err) {
      return { ok: false, mode: 'smtp-error', message: err.message };
    }
  }
  try {
    await httpGet(BREVO_ACCOUNT_URL, { 'api-key': cfg.apiKey, accept: 'application/json' });
    return { ok: true, mode: 'brevo-api', message: 'Real emails enabled via Brevo API v3' };
  } catch (err) {
    const status = err.response?.status;
    const detail = err.response?.data?.message || err.message;
    return { ok: false, mode: 'api-error', message: status ? `HTTP ${status}: ${detail}` : detail };
  }
};

const verifySmtpConnection = verifyBrevoConnection;

function mapNodemailerAttachments(attachments = []) {
  return attachments.map((file) => ({
    filename: file.filename,
    content: file.content,
    contentType: file.contentType || 'application/pdf',
  }));
}

const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  if (!isBrevoConfigured()) {
    return { ok: false, error: 'Brevo is not configured.', code: 'BREVO_NOT_CONFIGURED' };
  }

  const cfg = getBrevoConfig();
  const plain = text || html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  try {
    if (cfg.useGmail) {
      const gmail = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: cfg.gmailUser, pass: cfg.gmailPass },
      });
      const info = await gmail.sendMail({
        from: `"${cfg.senderName}" <${cfg.gmailUser}>`,
        to,
        subject,
        html,
        text: plain,
        attachments: mapNodemailerAttachments(attachments),
      });
      return { ok: true, messageId: info.messageId };
    }

    if (cfg.useSmtp) {
      const info = await getSmtpTransporter().sendMail({
        from: `"${cfg.senderName}" <${cfg.senderEmail}>`,
        to,
        subject,
        html,
        text: plain,
        attachments: mapNodemailerAttachments(attachments),
      });
      return { ok: true, messageId: info.messageId };
    }

    const payload = {
      sender: { name: cfg.senderName, email: cfg.senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: plain,
    };
    if (attachments.length) {
      payload.attachment = attachments.map((file) => ({
        name: file.filename,
        content: Buffer.isBuffer(file.content) ? file.content.toString('base64') : file.content,
      }));
    }
    const response = await httpPost(BREVO_SEND_URL, payload, {
      'api-key': cfg.apiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    });
    return { ok: true, messageId: response.data?.messageId || 'brevo' };
  } catch (err) {
    const detail = err.response?.data?.message || err.message || 'Brevo rejected the message.';
    console.error('Email send failed:', detail);
    return { ok: false, error: detail };
  }
};

function verificationEmailHtml(name, otp, verifyUrl) {
  const safeName = escapeHtml(name);
  const safeOtp = escapeHtml(otp);
  const safeUrl = escapeHtml(verifyUrl);
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(180deg,#0D3B10 0%,#145218 40%,#E8F5E9 40%);background-color:#0D3B10;padding:32px 12px;margin:0">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;width:100%">
          <tr>
            <td style="padding:8px 8px 20px;text-align:center;font-family:Georgia,Times,serif;color:#ffffff">
              <div style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#C8E6C9;margin-bottom:8px">Sri Lanka</div>
              <div style="font-size:26px;font-weight:700;line-height:1.2">Smart Travel Planner</div>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(13,59,16,0.25)">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#2E7D32;padding:22px 28px;font-family:Georgia,Times,serif;color:#ffffff">
                    <h1 style="margin:0;font-size:24px;font-weight:700">Welcome to the island!</h1>
                    <p style="margin:8px 0 0;font-size:14px;color:#E8F5E9">Hi ${safeName}, great to have you on board.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px;font-family:Arial,Helvetica,sans-serif;color:#374151;font-size:15px;line-height:1.55">
                    <p style="margin:0 0 22px">Your Smart Travel Planner account is ready. Complete these steps to start booking trips with live weather risk alerts.</p>

                    <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#111827">1. Verify your account</p>
                    <p style="margin:0 0 12px">To confirm you are a real traveller, enter this 6-digit code on the website. It expires in 10 minutes.</p>
                    <p style="margin:0 0 16px;text-align:center">
                      <span style="display:inline-block;letter-spacing:10px;font-size:30px;font-weight:700;color:#0D3B10;background:#E8F5E9;border:1px solid #C8E6C9;padding:14px 22px;border-radius:12px">${safeOtp}</span>
                    </p>
                    <p style="margin:0 0 28px;text-align:center">
                      <a href="${safeUrl}" style="display:inline-block;background:#2E7D32;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:8px">Verify my account</a>
                    </p>

                    <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#111827">2. Explore destinations</p>
                    <p style="margin:0 0 16px">Browse Sigiriya, Ella, Galle, Kandy and more. Prices are in LKR with activities for every age.</p>
                    <p style="margin:0 0 28px">
                      <a href="${escapeHtml(CLIENT_URL() + '/destinations')}" style="display:inline-block;background:#ffffff;color:#2E7D32;text-decoration:none;font-weight:700;font-size:14px;padding:11px 20px;border-radius:8px;border:2px solid #2E7D32">Browse destinations</a>
                    </p>

                    <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#111827">3. Check weather risk</p>
                    <p style="margin:0 0 8px">Before you travel, our Python module classifies the forecast as <strong style="color:#2E7D32">Safe</strong>, <strong style="color:#b45309">Moderate</strong> or <strong style="color:#b91c1c">High Risk</strong>.</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#2E7D32;padding:16px 28px;text-align:center;font-family:Arial,Helvetica,sans-serif;color:#ffffff;font-size:14px;font-weight:700">
                    Great to have you on board, ${safeName}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 8px 0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#C8E6C9">
              If you did not create this account, you can ignore this email.<br>
              Smart Travel Planner — Sri Lanka
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

const sendVerificationEmail = async (user, otp) => {
  const name = user.full_name || 'traveler';
  const verifyUrl = `${CLIENT_URL()}/verify-email`;

  return sendEmail({
    to: user.email,
    subject: 'Welcome to Smart Travel Planner — verify your account',
    text: [
      `Hi ${name}, welcome to Smart Travel Planner.`,
      '',
      '1. Verify your account with this 6-digit code:',
      String(otp),
      `Open: ${verifyUrl}`,
      'This code expires in 10 minutes.',
      '',
      '2. Explore destinations across Sri Lanka.',
      '3. Check weather risk (Safe / Moderate / High) before you travel.',
      '',
      'If you did not create this account, you can ignore this email.',
    ].join('\n'),
    html: verificationEmailHtml(name, otp, verifyUrl),
  });
};

const sendRiskAlertEmail = async (user, data) => {
  const level = data.risk_level?.toUpperCase() || 'UNKNOWN';
  return sendEmail({
    to: user.email,
    subject: `Weather Risk Alert — ${data.destination} (${level})`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#2E7D32">Weather Risk Alert</h2>
        <p>Hello ${escapeHtml(user.full_name)},</p>
        <p><strong>Destination:</strong> ${escapeHtml(data.destination)}</p>
        <p><strong>Travel date:</strong> ${escapeHtml(data.travel_date)}</p>
        <p><strong>Risk level:</strong> ${escapeHtml(level)}</p>
        <p><strong>Recommendation:</strong> ${escapeHtml(data.recommendation)}</p>
        <p>Temperature: ${escapeHtml(data.temperature)}°C | Rain: ${escapeHtml(data.rain_mm)}mm | Wind: ${escapeHtml(data.wind_speed_kmh)} km/h</p>
        <p style="color:#666;font-size:13px">Smart Travel Planner — Python Weather Module</p>
      </div>
    `,
  });
};

const sendTripReportEmail = async (user, report) => {
  return sendEmail({
    to: user.email,
    subject: `Trip Report — ${report.destination_name} (Booking #${report.id})`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#2E7D32">Your Trip Report</h2>
        <p>Hello ${escapeHtml(user.full_name)},</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Destination</strong></td><td>${escapeHtml(report.destination_name)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Activity</strong></td><td>${escapeHtml(report.activity_name || '—')}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Travel date</strong></td><td>${escapeHtml(report.travel_date)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Travelers</strong></td><td>${escapeHtml(report.travelers)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Total (LKR)</strong></td><td>${escapeHtml(report.total_price)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Payment</strong></td><td>${escapeHtml(report.payment_status)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Status</strong></td><td>${escapeHtml(report.status)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Weather risk</strong></td><td>${escapeHtml(report.risk_level || '—')}</td></tr>
        </table>
        <p style="margin-top:16px"><a href="${CLIENT_URL()}/trip-report/${report.id}">View full report online</a></p>
      </div>
    `,
  });
};

const sendPaymentConfirmationEmail = async (user, booking) => {
  return sendEmail({
    to: user.email,
    subject: `Payment received — Rs. ${Number(booking.total_price).toLocaleString()}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#2E7D32">Payment Successful</h2>
        <p>Hello ${escapeHtml(user.full_name)},</p>
        <p>We received your payment of <strong>Rs. ${Number(booking.total_price).toLocaleString()}</strong> for ${escapeHtml(booking.destination_name)}.</p>
        <p>Transaction ID: ${escapeHtml(booking.transaction_id)}</p>
        <p>Your booking is pending staff confirmation. You will receive a trip report when confirmed.</p>
      </div>
    `,
  });
};

module.exports = {
  isBrevoConfigured,
  isSmtpConfigured,
  verifyBrevoConnection,
  verifySmtpConnection,
  sendEmail,
  sendVerificationEmail,
  sendRiskAlertEmail,
  sendTripReportEmail,
  sendPaymentConfirmationEmail,
  setHttpClientForTests,
  getBrevoConfig,
  resetSmtpTransporter: () => { smtpTransporter = null; },
};
