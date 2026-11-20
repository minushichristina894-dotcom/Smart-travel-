import { describe, expect, test, vi } from 'vitest';
import { getLoginRedirectPath, processLogin, validateLogin } from './loginPage';

describe('login helpers', () => {
  test('validates missing credentials', () => {
    expect(validateLogin('', '')).toMatch(/required/i);
  });

  test('redirects verified roles', () => {
    expect(getLoginRedirectPath('admin')).toBe('/admin');
    expect(getLoginRedirectPath('staff')).toBe('/staff');
    expect(getLoginRedirectPath('customer')).toBe('/dashboard');
  });

  test('keeps unverified users on login instead of issuing a session', async () => {
    const login = vi.fn(async () => {
      const err = new Error('verify');
      err.response = {
        data: {
          message: 'Please verify your email address before logging in.',
          requiresVerification: true,
          email: 'open@example.lk',
        },
      };
      throw err;
    });
    const setUnverifiedEmail = vi.fn();
    const result = await processLogin({
      username: 'open',
      password: 'user123',
      login,
      navigate: vi.fn(),
      showToast: vi.fn(),
      setError: vi.fn(),
      setLoading: vi.fn(),
      setUnverifiedEmail,
    });
    expect(result.requiresVerification).toBe(true);
    expect(setUnverifiedEmail).toHaveBeenCalledWith('open@example.lk');
  });
});
