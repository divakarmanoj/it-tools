import { describe, expect, it } from 'vitest';
import { ALL_ALGS, decodeJwtUnverified, generateKeyPairPem, signJwt, verifyJwt } from './jwt-signer.service';

describe('jwt-signer (HS algs)', () => {
  it('signs and verifies HS256 round-trip', async () => {
    const secret = 'my-test-secret';
    const jwt = await signJwt({ alg: 'HS256', payload: { hello: 'world' }, key: secret });
    expect(jwt.split('.').length).toBe(3);
    const r = await verifyJwt({ jwt, alg: 'HS256', key: secret });
    expect(r.valid).toBe(true);
    expect(r.payload).toMatchObject({ hello: 'world' });
    expect((r.header as any).alg).toBe('HS256');
  });

  it('verify fails on wrong secret', async () => {
    const jwt = await signJwt({ alg: 'HS256', payload: { x: 1 }, key: 'a' });
    const r = await verifyJwt({ jwt, alg: 'HS256', key: 'b' });
    expect(r.valid).toBe(false);
  });

  it('sets standard claims', async () => {
    const jwt = await signJwt({
      alg: 'HS256',
      payload: {},
      key: 's',
      issuer: 'me',
      audience: 'you',
      subject: 'sub',
      expiresIn: '5m',
      jti: 'id-1',
    });
    const decoded = decodeJwtUnverified(jwt);
    expect(decoded.payload).toMatchObject({ iss: 'me', aud: 'you', sub: 'sub', jti: 'id-1' });
    expect((decoded.payload as any).exp).toBeGreaterThan((decoded.payload as any).iat);
  });

  it('puts kid in header when provided', async () => {
    const jwt = await signJwt({ alg: 'HS256', payload: {}, key: 's', kid: 'k-1' });
    expect((decodeJwtUnverified(jwt).header as any).kid).toBe('k-1');
  });
});

describe('jwt-signer (asymmetric)', () => {
  it('rejects HS algs given a PEM key', async () => {
    await expect(signJwt({ alg: 'RS256', payload: {}, key: 'not-a-pem' })).rejects.toThrow(/PEM/);
  });

  it('signs and verifies ES256 round-trip with a generated keypair', async () => {
    const { privateKey, publicKey } = await generateKeyPairPem('ES256');
    expect(privateKey).toContain('BEGIN PRIVATE KEY');
    expect(publicKey).toContain('BEGIN PUBLIC KEY');

    const jwt = await signJwt({ alg: 'ES256', payload: { sub: 'alice' }, key: privateKey });
    const r = await verifyJwt({ jwt, alg: 'ES256', key: publicKey });
    expect(r.valid).toBe(true);
    expect(r.payload).toMatchObject({ sub: 'alice' });
  });

  it('signs and verifies RS256 round-trip with a generated keypair', async () => {
    const { privateKey, publicKey } = await generateKeyPairPem('RS256');
    const jwt = await signJwt({ alg: 'RS256', payload: { ok: true }, key: privateKey });
    const r = await verifyJwt({ jwt, alg: 'RS256', key: publicKey });
    expect(r.valid).toBe(true);
  }, 15000);
});

describe('decodeJwtUnverified', () => {
  it('decodes header and payload', async () => {
    const jwt = await signJwt({ alg: 'HS256', payload: { foo: 'bar' }, key: 's' });
    const d = decodeJwtUnverified(jwt);
    expect((d.header as any).alg).toBe('HS256');
    expect((d.payload as any).foo).toBe('bar');
  });

  it('errors on garbage', () => {
    const d = decodeJwtUnverified('not-a-jwt');
    expect(d.error).toBeTruthy();
  });
});

describe('alg list', () => {
  it('includes HS, RS, PS, ES variants', () => {
    expect(ALL_ALGS).toEqual(expect.arrayContaining(['HS256', 'RS256', 'PS256', 'ES256']));
  });
});
