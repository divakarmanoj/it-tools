import { describe, expect, it } from 'vitest';
import { generateHtpasswdLine, hashPassword, verifyHtpasswdLine } from './htpasswd-generator.service';

describe('hashPassword', () => {
  it('emits a $2y$ bcrypt hash', async () => {
    const h = await hashPassword('hunter2', 'bcrypt', 4);
    expect(h.startsWith('$2y$04$')).toBe(true);
    // Total bcrypt hash length is 60.
    expect(h.length).toBe(60);
  });

  it('emits the correct base64 SHA1 for a known input', async () => {
    const h = await hashPassword('password', 'sha1');
    // sha1("password") == 5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8 (hex)
    // base64 of those 20 bytes:
    expect(h).toBe('{SHA}W6ph5Mm5Pz8GgiULbPgzG37mj9g=');
  });

  it('passes through plain text', async () => {
    const h = await hashPassword('hunter2', 'plain');
    expect(h).toBe('hunter2');
  });

  it('throws on unknown algo', async () => {
    // @ts-expect-error testing runtime guard
    await expect(hashPassword('x', 'md5')).rejects.toThrow();
  });

  it('clamps bcrypt cost to safe range', async () => {
    const low = await hashPassword('x', 'bcrypt', 2);
    expect(low.startsWith('$2y$04$')).toBe(true);
  });
});

describe('generateHtpasswdLine', () => {
  it('builds username:hash', async () => {
    const line = await generateHtpasswdLine({ username: 'admin', password: 'pw', algo: 'sha1' });
    expect(line.startsWith('admin:{SHA}')).toBe(true);
  });

  it('rejects empty username', async () => {
    await expect(generateHtpasswdLine({ username: '', password: 'pw', algo: 'sha1' })).rejects.toThrow();
  });

  it('rejects empty password', async () => {
    await expect(generateHtpasswdLine({ username: 'a', password: '', algo: 'sha1' })).rejects.toThrow();
  });

  it('rejects username containing colon', async () => {
    await expect(generateHtpasswdLine({ username: 'a:b', password: 'pw', algo: 'sha1' })).rejects.toThrow();
  });
});

describe('verifyHtpasswdLine', () => {
  it('verifies a bcrypt line we generated', async () => {
    const line = await generateHtpasswdLine({ username: 'admin', password: 'hunter2', algo: 'bcrypt', bcryptCost: 4 });
    const r = await verifyHtpasswdLine(line, 'hunter2');
    expect(r).toEqual({ valid: true, algo: 'bcrypt' });
    const r2 = await verifyHtpasswdLine(line, 'wrong');
    expect(r2.valid).toBe(false);
  });

  it('verifies a SHA1 line', async () => {
    const line = await generateHtpasswdLine({ username: 'admin', password: 'password', algo: 'sha1' });
    const r = await verifyHtpasswdLine(line, 'password');
    expect(r).toEqual({ valid: true, algo: 'sha1' });
  });

  it('verifies plain', async () => {
    const r = await verifyHtpasswdLine('admin:hunter2', 'hunter2');
    expect(r).toEqual({ valid: true, algo: 'plain' });
  });

  it('returns invalid for malformed line', async () => {
    const r = await verifyHtpasswdLine('no-colon-here', 'pw');
    expect(r.valid).toBe(false);
  });
});
