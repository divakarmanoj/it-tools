import { describe, expect, it } from 'vitest';
import { generateMockData } from './mock-data-generator.service';

describe('mock-data-generator', () => {
  it('produces JSON with the requested row count and fields', async () => {
    const json = await generateMockData({
      fields: [
        { name: 'id', kind: 'uuid' },
        { name: 'name', kind: 'firstName' },
      ],
      count: 5,
      format: 'json',
      seed: 1,
    });
    const rows = JSON.parse(json);
    expect(rows).toHaveLength(5);
    expect(Object.keys(rows[0])).toEqual(['id', 'name']);
    // UUID v4 shape
    expect(rows[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('produces deterministic output with the same seed', async () => {
    const opts = {
      fields: [{ name: 'name', kind: 'firstName' as const }],
      count: 3,
      format: 'json' as const,
      seed: 12345,
    };
    expect(await generateMockData(opts)).toBe(await generateMockData(opts));
  });

  it('emits CSV with header and proper escaping', async () => {
    const csv = await generateMockData({
      fields: [
        { name: 'id', kind: 'arrayIndex' },
        { name: 'note', kind: 'enum', enumValues: 'has, comma,no comma,"quoted"' },
      ],
      count: 4,
      format: 'csv',
      seed: 7,
    });
    const lines = csv.split('\n');
    expect(lines[0]).toBe('id,note');
    expect(lines).toHaveLength(5);
    // CSV must escape strings containing commas or quotes:
    expect(csv).toMatch(/"[^"]*,[^"]*"|""quoted""/);
  });

  it('emits SQL INSERT statements with safe table name', async () => {
    const sql = await generateMockData({
      fields: [{ name: 'id', kind: 'arrayIndex' }],
      count: 2,
      format: 'sql',
      tableName: 'My Table; DROP--',
      seed: 1,
    });
    const lines = sql.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/^INSERT INTO "My_Table__DROP__" \("id"\) VALUES \(0\);$/);
  });

  it('escapes single quotes in SQL string values', async () => {
    const sql = await generateMockData({
      fields: [{ name: 'q', kind: 'enum', enumValues: 'it\'s me' }],
      count: 1,
      format: 'sql',
      tableName: 't',
      seed: 1,
    });
    expect(sql).toContain('\'it\'\'s me\'');
  });

  it('clamps count to a sane upper bound', async () => {
    const json = await generateMockData({
      fields: [{ name: 'i', kind: 'arrayIndex' }],
      count: 9_999_999,
      format: 'json',
      seed: 1,
    });
    expect(JSON.parse(json).length).toBeLessThanOrEqual(10_000);
  });

  it('returns empty string when fields list is empty', async () => {
    const out = await generateMockData({ fields: [], count: 5, format: 'json' });
    // No fields → rows are empty objects, not skipped — behavior: array of {}.
    expect(JSON.parse(out)).toEqual([{}, {}, {}, {}, {}]);
  });

  it('integer field is in 1..1000', async () => {
    const json = await generateMockData({
      fields: [{ name: 'x', kind: 'integer' }],
      count: 50,
      format: 'json',
      seed: 1,
    });
    const rows = JSON.parse(json);
    for (const r of rows) {
      expect(r.x).toBeGreaterThanOrEqual(1);
      expect(r.x).toBeLessThanOrEqual(1000);
      expect(Number.isInteger(r.x)).toBe(true);
    }
  });
});
