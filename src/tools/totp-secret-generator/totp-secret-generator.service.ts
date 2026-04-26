import { generateSecret as baseGenerateSecret } from '../otp-code-generator-and-validator/otp.service';

export type OtpType = 'totp' | 'hotp';
export type OtpAlgorithm = 'SHA1' | 'SHA256' | 'SHA512';

export function generateSecret(length = 32): string {
  // Reuse the existing base32 secret generator but allow a custom length.
  // The original returns a fixed 16-char secret, so we concatenate for longer secrets.
  let out = '';
  while (out.length < length) {
    out += baseGenerateSecret();
  }
  return out.slice(0, length);
}

export interface KeyUriInput {
  type: OtpType
  secret: string
  issuer: string
  account: string
  algorithm: OtpAlgorithm
  digits: number
  period?: number
  counter?: number
}

export function buildKeyUri({
  type,
  secret,
  issuer,
  account,
  algorithm,
  digits,
  period,
  counter,
}: KeyUriInput): string {
  const params: Record<string, string | number> = {
    secret,
    issuer,
    algorithm,
    digits,
  };

  if (type === 'totp') {
    params.period = period ?? 30;
  }
  else {
    params.counter = counter ?? 0;
  }

  const query = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

  return `otpauth://${type}/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?${query}`;
}
