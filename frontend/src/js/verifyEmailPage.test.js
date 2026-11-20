import { describe, expect, test, vi, beforeEach } from 'vitest';

vi.mock('../services/api', () => ({
  authAPI: {
    verifyEmail: vi.fn(),
  },
}));

import { authAPI } from '../services/api';
import { processOtpVerification, validateOtpForm } from './verifyEmailPage';

describe('verify email OTP helper', () => {
  beforeEach(() => {
    authAPI.verifyEmail.mockReset();
  });

  test('rejects a missing or short code without calling the API', async () => {
    const result = await processOtpVerification({
      email: 'a@b.com',
      code: '',
      setStatus: vi.fn(),
      setMessage: vi.fn(),
      setLoading: vi.fn(),
      showToast: vi.fn(),
    });
    expect(result.ok).toBe(false);
    expect(validateOtpForm('a@b.com', '12')).toMatch(/6-digit/i);
    expect(authAPI.verifyEmail).not.toHaveBeenCalled();
  });

  test('marks success when the backend accepts the OTP', async () => {
    authAPI.verifyEmail.mockResolvedValue({ data: { message: 'Email verified successfully! You can now login.' } });
    const setStatus = vi.fn();
    const result = await processOtpVerification({
      email: 'a@b.com',
      code: '482913',
      setStatus,
      setMessage: vi.fn(),
      setLoading: vi.fn(),
      showToast: vi.fn(),
    });
    expect(result.ok).toBe(true);
    expect(setStatus).toHaveBeenCalledWith('success');
  });

  test('marks error for expired or invalid codes', async () => {
    authAPI.verifyEmail.mockRejectedValue({
      response: { data: { message: 'This verification code has expired. Please request a new one.' } },
    });
    const setStatus = vi.fn();
    const setMessage = vi.fn();
    await processOtpVerification({
      email: 'a@b.com',
      code: '482913',
      setStatus,
      setMessage,
      setLoading: vi.fn(),
      showToast: vi.fn(),
    });
    expect(setStatus).toHaveBeenCalledWith('error');
    expect(setMessage.mock.calls.at(-1)[0]).toMatch(/expired/i);
  });
});
