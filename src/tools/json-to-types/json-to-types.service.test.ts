import { describe, expect, it } from 'vitest';
import { convertJsonToTypes } from './json-to-types.service';

const sample = JSON.stringify({
  id: 42,
  name: 'Alice',
  email: 'alice@example.com',
  tags: ['admin', 'beta'],
  metadata: { signupDate: '2026-01-01', verified: true },
});

describe('json-to-types', () => {
  it('emits a TypeScript interface for a simple object', async () => {
    const out = await convertJsonToTypes({ json: sample, language: 'typescript', typeName: 'User' });
    expect(out).toMatch(/interface User\b/);
    expect(out).toMatch(/email/);
    expect(out).toMatch(/tags/);
  }, 30000);

  it('emits Go structs', async () => {
    const out = await convertJsonToTypes({ json: sample, language: 'go', typeName: 'User' });
    expect(out).toMatch(/type User struct/);
    expect(out).toMatch(/`json:"email"`/);
  }, 30000);

  it('emits Rust structs with serde derives', async () => {
    const out = await convertJsonToTypes({ json: sample, language: 'rust', typeName: 'User' });
    expect(out).toMatch(/struct User/);
    expect(out).toMatch(/Serialize/);
  }, 30000);

  it('emits Python dataclasses', async () => {
    const out = await convertJsonToTypes({ json: sample, language: 'python', typeName: 'User' });
    expect(out).toMatch(/class User/);
  }, 30000);

  it('throws on invalid JSON', async () => {
    await expect(convertJsonToTypes({ json: '{not valid', language: 'typescript', typeName: 'User' }))
      .rejects.toThrow();
  });
});
