import { afterEach, describe, expect, it, vi } from 'vitest';
import { ALL_RECORD_TYPES, dnsLookup, dnsLookupAll } from './dns-lookup.service';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('dns-lookup', () => {
  it('parses a NoError response with answers', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        Status: 0,
        Question: [{ name: 'example.com', type: 1 }],
        Answer: [{ name: 'example.com', type: 1, TTL: 300, data: '93.184.216.34' }],
      }),
    }));

    const r = await dnsLookup({ name: 'example.com', type: 'A' });
    expect(r.status).toBe(0);
    expect(r.statusName).toBe('NoError');
    expect(r.answers).toHaveLength(1);
    expect(r.answers[0].data).toBe('93.184.216.34');
  });

  it('handles NXDomain with authority', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        Status: 3,
        Question: [{ name: 'no.such.tld', type: 1 }],
        Authority: [{ name: 'tld', type: 6, TTL: 60, data: 'soa-rdata' }],
      }),
    }));

    const r = await dnsLookup({ name: 'no.such.tld', type: 'A' });
    expect(r.statusName).toBe('NXDomain');
    expect(r.answers).toEqual([]);
    expect(r.authority).toHaveLength(1);
  });

  it('throws on empty input', async () => {
    await expect(dnsLookup({ name: '   ', type: 'A' })).rejects.toThrow('required');
  });

  it('throws on non-OK HTTP response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 502, statusText: 'Bad Gateway' }));
    await expect(dnsLookup({ name: 'x', type: 'A' })).rejects.toThrow(/502/);
  });

  describe('dnsLookupAll', () => {
    it('queries every type in parallel and aggregates results', async () => {
      const fetchMock = vi.fn().mockImplementation((url: string) => {
        const type = new URL(url).searchParams.get('type');
        return Promise.resolve({
          ok: true,
          json: async () => ({
            Status: 0,
            Question: [{ name: 'example.com', type }],
            Answer: type === 'A' ? [{ name: 'example.com', type: 1, TTL: 300, data: '1.2.3.4' }] : [],
          }),
        });
      });
      vi.stubGlobal('fetch', fetchMock);

      const r = await dnsLookupAll('example.com');
      expect(fetchMock).toHaveBeenCalledTimes(ALL_RECORD_TYPES.length);
      expect(r.results.map(e => e.type)).toEqual(ALL_RECORD_TYPES);
      expect(r.results.find(e => e.type === 'A')?.answers).toHaveLength(1);
      expect(r.results.find(e => e.type === 'MX')?.answers).toHaveLength(0);
    });

    it('captures per-type errors without failing the whole batch', async () => {
      const fetchMock = vi.fn().mockImplementation((url: string) => {
        const type = new URL(url).searchParams.get('type');
        if (type === 'CAA') {
          return Promise.resolve({ ok: false, status: 502, statusText: 'Bad Gateway' });
        }
        return Promise.resolve({ ok: true, json: async () => ({ Status: 0, Answer: [] }) });
      });
      vi.stubGlobal('fetch', fetchMock);

      const r = await dnsLookupAll('example.com');
      const caa = r.results.find(e => e.type === 'CAA');
      expect(caa?.error).toMatch(/502/);
      expect(r.results.filter(e => !e.error)).toHaveLength(ALL_RECORD_TYPES.length - 1);
    });

    it('throws on empty input', async () => {
      await expect(dnsLookupAll('  ')).rejects.toThrow('required');
    });
  });
});
