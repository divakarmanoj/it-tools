import { describe, expect, it } from 'vitest';
import { generateSalt, hashPassword, verifyPassword } from './argon2-hash-generator.service';

describe('argon2-hash-generator', () => {
  describe('generateSalt', () => {
    it('returns the requested number of random bytes', () => {
      const salt = generateSalt(16);
      expect(salt).toBeInstanceOf(Uint8Array);
      expect(salt.byteLength).toBe(16);
    });

    it('produces distinct values across calls', () => {
      const a = Array.from(generateSalt(16)).join(',');
      const b = Array.from(generateSalt(16)).join(',');
      expect(a).not.toBe(b);
    });
  });

  describe('hash + verify round-trip', () => {
    it('verifies a freshly hashed password', async () => {
      const salt = generateSalt(16);
      const hash = await hashPassword({
        password: 'correct horse battery staple',
        salt,
        variant: 'argon2id',
        iterations: 2,
        memorySize: 1024,
        parallelism: 1,
        hashLength: 32,
      });

      expect(hash.startsWith('$argon2id$')).toBe(true);

      await expect(verifyPassword({ password: 'correct horse battery staple', hash })).resolves.toBe(true);
      await expect(verifyPassword({ password: 'wrong password', hash })).resolves.toBe(false);
    }, 30000);
  });
});
