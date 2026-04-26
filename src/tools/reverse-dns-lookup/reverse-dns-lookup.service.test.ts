import { afterEach, describe, expect, it, vi } from 'vitest';
import { ipToReverseDnsName, reverseDnsLookup } from './reverse-dns-lookup.service';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('reverse-dns-lookup', () => {
  describe('ipToReverseDnsName', () => {
    it('reverses IPv4 octets and appends in-addr.arpa', () => {
      expect(ipToReverseDnsName('8.8.8.8')).toBe('8.8.8.8.in-addr.arpa');
      expect(ipToReverseDnsName('192.0.2.1')).toBe('1.2.0.192.in-addr.arpa');
    });

    it('reverses IPv6 nibbles and appends ip6.arpa', () => {
      const r = ipToReverseDnsName('2606:4700:4700::1111');
      expect(r.endsWith('.ip6.arpa')).toBe(true);
      // 32 reversed nibbles + the suffix → starts with last nibble of address
      expect(r.startsWith('1.1.1.1.')).toBe(true);
    });

    it('throws on invalid input', () => {
      expect(() => ipToReverseDnsName('not-an-ip')).toThrow();
    });
  });

  describe('reverseDnsLookup', () => {
    it('returns PTR names', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          Status: 0,
          Answer: [{ name: '8.8.8.8.in-addr.arpa', type: 12, TTL: 21600, data: 'dns.google.' }],
        }),
      }));

      const r = await reverseDnsLookup('8.8.8.8');
      expect(r.reverseName).toBe('8.8.8.8.in-addr.arpa');
      expect(r.names).toEqual(['dns.google']);
    });

    it('returns empty names on NXDomain', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ Status: 3 }),
      }));

      const r = await reverseDnsLookup('192.0.2.1');
      expect(r.names).toEqual([]);
      expect(r.status).toBe(3);
    });
  });
});
