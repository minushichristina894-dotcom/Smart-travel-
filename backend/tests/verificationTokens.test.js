const { generateOtp, hashOtp, isOtpFormat, otpHashesMatch } = require('../utils/verificationTokens');

describe('verification OTP', () => {
  test('generates a 6-digit code', () => {
    const otp = generateOtp();
    expect(isOtpFormat(otp)).toBe(true);
    expect(otp).toHaveLength(6);
  });

  test('stores only a hash — raw OTP does not equal hash', () => {
    const otp = '482913';
    const hash = hashOtp(otp, 7);
    expect(hash).toHaveLength(64);
    expect(hash).not.toBe(otp);
    expect(otpHashesMatch(hash, hashOtp(otp, 7))).toBe(true);
    expect(otpHashesMatch(hash, hashOtp('000000', 7))).toBe(false);
  });
});
