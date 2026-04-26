import { describe, expect, it } from 'vitest';
import { decryptMessage, encryptMessage, generateKeyPair } from './pgp-key-generator.service';

describe('pgp-key-generator', () => {
  it('round-trips encrypt → decrypt with a generated keypair', async () => {
    const { publicKey, privateKey } = await generateKeyPair({
      name: 'Test User',
      email: 'test@example.com',
      keyType: { algorithm: 'ecc', curve: 'curve25519' },
    });

    expect(publicKey).toMatch(/-----BEGIN PGP PUBLIC KEY BLOCK-----/);
    expect(privateKey).toMatch(/-----BEGIN PGP PRIVATE KEY BLOCK-----/);

    const ciphertext = await encryptMessage({ message: 'hello pgp', publicKeyArmored: publicKey });
    expect(ciphertext).toMatch(/-----BEGIN PGP MESSAGE-----/);

    const plaintext = await decryptMessage({ armoredMessage: ciphertext, privateKeyArmored: privateKey });
    expect(plaintext).toBe('hello pgp');
  }, 60000);

  it('refuses to decrypt with a passphrase-protected key when no passphrase is supplied', async () => {
    const { publicKey, privateKey } = await generateKeyPair({
      name: 'Test User',
      email: 'test@example.com',
      passphrase: 'sekrit',
      keyType: { algorithm: 'ecc', curve: 'curve25519' },
    });

    const ciphertext = await encryptMessage({ message: 'guarded', publicKeyArmored: publicKey });
    await expect(decryptMessage({ armoredMessage: ciphertext, privateKeyArmored: privateKey })).rejects.toThrow();

    const plaintext = await decryptMessage({ armoredMessage: ciphertext, privateKeyArmored: privateKey, passphrase: 'sekrit' });
    expect(plaintext).toBe('guarded');
  }, 60000);
});
