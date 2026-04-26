import { describe, expect, it } from 'vitest';
import { convert, parseCsv, serializeCsv } from './data-converter.service';

describe('data-converter service', () => {
  describe('convert', () => {
    it('converts JSON to YAML', () => {
      expect(convert({ from: 'json', to: 'yaml', text: '{"a":1,"b":[2,3]}' })).toMatchInlineSnapshot(`
        "a: 1
        b:
          - 2
          - 3
        "
      `);
    });

    it('converts YAML to JSON', () => {
      expect(convert({ from: 'yaml', to: 'json', text: 'a: 1\nb:\n  - 2\n  - 3\n' }))
        .toBe('{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}\n');
    });

    it('converts JSON to TOML', () => {
      expect(convert({ from: 'json', to: 'toml', text: '{"title":"hi","owner":{"name":"x"}}' }))
        .toBe('title = "hi"\n\n[owner]\nname = "x"\n');
    });

    it('converts TOML to JSON', () => {
      expect(convert({ from: 'toml', to: 'json', text: 'title = "hi"\n[owner]\nname = "x"\n' }))
        .toBe('{\n  "title": "hi",\n  "owner": {\n    "name": "x"\n  }\n}\n');
    });

    it('converts JSON to CSV (array of records)', () => {
      const text = '[{"a":1,"b":2},{"a":3,"c":4}]';
      expect(convert({ from: 'json', to: 'csv', text })).toBe('a,b,c\n1,2,\n3,,4\n');
    });

    it('converts CSV to JSON', () => {
      const text = 'name,age\nAlice,30\nBob,25\n';
      expect(convert({ from: 'csv', to: 'json', text }))
        .toBe('[\n  {\n    "name": "Alice",\n    "age": "30"\n  },\n  {\n    "name": "Bob",\n    "age": "25"\n  }\n]\n');
    });

    it('throws when TOML target receives a non-object root', () => {
      expect(() => convert({ from: 'json', to: 'toml', text: '[1,2,3]' })).toThrow(/top-level object/);
    });

    it('round-trips JSON → YAML → TOML → JSON', () => {
      const source = '{"server":{"host":"localhost","port":8080},"flags":["a","b"]}';
      const yaml = convert({ from: 'json', to: 'yaml', text: source });
      const toml = convert({ from: 'yaml', to: 'toml', text: yaml });
      const json = convert({ from: 'toml', to: 'json', text: toml });
      expect(JSON.parse(json)).toEqual(JSON.parse(source));
    });
  });

  describe('parseCsv', () => {
    it('handles quoted fields with commas, quotes, and newlines', () => {
      const csv = 'a,b\n"hello, world","line1\nline2"\n"she said ""hi""",x';
      expect(parseCsv(csv)).toEqual([
        { a: 'hello, world', b: 'line1\nline2' },
        { a: 'she said "hi"', b: 'x' },
      ]);
    });

    it('returns an empty array for an empty input', () => {
      expect(parseCsv('')).toEqual([]);
    });

    it('ignores trailing blank lines', () => {
      expect(parseCsv('a,b\n1,2\n\n')).toEqual([{ a: '1', b: '2' }]);
    });
  });

  describe('serializeCsv', () => {
    it('escapes quotes by doubling them (RFC 4180)', () => {
      expect(serializeCsv([{ a: 'hello "world"' }])).toBe('a\n"hello ""world"""\n');
    });

    it('wraps a single object as a one-row CSV', () => {
      expect(serializeCsv({ a: 1, b: 2 })).toBe('a,b\n1,2\n');
    });
  });
});
