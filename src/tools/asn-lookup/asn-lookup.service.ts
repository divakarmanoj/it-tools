import { expandIpv6, isValidIpv6 } from '../ipv6-expander/ipv6-expander.service';

function isIpv4(s: string): boolean {
  if (!/^[0-9.]+$/.test(s) || s.split('.').length !== 4) {
    return false;
  }
  return s.split('.').every((o) => {
    const n = Number(o);
    return Number.isInteger(n) && n >= 0 && n <= 255 && o === String(n);
  });
}

function originQueryName(ip: string): string {
  const trimmed = ip.trim();
  if (isIpv4(trimmed)) {
    return `${trimmed.split('.').reverse().join('.')}.origin.asn.cymru.com`;
  }
  if (isValidIpv6(trimmed)) {
    const expanded = expandIpv6(trimmed);
    const nibbles = expanded.replace(/:/g, '').split('').reverse().join('.');
    return `${nibbles}.origin6.asn.cymru.com`;
  }
  throw new Error('Input must be a valid IPv4 or IPv6 address.');
}

async function dohTxt(name: string): Promise<string[]> {
  const url = `https://1.1.1.1/dns-query?name=${encodeURIComponent(name)}&type=TXT`;
  const res = await fetch(url, { headers: { Accept: 'application/dns-json' } });
  if (!res.ok) {
    throw new Error(`DoH request failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return ((json.Answer ?? []) as Array<{ type: number; data: string }>)
    .filter(a => a.type === 16)
    .map(a => a.data.replace(/^"|"$/g, ''));
}

export interface AsnRecord {
  asn: string
  prefix: string
  country: string
  rir: string
  allocated: string
}

export interface AsnHolder {
  asn: string
  country: string
  rir: string
  allocated: string
  name: string
}

export interface AsnResult {
  ip: string
  origin: AsnRecord[]
  holder: AsnHolder | null
}

function parseOrigin(s: string): AsnRecord {
  const [asn = '', prefix = '', country = '', rir = '', allocated = ''] = s.split('|').map(p => p.trim());
  return { asn, prefix, country, rir, allocated };
}

function parseHolder(s: string): AsnHolder {
  const [asn = '', country = '', rir = '', allocated = '', name = ''] = s.split('|').map(p => p.trim());
  return { asn, country, rir, allocated, name };
}

export async function asnLookup(ip: string): Promise<AsnResult> {
  const txts = await dohTxt(originQueryName(ip));
  const origin = txts.map(parseOrigin);

  let holder: AsnHolder | null = null;
  if (origin[0]?.asn) {
    // The origin TXT may contain multiple ASNs space-separated; take the first.
    const firstAsn = origin[0].asn.split(/\s+/)[0];
    const holderTxts = await dohTxt(`AS${firstAsn}.asn.cymru.com`);
    if (holderTxts[0]) {
      holder = parseHolder(holderTxts[0]);
    }
  }

  return { ip: ip.trim(), origin, holder };
}
