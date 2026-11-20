const bcrypt = require('bcryptjs');
const { createMockPool } = require('./mockPool');
const { resetRateLimits } = require('../utils/rateLimit');
const { hashOtp } = require('../utils/verificationTokens');

const mockPool = {
  query: jest.fn(),
  getConnection: jest.fn(),
  state: null,
};

jest.mock('../config/database', () => mockPool);

const mockSendVerificationEmail = jest.fn(async () => ({ ok: true, messageId: 'mock-brevo' }));
const mockIsBrevoConfigured = jest.fn(() => true);

jest.mock('../utils/emailService', () => ({
  sendVerificationEmail: (...args) => mockSendVerificationEmail(...args),
  isBrevoConfigured: (...args) => mockIsBrevoConfigured(...args),
}));

const authController = require('../controllers/authController');

function mockReq(overrides = {}) {
  return {
    body: {},
    query: {},
    ip: '127.0.0.1',
    headers: {},
    ...overrides,
  };
}

function mockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

async function attachLivePool() {
  const live = createMockPool();
  mockPool.state = live.state;
  mockPool.query.mockImplementation(live.query);
  mockPool.getConnection.mockImplementation(live.getConnection);
  return live.state;
}

describe('email verification auth flow', () => {
  let state;

  beforeEach(async () => {
    resetRateLimits();
    mockSendVerificationEmail.mockReset();
    mockSendVerificationEmail.mockResolvedValue({ ok: true, messageId: 'mock-brevo' });
    mockIsBrevoConfigured.mockReset();
    mockIsBrevoConfigured.mockReturnValue(true);
    state = await attachLivePool();
  });

  test('successful user registration creates an unverified account', async () => {
    const res = mockRes();
    await authController.register(mockReq({
      body: {
        full_name: 'Nimal Perera',
        username: 'nimal2',
        email: 'nimal2@example.lk',
        password: 'secret1',
        confirmPassword: 'secret1',
        phone: '+94771112233',
      },
    }), res);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.requiresVerification).toBe(true);
    expect(res.body.token).toBeUndefined();
    expect(state.users).toHaveLength(1);
    expect(state.users[0].email_verified).toBe(false);
    expect(state.tokens).toHaveLength(1);
  });

  test('verification OTP email is generated and handed off to mocked Brevo API', async () => {
    const res = mockRes();
    await authController.register(mockReq({
      body: {
        full_name: 'Amal Silva',
        username: 'amal',
        email: 'amal@example.lk',
        password: 'secret1',
        confirmPassword: 'secret1',
        phone: '+94771112234',
      },
    }), res);

    expect(mockSendVerificationEmail).toHaveBeenCalledTimes(1);
    const [user, otp] = mockSendVerificationEmail.mock.calls[0];
    expect(user.email).toBe('amal@example.lk');
    expect(otp).toMatch(/^\d{6}$/);
    expect(state.tokens[0].token_hash).toBe(hashOtp(otp, state.users[0].id));
    expect(state.tokens[0].token_hash).not.toBe(otp);
  });

  test('rejects invalid email addresses', async () => {
    const res = mockRes();
    await authController.register(mockReq({
      body: {
        full_name: 'Bad Email',
        username: 'bademail',
        email: 'not-an-email',
        password: 'secret1',
        confirmPassword: 'secret1',
        phone: '+94771112233',
      },
    }), res);
    expect(res.statusCode).toBe(400);
    expect(state.users).toHaveLength(0);
    expect(mockSendVerificationEmail).not.toHaveBeenCalled();
  });

  test('rejects duplicate registration attempts', async () => {
    const body = {
      full_name: 'Dup User',
      username: 'dupuser',
      email: 'dup@example.lk',
      password: 'secret1',
      confirmPassword: 'secret1',
      phone: '+94771112233',
    };
    await authController.register(mockReq({ body }), mockRes());
    const res = mockRes();
    await authController.register(mockReq({ body }), res);
    expect(res.statusCode).toBe(409);
    expect(state.users).toHaveLength(1);
  });

  test('successful email verification marks the user verified and consumes the OTP', async () => {
    const otp = '482913';
    state.users.push({
      id: 9, full_name: 'V User', username: 'vuser', email: 'v@example.lk',
      password: 'x', phone: '1', email_verified: false,
    });
    state.tokens.push({
      id: 3, user_id: 9, token_hash: hashOtp(otp, 9),
      expires_at: new Date(Date.now() + 10 * 60 * 1000), used_at: null, attempt_count: 0, created_at: new Date(),
    });

    const res = mockRes();
    await authController.verifyEmail(mockReq({ body: { email: 'v@example.lk', code: otp } }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(state.users[0].email_verified).toBe(true);
    expect(state.tokens[0].used_at).toBeTruthy();
  });

  test('rejects expired verification codes', async () => {
    const otp = '111222';
    state.users.push({
      id: 4, full_name: 'E', username: 'e', email: 'e@example.lk',
      password: 'x', phone: '1', email_verified: false,
    });
    state.tokens.push({
      id: 1, user_id: 4, token_hash: hashOtp(otp, 4),
      expires_at: new Date(Date.now() - 1000), used_at: null, attempt_count: 0, created_at: new Date(),
    });
    const res = mockRes();
    await authController.verifyEmail(mockReq({ body: { email: 'e@example.lk', code: otp } }), res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/expired/i);
    expect(state.users[0].email_verified).toBe(false);
  });

  test('rejects invalid verification codes', async () => {
    const res = mockRes();
    await authController.verifyEmail(mockReq({ body: { email: 'x@example.lk', code: 'nope' } }), res);
    expect(res.statusCode).toBe(400);
  });

  test('locks the OTP after five incorrect attempts', async () => {
    state.users.push({
      id: 5, full_name: 'U', username: 'u', email: 'u@example.lk',
      password: 'x', phone: '1', email_verified: false,
    });
    state.tokens.push({
      id: 1, user_id: 5, token_hash: hashOtp('123456', 5),
      expires_at: new Date(Date.now() + 10 * 60 * 1000), used_at: null, attempt_count: 4, created_at: new Date(),
    });
    const res = mockRes();
    await authController.verifyEmail(mockReq({ body: { email: 'u@example.lk', code: '000000' } }), res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/too many incorrect attempts/i);
    expect(state.tokens[0].used_at).toBeTruthy();
  });

  test('resending verification email invalidates previous unused tokens', async () => {
    state.users.push({
      id: 6, full_name: 'R', username: 'r', email: 'resend@example.lk',
      password: 'x', phone: '1', email_verified: false,
    });
    state.tokens.push({
      id: 1, user_id: 6, token_hash: 'a'.repeat(64),
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
      used_at: null,
      created_at: new Date(Date.now() - 120 * 1000),
    });

    const res = mockRes();
    await authController.resendVerification(mockReq({ body: { email: 'resend@example.lk' } }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/sent successfully/i);
    expect(state.tokens[0].used_at).toBeTruthy();
    expect(state.tokens).toHaveLength(2);
    expect(mockSendVerificationEmail).toHaveBeenCalledTimes(1);
  });

  test('enforces resend cooldown', async () => {
    state.users.push({
      id: 7, full_name: 'C', username: 'c', email: 'cool@example.lk',
      password: 'x', phone: '1', email_verified: false,
    });
    state.tokens.push({
      id: 1, user_id: 7, token_hash: 'b'.repeat(64),
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
      used_at: null,
      created_at: new Date(),
    });
    const res = mockRes();
    await authController.resendVerification(mockReq({ body: { email: 'cool@example.lk' } }), res);
    expect(res.statusCode).toBe(429);
    expect(res.body.message).toMatch(/please wait/i);
    expect(mockSendVerificationEmail).not.toHaveBeenCalled();
  });

  test('prevents unverified users from logging in', async () => {
    const password = await bcrypt.hash('user123', 4);
    state.users.push({
      id: 8, full_name: 'Open', username: 'open', email: 'open@example.lk',
      password, phone: '1', email_verified: false,
    });
    const res = mockRes();
    await authController.login(mockReq({ body: { username: 'open', password: 'user123' } }), res);
    expect(res.statusCode).toBe(403);
    expect(res.body.requiresVerification).toBe(true);
    expect(res.body.token).toBeUndefined();
  });

  test('allows verified users to log in', async () => {
    const password = await bcrypt.hash('user123', 4);
    state.users.push({
      id: 8, full_name: 'Nimal Perera', username: 'nimal', email: 'nimal@example.lk',
      password, phone: '1', email_verified: true,
    });
    const res = mockRes();
    await authController.login(mockReq({ body: { username: 'nimal', password: 'user123' } }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.password).toBeUndefined();
  });

  test('blocks registration when Brevo API is missing', async () => {
    mockIsBrevoConfigured.mockReturnValue(false);
    const res = mockRes();
    await authController.register(mockReq({
      body: {
        full_name: 'No Smtp',
        username: 'nosmtp',
        email: 'nosmtp@example.lk',
        password: 'secret1',
        confirmPassword: 'secret1',
        phone: '+94771112233',
      },
    }), res);
    expect(res.statusCode).toBe(503);
    expect(state.users).toHaveLength(0);
  });

  test('rolls back the new account when Brevo API handoff fails', async () => {
    mockSendVerificationEmail.mockResolvedValue({ ok: false, error: 'provider rejected' });
    const res = mockRes();
    await authController.register(mockReq({
      body: {
        full_name: 'Fail Mail',
        username: 'failmail',
        email: 'failmail@example.lk',
        password: 'secret1',
        confirmPassword: 'secret1',
        phone: '+94771112233',
      },
    }), res);
    expect(res.statusCode).toBe(502);
    expect(res.body.success).toBe(false);
    expect(state.users).toHaveLength(0);
  });

  test('does not claim success when resend Brevo API fails', async () => {
    mockSendVerificationEmail.mockResolvedValue({ ok: false, error: 'timeout' });
    state.users.push({
      id: 11, full_name: 'R2', username: 'r2', email: 'r2@example.lk',
      password: 'x', phone: '1', email_verified: false,
    });
    const res = mockRes();
    await authController.resendVerification(mockReq({ body: { email: 'r2@example.lk' } }), res);
    expect(res.statusCode).toBe(502);
    expect(res.body.success).toBe(false);
  });
});
