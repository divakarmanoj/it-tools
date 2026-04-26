import { Decrypter, Encrypter, generateIdentity, identityToRecipient } from 'age-encryption';

export interface AgeIdentity {
  identity: string
  recipient: string
}

export async function generateAgeIdentity(): Promise<AgeIdentity> {
  const identity = await generateIdentity();
  const recipient = await identityToRecipient(identity);
  return { identity, recipient };
}

const textEncoder = new TextEncoder();

function toArmoredAge(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...bytes));
  const wrapped = base64.replace(/.{64}/g, '$&\n');
  return `-----BEGIN AGE ENCRYPTED FILE-----\n${wrapped}${wrapped.endsWith('\n') ? '' : '\n'}-----END AGE ENCRYPTED FILE-----\n`;
}

function fromArmoredAge(armored: string): Uint8Array {
  const trimmed = armored.trim();
  if (trimmed.startsWith('-----BEGIN AGE ENCRYPTED FILE-----')) {
    const body = trimmed
      .replace(/-----BEGIN AGE ENCRYPTED FILE-----/, '')
      .replace(/-----END AGE ENCRYPTED FILE-----/, '')
      .replace(/\s+/g, '');
    const binary = atob(body);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      out[i] = binary.charCodeAt(i);
    }
    return out;
  }
  // Assume already binary-base64-only; or treat as raw text fallback (shouldn't happen).
  const binary = atob(trimmed.replace(/\s+/g, ''));
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

export async function encryptWithRecipient({ message, recipient }: { message: string; recipient: string }): Promise<string> {
  const enc = new Encrypter();
  enc.addRecipient(recipient.trim());
  const ciphertext = await enc.encrypt(textEncoder.encode(message));
  return toArmoredAge(ciphertext);
}

export async function encryptWithPassphrase({ message, passphrase }: { message: string; passphrase: string }): Promise<string> {
  const enc = new Encrypter();
  enc.setPassphrase(passphrase);
  const ciphertext = await enc.encrypt(textEncoder.encode(message));
  return toArmoredAge(ciphertext);
}

export async function decryptWithIdentity({ armored, identity }: { armored: string; identity: string }): Promise<string> {
  const dec = new Decrypter();
  dec.addIdentity(identity.trim());
  return await dec.decrypt(fromArmoredAge(armored), 'text');
}

export async function decryptWithPassphrase({ armored, passphrase }: { armored: string; passphrase: string }): Promise<string> {
  const dec = new Decrypter();
  dec.addPassphrase(passphrase);
  return await dec.decrypt(fromArmoredAge(armored), 'text');
}
