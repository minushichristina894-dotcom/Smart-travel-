const {
  isBrevoConfigured,
  sendEmail,
  sendVerificationEmail,
  setHttpClientForTests,
} = require('../utils/emailService');

describe('Brevo API email service', () => {
  afterEach(() => {
    setHttpClientForTests(null);
    process.env.BREVO_API_KEY = 'test-brevo-api-key-not-real';
    process.env.BREVO_SENDER_EMAIL = 'noreply@example.com';
  });

  test('reports missing Brevo API configuration', () => {
    delete process.env.BREVO_API_KEY;
    delete process.env.BREVO_SENDER_EMAIL;
    expect(isBrevoConfigured()).toBe(false);
  });

  test('does not send when the API key is missing', async () => {
    delete process.env.BREVO_API_KEY;
    const result = await sendEmail({ to: 'a@b.com', subject: 'x', html: '<p>x</p>' });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('BREVO_NOT_CONFIGURED');
  });

  test('successful mocked Brevo API handoff for verification OTP email', async () => {
    const post = jest.fn(async () => ({ data: { messageId: 'mock-brevo-id' } }));
    setHttpClientForTests({ post });

    const result = await sendVerificationEmail(
      { full_name: 'Nimal Perera', email: 'nimal@example.lk' },
      '482913'
    );

    expect(result.ok).toBe(true);
    expect(result.messageId).toBe('mock-brevo-id');
    expect(post).toHaveBeenCalledTimes(1);
    const [url, payload, options] = post.mock.calls[0];
    expect(url).toContain('api.brevo.com/v3/smtp/email');
    expect(payload.to[0].email).toBe('nimal@example.lk');
    expect(payload.htmlContent).toContain('482913');
    expect(payload.textContent).toContain('482913');
    expect(options.headers['api-key']).toBe('test-brevo-api-key-not-real');
  });

  test('handles Brevo API provider failure', async () => {
    setHttpClientForTests({
      post: async () => {
        const err = new Error('Request failed');
        err.response = { status: 401, data: { message: 'Key not found' } };
        throw err;
      },
    });
    const result = await sendEmail({ to: 'a@b.com', subject: 'x', html: '<p>x</p>', text: 'x' });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/key not found/i);
  });
});
