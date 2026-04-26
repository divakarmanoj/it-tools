import { afterEach, describe, expect, it, vi } from 'vitest';
import { asnLookup } from './asn-lookup.service';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('asn-lookup', () => {
  it('parses an IPv4 origin + holder lookup', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Answer: [{ type: 16, data: '"15169 | 8.8.8.0/24 | US | arin | 2023-12-28"' }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Answer: [{ type: 16, data: '"15169 | US | arin | 2000-03-30 | GOOGLE - Google LLC, US"' }],
        }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const r = await asnLookup('8.8.8.8');
    expect(r.origin[0]).toEqual({
      asn: '15169', prefix: '8.8.8.0/24', country: 'US', rir: 'arin', allocated: '2023-12-28',
    });
    expect(r.holder?.name).toBe('GOOGLE - Google LLC, US');
    expect(fetchMock).toHaveBeenNthCalledWith(1,
      expect.stringContaining('8.8.8.8.origin.asn.cymru.com'),
      expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(2,
      expect.stringContaining('AS15169.asn.cymru.com'),
      expect.any(Object));
  });

  it('uses origin6 for IPv6', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ Answer: [] }) });
    vi.stubGlobal('fetch', fetchMock);
    await asnLookup('2606:4700:4700::1111');
    expect(fetchMock.mock.calls[0][0]).toContain('origin6.asn.cymru.com');
  });

  it('throws on bad input', async () => {
    await expect(asnLookup('nope')).rejects.toThrow();
  });
});
