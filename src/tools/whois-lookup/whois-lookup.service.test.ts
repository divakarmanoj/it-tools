import { afterEach, describe, expect, it, vi } from 'vitest';
import { whoisLookup } from './whois-lookup.service';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('whois-lookup', () => {
  it('routes IPv4 to /ip/ and parses key fields', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        handle: 'NET-8-0-0-0-1',
        startAddress: '8.0.0.0',
        endAddress: '8.255.255.255',
        country: 'US',
        name: 'LVLT-ORG-8-8',
        events: [
          { eventAction: 'registration', eventDate: '1992-12-01T05:00:00Z' },
          { eventAction: 'last changed', eventDate: '2018-04-23T17:53:43Z' },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const r = await whoisLookup('8.8.8.8');
    expect(fetchMock).toHaveBeenCalledWith('https://rdap.org/ip/8.8.8.8', expect.any(Object));
    expect(r.kind).toBe('ip');
    expect(r.fields.find(f => f.label === 'Country')?.value).toBe('US');
    expect(r.fields.find(f => f.label === 'Range')?.value).toBe('8.0.0.0 – 8.255.255.255');
  });

  it('routes a domain to /domain/ and surfaces registration date + nameservers', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ldhName: 'example.com',
        status: ['client transfer prohibited'],
        events: [
          { eventAction: 'registration', eventDate: '1995-08-14T04:00:00Z' },
          { eventAction: 'expiration', eventDate: '2026-08-13T04:00:00Z' },
        ],
        nameservers: [{ ldhName: 'a.iana-servers.net' }, { ldhName: 'b.iana-servers.net' }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const r = await whoisLookup('example.com');
    expect(fetchMock).toHaveBeenCalledWith('https://rdap.org/domain/example.com', expect.any(Object));
    expect(r.kind).toBe('domain');
    expect(r.fields.find(f => f.label === 'Domain')?.value).toBe('example.com');
    expect(r.fields.find(f => f.label === 'Nameservers')?.value).toContain('a.iana-servers.net');
  });

  it('throws on empty query', async () => {
    await expect(whoisLookup('   ')).rejects.toThrow('required');
  });
});
