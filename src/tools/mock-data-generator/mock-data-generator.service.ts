// Mock data generator built on @faker-js/faker. Lazy import so the bundle
// only loads when the user actually uses this tool.

export interface FieldDef {
  name: string
  // Each kind maps to a generator below.
  kind: FieldKind
  // Optional override for the seed-stable RNG (handy when wanting deterministic output).
  enumValues?: string
}

export type FieldKind
  = | 'firstName' | 'lastName' | 'fullName'
  | 'email' | 'username' | 'phone'
  | 'streetAddress' | 'city' | 'country' | 'zipCode'
  | 'companyName' | 'jobTitle'
  | 'word' | 'sentence' | 'paragraph'
  | 'uuid'
  | 'integer' | 'float' | 'boolean'
  | 'isoDate' | 'pastDate' | 'futureDate'
  | 'url' | 'imageUrl' | 'ipv4' | 'ipv6' | 'macAddress'
  | 'creditCardNumber' | 'currencyCode' | 'currencyAmount'
  | 'enum' | 'arrayIndex';

export const FIELD_KIND_OPTIONS: { value: FieldKind; label: string; group: string }[] = [
  { value: 'firstName', label: 'First name', group: 'Person' },
  { value: 'lastName', label: 'Last name', group: 'Person' },
  { value: 'fullName', label: 'Full name', group: 'Person' },
  { value: 'email', label: 'Email', group: 'Person' },
  { value: 'username', label: 'Username', group: 'Person' },
  { value: 'phone', label: 'Phone number', group: 'Person' },

  { value: 'streetAddress', label: 'Street address', group: 'Location' },
  { value: 'city', label: 'City', group: 'Location' },
  { value: 'country', label: 'Country', group: 'Location' },
  { value: 'zipCode', label: 'Zip / postal code', group: 'Location' },

  { value: 'companyName', label: 'Company name', group: 'Company' },
  { value: 'jobTitle', label: 'Job title', group: 'Company' },

  { value: 'word', label: 'Random word', group: 'Lorem' },
  { value: 'sentence', label: 'Random sentence', group: 'Lorem' },
  { value: 'paragraph', label: 'Random paragraph', group: 'Lorem' },

  { value: 'uuid', label: 'UUID v4', group: 'IDs' },
  { value: 'integer', label: 'Integer (1–1000)', group: 'Numbers' },
  { value: 'float', label: 'Float (0–1)', group: 'Numbers' },
  { value: 'boolean', label: 'Boolean', group: 'Numbers' },
  { value: 'arrayIndex', label: 'Sequential index (0..n-1)', group: 'Numbers' },

  { value: 'isoDate', label: 'ISO date (recent)', group: 'Dates' },
  { value: 'pastDate', label: 'Past date', group: 'Dates' },
  { value: 'futureDate', label: 'Future date', group: 'Dates' },

  { value: 'url', label: 'URL', group: 'Internet' },
  { value: 'imageUrl', label: 'Image URL', group: 'Internet' },
  { value: 'ipv4', label: 'IPv4', group: 'Internet' },
  { value: 'ipv6', label: 'IPv6', group: 'Internet' },
  { value: 'macAddress', label: 'MAC address', group: 'Internet' },

  { value: 'creditCardNumber', label: 'Credit card number', group: 'Finance' },
  { value: 'currencyCode', label: 'Currency code', group: 'Finance' },
  { value: 'currencyAmount', label: 'Currency amount', group: 'Finance' },

  { value: 'enum', label: 'Enum (custom values, comma-separated)', group: 'Custom' },
];

export interface GenerateOptions {
  fields: FieldDef[]
  count: number
  format: 'json' | 'csv' | 'sql'
  tableName?: string // for SQL
  seed?: number
}

async function loadFaker() {
  const mod = await import('@faker-js/faker');
  return mod.faker;
}

function valueFor(faker: any, def: FieldDef, idx: number): unknown {
  switch (def.kind) {
    case 'firstName': return faker.person.firstName();
    case 'lastName': return faker.person.lastName();
    case 'fullName': return faker.person.fullName();
    case 'email': return faker.internet.email();
    case 'username': return faker.internet.userName();
    case 'phone': return faker.phone.number();

    case 'streetAddress': return faker.location.streetAddress();
    case 'city': return faker.location.city();
    case 'country': return faker.location.country();
    case 'zipCode': return faker.location.zipCode();

    case 'companyName': return faker.company.name();
    case 'jobTitle': return faker.person.jobTitle();

    case 'word': return faker.lorem.word();
    case 'sentence': return faker.lorem.sentence();
    case 'paragraph': return faker.lorem.paragraph();

    case 'uuid': return faker.string.uuid();
    case 'integer': return faker.number.int({ min: 1, max: 1000 });
    case 'float': return Number(faker.number.float({ min: 0, max: 1, fractionDigits: 4 }).toFixed(4));
    case 'boolean': return faker.datatype.boolean();
    case 'arrayIndex': return idx;

    case 'isoDate': return faker.date.recent({ days: 30 }).toISOString();
    case 'pastDate': return faker.date.past({ years: 5 }).toISOString();
    case 'futureDate': return faker.date.future({ years: 1 }).toISOString();

    case 'url': return faker.internet.url();
    case 'imageUrl': return faker.image.urlPicsumPhotos();
    case 'ipv4': return faker.internet.ipv4();
    case 'ipv6': return faker.internet.ipv6();
    case 'macAddress': return faker.internet.mac();

    case 'creditCardNumber': return faker.finance.creditCardNumber();
    case 'currencyCode': return faker.finance.currencyCode();
    case 'currencyAmount': return Number(faker.finance.amount());

    case 'enum': {
      const values = (def.enumValues ?? '').split(',').map(s => s.trim()).filter(Boolean);
      if (!values.length) {
        return null;
      }
      return faker.helpers.arrayElement(values);
    }

    default: return null;
  }
}

function toCsv(rows: Record<string, unknown>[], headers: string[]): string {
  const escape = (val: unknown) => {
    const s = val == null ? '' : String(val);
    if (/["\n,]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [headers.map(escape).join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

function toSql(rows: Record<string, unknown>[], headers: string[], tableName: string): string {
  const safeTable = tableName.replace(/[^a-zA-Z0-9_]/g, '_') || 'mock_data';
  const literal = (v: unknown): string => {
    if (v == null) {
      return 'NULL';
    }
    if (typeof v === 'number') {
      return String(v);
    }
    if (typeof v === 'boolean') {
      return v ? 'TRUE' : 'FALSE';
    }
    return `'${String(v).replace(/'/g, '\'\'')}'`;
  };
  const cols = headers.map(h => `"${h}"`).join(', ');
  const out: string[] = [];
  for (const row of rows) {
    const vals = headers.map(h => literal(row[h])).join(', ');
    out.push(`INSERT INTO "${safeTable}" (${cols}) VALUES (${vals});`);
  }
  return out.join('\n');
}

export async function generateMockData(opts: GenerateOptions): Promise<string> {
  const faker = await loadFaker();
  if (opts.seed != null) {
    faker.seed(opts.seed);
  }

  const fields = opts.fields.filter(f => f.name);
  const rows: Record<string, unknown>[] = [];
  const count = Math.max(0, Math.min(10_000, Math.floor(opts.count)));
  for (let i = 0; i < count; i++) {
    const obj: Record<string, unknown> = {};
    for (const f of fields) {
      obj[f.name] = valueFor(faker, f, i);
    }
    rows.push(obj);
  }
  const headers = fields.map(f => f.name);
  switch (opts.format) {
    case 'json': return JSON.stringify(rows, null, 2);
    case 'csv': return toCsv(rows, headers);
    case 'sql': return toSql(rows, headers, opts.tableName ?? 'mock_data');
    default: return '';
  }
}
