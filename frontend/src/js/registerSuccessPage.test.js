import { describe, expect, test, vi, beforeEach } from 'vitest';

vi.mock('../services/api', () => ({
  authAPI: {
    resendVerification: vi.fn(),
  },
}));

import { authAPI } from '../services/api';
import { processResendVerification, validateResendEmail } from './registerSuccessPage';

describe('resend verification helpers', () => {
  beforeEach(() => {
    authAPI.resendVerification.mockReset();
  });

  test('rejects invalid emails', () => {
    expect(validateResendEmail('bad')).toMatch(/valid email/i);
  });

  test('enforces client cooldown', async () => {
    const result = await processResendVerification({
      email: 'a@b.com',
      setLoading: vi.fn(),
      setSent: vi.fn(),
      setMessage: vi.fn(),
      showToast: vi.fn(),
      cooldownUntil: Date.now() + 30000,
    });
    expect(result.cooldown).toBe(true);
    expect(authAPI.resendVerification).not.toHaveBeenCalled();
  });

  test('surfaces success message from API', async () => {
    authAPI.resendVerification.mockResolvedValue({
      data: { success: true, message: 'Verification email sent successfully. Please check your inbox.' },
    });
    const result = await processResendVerification({
      email: 'a@b.com',
      setLoading: vi.fn(),
      setSent: vi.fn(),
      setMessage: vi.fn(),
      showToast: vi.fn(),
    });
    expect(result.ok).toBe(true);
    expect(result.message).toMatch(/sent successfully/i);
  });
});
