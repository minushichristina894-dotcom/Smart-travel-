require('dotenv').config();
const axios = require('axios');

const key = process.env.BREVO_API_KEY;
const headers = { 'api-key': key, accept: 'application/json' };

async function main() {
  console.log('Sender in .env:', process.env.BREVO_SENDER_EMAIL);
  console.log('API key present:', !!key, key ? `(starts ${key.slice(0, 8)})` : '');

  try {
    const s = await axios.get('https://api.brevo.com/v3/senders', { headers });
    console.log('Senders raw:', JSON.stringify(s.data, null, 2));
  } catch (e) {
    console.log('Senders check failed:', e.response?.status, JSON.stringify(e.response?.data || e.message));
  }

  try {
    const ev = await axios.get('https://api.brevo.com/v3/smtp/statistics/events', {
      headers,
      params: { limit: 15, sort: 'desc' },
    });
    console.log('Events raw:', JSON.stringify(ev.data, null, 2));
  } catch (e) {
    console.log('Events check failed:', e.response?.status, JSON.stringify(e.response?.data || e.message));
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
