/**
 * Test real Brevo API delivery: npm run test-email you@example.com
 */
require('dotenv').config();
const { sendEmail, isBrevoConfigured, verifyBrevoConnection } = require('../utils/emailService');

const to = process.argv[2];

async function main() {
  console.log('\n--- Smart Travel Email Test (Brevo API v3) ---\n');

  if (!isBrevoConfigured()) {
    console.log('Brevo is not configured.');
    console.log('   Open backend/.env and set BREVO_API_KEY and BREVO_SENDER_EMAIL');
    console.log('   See EMAIL_SETUP.md. Keep the API key on the backend only.\n');
    process.exit(1);
  }

  const check = await verifyBrevoConnection();
  if (!check.ok) {
    console.log('Brevo API login failed:', check.message);
    console.log('   Use an API v3 key from SMTP & API, and a verified sender email.\n');
    process.exit(1);
  }

  console.log('Brevo API connected');

  const target = to || process.env.BREVO_SENDER_EMAIL;
  const result = await sendEmail({
    to: target,
    subject: 'Smart Travel Planner — Test Email',
    html: `
      <div style="font-family:sans-serif">
        <h2 style="color:#2E7D32">Email works!</h2>
        <p>Your Smart Travel Planner can send real emails through the Brevo API.</p>
      </div>
    `,
    text: 'Your Smart Travel Planner can send real emails through the Brevo API.',
  });

  if (result.ok) {
    console.log(`Test email handed off to Brevo for ${target}`);
    console.log('   Check inbox and Spam folder.\n');
  } else {
    console.log('Send failed:', result.error, '\n');
    process.exit(1);
  }
}

main();
