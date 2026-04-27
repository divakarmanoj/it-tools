import { describe, expect, it } from 'vitest';
import { formatGraphql, summarizeSdl } from './graphql-formatter.service';

describe('formatGraphql', () => {
  it('pretty-prints a messy query', async () => {
    const r = await formatGraphql('query  X ($id: ID!){ user(id:$id){ id   name }}');
    expect(r.error).toBeUndefined();
    expect(r.formatted).toContain('query X($id: ID!)');
    expect(r.formatted).toContain('user(id: $id)');
  });

  it('formats SDL', async () => {
    const r = await formatGraphql('type   User{   id:ID! name:String}');
    expect(r.error).toBeUndefined();
    expect(r.formatted).toContain('type User');
    expect(r.formatted).toContain('id: ID!');
  });

  it('returns error on invalid syntax', async () => {
    const r = await formatGraphql('query { user(id: }');
    expect(r.error).toBeTruthy();
    expect(r.formatted).toBe('');
  });

  it('returns empty for empty input', async () => {
    const r = await formatGraphql('   ');
    expect(r).toEqual({ formatted: '', warnings: [] });
  });
});

describe('summarizeSdl', () => {
  const SDL = `"""user docs"""
type User {
  id: ID!
  email(verified: Boolean = true): String
}
input UserInput { name: String! }
enum Role { A B }
union Result = User
scalar DateTime
`;

  it('extracts an Object type with fields and args', async () => {
    const { types, error } = await summarizeSdl(SDL);
    expect(error).toBeUndefined();
    const user = types.find(t => t.name === 'User')!;
    expect(user.kind).toBe('Object');
    expect(user.description).toBe('user docs');
    expect(user.fields.find(f => f.name === 'id')?.type).toBe('ID!');
    const email = user.fields.find(f => f.name === 'email')!;
    expect(email.type).toBe('String');
    expect(email.args).toHaveLength(1);
    expect(email.args[0]).toMatchObject({ name: 'verified', type: 'Boolean', defaultValue: 'true' });
  });

  it('extracts InputObject, Enum, Union, Scalar', async () => {
    const { types } = await summarizeSdl(SDL);
    expect(types.find(t => t.name === 'UserInput')?.kind).toBe('InputObject');
    expect(types.find(t => t.name === 'Role')?.kind).toBe('Enum');
    expect(types.find(t => t.name === 'Role')?.values).toEqual(['A', 'B']);
    expect(types.find(t => t.name === 'Result')?.kind).toBe('Union');
    expect(types.find(t => t.name === 'Result')?.members).toEqual(['User']);
    expect(types.find(t => t.name === 'DateTime')?.kind).toBe('Scalar');
  });

  it('returns parse error for invalid SDL', async () => {
    const { error, types } = await summarizeSdl('type {');
    expect(error).toBeTruthy();
    expect(types).toEqual([]);
  });
});
