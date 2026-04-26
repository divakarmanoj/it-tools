import { describe, expect, it } from 'vitest';
import { buildKeyUri, generateSecret } from './totp-secret-generator.service';

describe('totp-secret-generator', () => {
  describe('generateSecret', () => {
    it('returns a base32 string of the requested length', () => {
      const secret = generateSecret(32);
      expect(secret).toHaveLength(32);
      expect(secret).toMatch(/^[A-Z2-7]+$/);
    });

    it('returns distinct values across calls', () => {
      expect(generateSecret(32)).not.toBe(generateSecret(32));
    });
  });

  describe('buildKeyUri', () => {
    it('builds a TOTP URI with all required params', () => {
      const uri = buildKeyUri({
        type: 'totp',
        secret: 'JBSWY3DPEHPK3PXP',
        issuer: 'IT-Tools',
        account: 'alice@example.com',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
      });

      expect(uri).toContain('otpauth://totp/');
      expect(uri).toContain('IT-Tools:alice%40example.com');
      expect(uri).toContain('secret=JBSWY3DPEHPK3PXP');
      expect(uri).toContain('issuer=IT-Tools');
      expect(uri).toContain('algorithm=SHA1');
      expect(uri).toContain('digits=6');
      expect(uri).toContain('period=30');
    });

    it('builds a HOTP URI with counter instead of period', () => {
      const uri = buildKeyUri({
        type: 'hotp',
        secret: 'JBSWY3DPEHPK3PXP',
        issuer: 'IT-Tools',
        account: 'bob',
        algorithm: 'SHA256',
        digits: 8,
        counter: 7,
      });

      expect(uri).toContain('otpauth://hotp/');
      expect(uri).toContain('counter=7');
      expect(uri).not.toContain('period=');
    });
  });
});
