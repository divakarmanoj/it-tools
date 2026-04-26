export type RecordType = 'A' | 'AAAA' | 'MX' | 'TXT' | 'CAA' | 'NS' | 'SOA' | 'CNAME' | 'PTR' | 'SRV';

export const RECORD_TYPES: RecordType[] = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'SOA', 'CAA', 'SRV'];

const STATUS_NAMES: Record<number, string> = {
  0: 'NoError',
  1: 'FormErr',
  2: 'ServFail',
  3: 'NXDomain',
  4: 'NotImp',
  5: 'Refused',
};

export interface DohAnswer {
  name: string
  type: number
  TTL: number
  data: string
}

export interface DohResult {
  status: number
  statusName: string
  question: { name: string; type: string }
  answers: DohAnswer[]
  authority: DohAnswer[]
}

/** Record types shown in the multi-lookup view, in the order they should render. */
export const ALL_RECORD_TYPES: RecordType[] = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'CAA', 'SRV'];

export interface DohMultiResultEntry {
  type: RecordType
  status: number
  statusName: string
  answers: DohAnswer[]
  error?: string
}

export interface DohMultiResult {
  question: string
  results: DohMultiResultEntry[]
}

export async function dnsLookupAll(name: string): Promise<DohMultiResult> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Domain name is required.');
  }

  const settled = await Promise.all(
    ALL_RECORD_TYPES.map(async (type): Promise<DohMultiResultEntry> => {
      try {
        const r = await dnsLookup({ name: trimmed, type });
        return { type, status: r.status, statusName: r.statusName, answers: r.answers };
      }
      catch (e: any) {
        return { type, status: -1, statusName: 'Error', answers: [], error: e?.message ?? String(e) };
      }
    }),
  );

  return { question: trimmed, results: settled };
}

export async function dnsLookup({ name, type }: { name: string; type: RecordType }): Promise<DohResult> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Domain name is required.');
  }
  const url = `https://1.1.1.1/dns-query?name=${encodeURIComponent(trimmed)}&type=${encodeURIComponent(type)}`;
  const res = await fetch(url, { headers: { Accept: 'application/dns-json' } });
  if (!res.ok) {
    throw new Error(`DoH request failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return {
    status: json.Status,
    statusName: STATUS_NAMES[json.Status] ?? `Unknown(${json.Status})`,
    question: { name: json.Question?.[0]?.name ?? trimmed, type },
    answers: json.Answer ?? [],
    authority: json.Authority ?? [],
  };
}
