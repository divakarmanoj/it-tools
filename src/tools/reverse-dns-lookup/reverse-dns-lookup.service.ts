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

export function ipToReverseDnsName(ip: string): string {
  const trimmed = ip.trim();
  if (isIpv4(trimmed)) {
    return `${trimmed.split('.').reverse().join('.')}.in-addr.arpa`;
  }
  if (isValidIpv6(trimmed)) {
    const expanded = expandIpv6(trimmed); // 8 hextets, 4 hex digits each
    const nibbles = expanded.replace(/:/g, '').split('').reverse().join('.');
    return `${nibbles}.ip6.arpa`;
  }
  throw new Error('Input must be a valid IPv4 or IPv6 address.');
}

export interface PtrResult {
  ip: string
  reverseName: string
  names: string[]
  status: number
}

const STATUS_NAMES: Record<number, string> = { 0: 'NoError', 3: 'NXDomain' };

export async function reverseDnsLookup(ip: string): Promise<PtrResult> {
  const reverseName = ipToReverseDnsName(ip);
  const url = `https://1.1.1.1/dns-query?name=${encodeURIComponent(reverseName)}&type=PTR`;
  const res = await fetch(url, { headers: { Accept: 'application/dns-json' } });
  if (!res.ok) {
    throw new Error(`DoH request failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  const names = (json.Answer ?? [])
    .filter((a: any) => a.type === 12)
    .map((a: any) => (a.data as string).replace(/\.$/, ''));
  return {
    ip: ip.trim(),
    reverseName,
    names,
    status: json.Status,
  };
}

export const statusName = (s: number) => STATUS_NAMES[s] ?? `Status ${s}`;
