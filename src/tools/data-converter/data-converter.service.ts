import JSON5 from 'json5';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { parse as parseToml, stringify as stringifyToml } from 'iarna-toml-esm';
import xmlJs from 'xml-js';

export type DataFormat = 'json' | 'yaml' | 'toml' | 'xml' | 'csv';

export const dataFormats: { label: string; value: DataFormat }[] = [
  { label: 'JSON', value: 'json' },
  { label: 'YAML', value: 'yaml' },
  { label: 'TOML', value: 'toml' },
  { label: 'XML', value: 'xml' },
  { label: 'CSV', value: 'csv' },
];

export function parse({ format, text }: { format: DataFormat; text: string }): unknown {
  if (text.trim() === '') {
    return undefined;
  }
  switch (format) {
    case 'json':
      return JSON5.parse(text);
    case 'yaml':
      return parseYaml(text, { merge: true });
    case 'toml':
      return parseToml(text);
    case 'xml':
      return xmlJs.xml2js(text, { compact: true, nativeType: true });
    case 'csv':
      return parseCsv(text);
  }
}

export function serialize({ format, value }: { format: DataFormat; value: unknown }): string {
  if (value === undefined) {
    return '';
  }
  switch (format) {
    case 'json':
      return `${JSON.stringify(value, null, 2)}\n`;
    case 'yaml':
      return stringifyYaml(value);
    case 'toml':
      if (!isPlainObject(value)) {
        throw new Error('TOML output requires a top-level object (table). Wrap arrays under a key.');
      }
      return [stringifyToml(value as Record<string, unknown>)].flat().join('\n').trim() + '\n';
    case 'xml':
      return xmlJs.js2xml(value as object, { compact: true, spaces: 2 });
    case 'csv':
      return serializeCsv(value);
  }
}

export function convert({ from, to, text }: { from: DataFormat; to: DataFormat; text: string }): string {
  return serialize({ format: to, value: parse({ format: from, text }) });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function toRecordArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.map(row => isPlainObject(row) ? row : { value: row });
  }
  if (isPlainObject(value)) {
    return [value];
  }
  return [{ value }];
}

function csvEscape(raw: unknown): string {
  if (raw === null || raw === undefined) {
    return '';
  }
  const str = typeof raw === 'object' ? JSON.stringify(raw) : String(raw);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function serializeCsv(value: unknown): string {
  const rows = toRecordArray(value);
  if (rows.length === 0) {
    return '';
  }
  const headers: string[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        headers.push(key);
      }
    }
  }
  const lines = [headers.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => csvEscape(row[h])).join(','));
  }
  return `${lines.join('\n')}\n`;
}

export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [[]];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const src = text.replace(/\r\n?/g, '\n');

  while (i < src.length) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ',') {
      rows[rows.length - 1].push(field);
      field = '';
      i++;
      continue;
    }
    if (ch === '\n') {
      rows[rows.length - 1].push(field);
      field = '';
      rows.push([]);
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  rows[rows.length - 1].push(field);

  while (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') {
    rows.pop();
  }
  if (rows.length === 0) {
    return [];
  }
  const headers = rows.shift()!;
  return rows.map((cells) => {
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = cells[idx] ?? '';
    });
    return record;
  });
}
