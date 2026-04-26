import { describe, expect, it } from 'vitest';
import {
  decryptWithIdentity,
  decryptWithPassphrase,
  encryptWithPassphrase,
  encryptWithRecipient,
  generateAgeIdentity,
} from './age-encryption.service';

describe('age-encryption', () => {
  it('round-trips with x25519 recipient/identity', async () => {
    const { identity, recipient } = await generateAgeIdentity();
    expect(identity).toMatch(/^AGE-SECRET-KEY-1/);
    expect(recipient).toMatch(/^age1/);

    const armored = await encryptWithRecipient({ message: 'hello age', recipient });
    expect(armored).toMatch(/-----BEGIN AGE ENCRYPTED FILE-----/);

    const plaintext = await decryptWithIdentity({ armored, identity });
    expect(plaintext).toBe('hello age');
  });

  it('round-trips with passphrase mode', async () => {
    const armored = await encryptWithPassphrase({ message: 'shared secret', passphrase: 'super-secret-passphrase' });
    expect(armored).toMatch(/-----BEGIN AGE ENCRYPTED FILE-----/);

    const plaintext = await decryptWithPassphrase({ armored, passphrase: 'super-secret-passphrase' });
    expect(plaintext).toBe('shared secret');
  }, 60000);

  it('rejects passphrase decryption with the wrong passphrase', async () => {
    const armored = await encryptWithPassphrase({ message: 'shared secret', passphrase: 'right' });
    await expect(decryptWithPassphrase({ armored, passphrase: 'wrong' })).rejects.toThrow();
  }, 60000);
});
