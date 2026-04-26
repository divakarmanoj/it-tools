import { afterEach, describe, expect, it, vi } from 'vitest';
import { dnsLookup } from './dns-lookup.service';

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
});
