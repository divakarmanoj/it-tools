import { argon2Verify, argon2d, argon2i, argon2id } from 'hash-wasm';

export type Argon2Variant = 'argon2id' | 'argon2i' | 'argon2d';

export interface Argon2HashOptions {
  password: string
  salt: Uint8Array
  variant: Argon2Variant
  iterations: number
  memorySize: number
  parallelism: number
  hashLength: number
}

export function generateSalt(length = 16): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function hashPassword({
  password,
  salt,
  variant,
  iterations,
  memorySize,
  parallelism,
  hashLength,
}: Argon2HashOptions): Promise<string> {
  const opts = {
    password,
    salt,
    iterations,
    memorySize,
    parallelism,
    hashLength,
    outputType: 'encoded' as const,
  };

  if (variant === 'argon2i') {
    return argon2i(opts);
  }
  if (variant === 'argon2d') {
    return argon2d(opts);
  }
  return argon2id(opts);
}

export function verifyPassword({ password, hash }: { password: string; hash: string }): Promise<boolean> {
  return argon2Verify({ password, hash });
}
