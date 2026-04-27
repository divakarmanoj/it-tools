// Generate a single .htpasswd line. Apache supports four storage formats:
//   bcrypt  (recommended)        $2y$<cost>$<22-char salt><31-char hash>
//   sha1    (insecure, browser)  {SHA}<base64(sha1(password))>
//   plain   (only on Windows / Netware — supplied for completeness, with warning)
//   crypt   (legacy DES, ~13 chars; tied to glibc; intentionally not supported here)

import bcrypt from 'bcryptjs';

export type HtpasswdAlgo = 'bcrypt' | 'sha1' | 'plain';

export interface GenerateInput {
  username: string
  password: string
  algo: HtpasswdAlgo
  bcryptCost?: number // 4-31, default 10
}

function utf8Bytes(input: string): Uint8Array {
  return new TextEncoder().encode(input);
}

async function sha1Base64(password: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', utf8Bytes(password));
  // Use btoa over a Latin-1 string built from the bytes (each octet < 256).
  let binary = '';
  const bytes = new Uint8Array(digest);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function hashPassword(password: string, algo: HtpasswdAlgo, bcryptCost = 10): Promise<string> {
  switch (algo) {
    case 'bcrypt': {
      const cost = Math.max(4, Math.min(31, Math.floor(bcryptCost)));
      // bcryptjs emits "$2a$"; Apache also accepts "$2y$". Normalize to "$2y$"
      // because that's what htpasswd writes by default.
      const salted = await bcrypt.hash(password, cost);
      return salted.replace(/^\$2[aby]\$/, '$2y$');
    }
    case 'sha1':
      return `{SHA}${await sha1Base64(password)}`;
    case 'plain':
      return password;
    default:
      throw new Error(`Unsupported algorithm: ${algo as string}`);
  }
}

export async function generateHtpasswdLine(input: GenerateInput): Promise<string> {
  if (!input.username) {
    throw new Error('Username is required.');
  }
  if (input.username.includes(':')) {
    throw new Error('Username must not contain ":".');
  }
  if (!input.password) {
    throw new Error('Password is required.');
  }
  const hash = await hashPassword(input.password, input.algo, input.bcryptCost);
  return `${input.username}:${hash}`;
}

// For verifying an existing htpasswd line against a candidate password.
export async function verifyHtpasswdLine(line: string, password: string): Promise<{ valid: boolean; algo: HtpasswdAlgo | 'unknown' }> {
  const colonAt = line.indexOf(':');
  if (colonAt < 0) {
    return { valid: false, algo: 'unknown' };
  }
  const stored = line.slice(colonAt + 1).trim();

  if (/^\$2[aby]\$/.test(stored)) {
    return { valid: await bcrypt.compare(password, stored), algo: 'bcrypt' };
  }
  if (stored.startsWith('{SHA}')) {
    const expected = stored.slice('{SHA}'.length);
    const got = await sha1Base64(password);
    return { valid: got === expected, algo: 'sha1' };
  }
  // Treat as plain only as last resort (Apache does this on Windows).
  return { valid: stored === password, algo: 'plain' };
}
