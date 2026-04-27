// JWT signer (HS / RS / ES) using `jose`. Lazy-imported.

export type JwtAlg
  = | 'HS256' | 'HS384' | 'HS512'
  | 'RS256' | 'RS384' | 'RS512'
  | 'PS256' | 'PS384' | 'PS512'
  | 'ES256' | 'ES384' | 'ES512';

export const HS_ALGS: JwtAlg[] = ['HS256', 'HS384', 'HS512'];
export const RS_ALGS: JwtAlg[] = ['RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512'];
export const ES_ALGS: JwtAlg[] = ['ES256', 'ES384', 'ES512'];

export const ALL_ALGS: JwtAlg[] = [...HS_ALGS, ...RS_ALGS, ...ES_ALGS];

export interface SignInput {
  alg: JwtAlg
  payload: object
  // For HS*: the shared secret as UTF-8 text
  // For RS*/PS*/ES*: a PEM-encoded PKCS#8 private key
  key: string
  // Optional standard claims set on the JWT itself (extra header lookups too)
  issuer?: string
  audience?: string
  subject?: string
  expiresIn?: string // e.g. "1h", "3600s"
  notBefore?: string
  jti?: string
  kid?: string
}

export interface VerifyInput {
  jwt: string
  alg: JwtAlg
  // For HS*: the shared secret
  // For RS*/PS*/ES*: a PEM-encoded SubjectPublicKeyInfo (SPKI) public key
  key: string
}

function isAsymmetric(alg: JwtAlg): boolean {
  return !alg.startsWith('HS');
}

async function loadJose() {
  return await import('jose');
}

export async function signJwt(input: SignInput): Promise<string> {
  const { SignJWT, importPKCS8 } = await loadJose();
  const builder = new SignJWT(input.payload as any).setProtectedHeader({
    alg: input.alg,
    ...(input.kid ? { kid: input.kid } : {}),
  }).setIssuedAt();

  if (input.issuer) {
    builder.setIssuer(input.issuer);
  }
  if (input.audience) {
    builder.setAudience(input.audience);
  }
  if (input.subject) {
    builder.setSubject(input.subject);
  }
  if (input.expiresIn) {
    builder.setExpirationTime(input.expiresIn);
  }
  if (input.notBefore) {
    builder.setNotBefore(input.notBefore);
  }
  if (input.jti) {
    builder.setJti(input.jti);
  }

  if (isAsymmetric(input.alg)) {
    if (!input.key.includes('BEGIN')) {
      throw new Error(`${input.alg} requires a PEM private key (BEGIN PRIVATE KEY ...).`);
    }
    const privateKey = await importPKCS8(input.key.trim(), input.alg);
    return await builder.sign(privateKey);
  }
  // HS*: text secret as UTF-8 bytes
  return await builder.sign(new TextEncoder().encode(input.key));
}

export interface VerifyResult {
  valid: boolean
  header?: object
  payload?: object
  error?: string
}

export async function verifyJwt(input: VerifyInput): Promise<VerifyResult> {
  const { jwtVerify, importSPKI } = await loadJose();
  try {
    if (isAsymmetric(input.alg)) {
      if (!input.key.includes('BEGIN')) {
        throw new Error(`${input.alg} requires a PEM public key (BEGIN PUBLIC KEY ...).`);
      }
      const publicKey = await importSPKI(input.key.trim(), input.alg);
      const { payload, protectedHeader } = await jwtVerify(input.jwt, publicKey);
      return { valid: true, header: protectedHeader, payload };
    }
    const secret = new TextEncoder().encode(input.key);
    const { payload, protectedHeader } = await jwtVerify(input.jwt, secret);
    return { valid: true, header: protectedHeader, payload };
  }
  catch (err: any) {
    return { valid: false, error: err?.message ?? String(err) };
  }
}

// Decode (no verification) — handy for displaying the claims as the user types.
export function decodeJwtUnverified(jwt: string): { header?: object; payload?: object; error?: string } {
  const parts = jwt.split('.');
  if (parts.length < 2) {
    return { error: 'JWT must have at least 2 segments (header.payload).' };
  }
  try {
    return {
      header: JSON.parse(b64uToString(parts[0])),
      payload: JSON.parse(b64uToString(parts[1])),
    };
  }
  catch (e: any) {
    return { error: e?.message ?? 'Failed to decode' };
  }
}

function b64uToString(s: string): string {
  // Pad and convert URL-safe base64 to standard.
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  if (typeof atob === 'function') {
    return decodeURIComponent(escape(atob(padded)));
  }
  // Fallback for Node/Vitest:
  // eslint-disable-next-line n/prefer-global/buffer
  return Buffer.from(padded, 'base64').toString('utf-8');
}

// Generate a new keypair for an asymmetric alg, returning PEM-encoded PKCS#8 private and SPKI public.
export async function generateKeyPairPem(alg: JwtAlg): Promise<{ privateKey: string; publicKey: string }> {
  const { generateKeyPair, exportPKCS8, exportSPKI } = await loadJose();
  const { privateKey, publicKey } = await generateKeyPair(alg, { extractable: true });
  const [pkcs8, spki] = await Promise.all([
    exportPKCS8(privateKey),
    exportSPKI(publicKey),
  ]);
  return { privateKey: pkcs8, publicKey: spki };
}
