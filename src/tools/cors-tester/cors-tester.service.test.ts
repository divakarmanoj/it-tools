import { describe, expect, it } from 'vitest';
import { buildCurl, classifyAllow } from './cors-tester.service';

describe('buildCurl', () => {
  it('builds an OPTIONS curl with origin and request method headers', () => {
    const c = buildCurl({ url: 'https://api.test/foo', method: 'POST', origin: 'https://app.test', requestHeaders: ['Authorization', 'Content-Type'] });
    expect(c).toContain('curl -v -X OPTIONS');
    expect(c).toContain('\'https://api.test/foo\'');
    expect(c).toContain('-H \'Origin: https://app.test\'');
    expect(c).toContain('-H \'Access-Control-Request-Method: POST\'');
    expect(c).toContain('-H \'Access-Control-Request-Headers: Authorization, Content-Type\'');
  });

  it('omits Access-Control-Request-Headers when none', () => {
    const c = buildCurl({ url: 'https://x', method: 'GET', origin: 'https://o', requestHeaders: [] });
    expect(c).not.toContain('Access-Control-Request-Headers');
  });

  it('falls back to a placeholder origin when none provided', () => {
    const c = buildCurl({ url: 'https://x', method: 'GET', requestHeaders: [] });
    expect(c).toContain('your-frontend.example');
  });
});

describe('classifyAllow', () => {
  it('treats * as origin match', () => {
    const r = classifyAllow({ allowOrigin: '*', allowMethods: 'GET', allowHeaders: null, origin: 'https://app.test', method: 'GET', requestHeaders: [] });
    expect(r.willMatchOrigin).toBe(true);
    expect(r.willAllowMethod).toBe(true);
    expect(r.willAllowHeaders).toBe(true);
  });

  it('only matches origin when echoed exactly', () => {
    const r = classifyAllow({ allowOrigin: 'https://other.test', allowMethods: null, allowHeaders: null, origin: 'https://app.test', method: 'GET', requestHeaders: [] });
    expect(r.willMatchOrigin).toBe(false);
  });

  it('returns null for origin when no Allow-Origin and origin is empty', () => {
    const r = classifyAllow({ allowOrigin: null, allowMethods: null, allowHeaders: null, origin: '', method: 'GET', requestHeaders: [] });
    expect(r.willMatchOrigin).toBe(null);
  });

  it('matches method when in comma list', () => {
    const r = classifyAllow({ allowOrigin: '*', allowMethods: 'GET, POST, PUT', allowHeaders: null, origin: '', method: 'POST', requestHeaders: [] });
    expect(r.willAllowMethod).toBe(true);
  });

  it('rejects method missing from comma list', () => {
    const r = classifyAllow({ allowOrigin: '*', allowMethods: 'GET, POST', allowHeaders: null, origin: '', method: 'PATCH', requestHeaders: [] });
    expect(r.willAllowMethod).toBe(false);
  });

  it('requires every requested header to be allowed', () => {
    const r1 = classifyAllow({ allowOrigin: '*', allowMethods: '*', allowHeaders: 'Authorization, Content-Type', origin: '', method: 'GET', requestHeaders: ['authorization', 'content-type'] });
    expect(r1.willAllowHeaders).toBe(true);
    const r2 = classifyAllow({ allowOrigin: '*', allowMethods: '*', allowHeaders: 'Authorization', origin: '', method: 'GET', requestHeaders: ['Authorization', 'Content-Type'] });
    expect(r2.willAllowHeaders).toBe(false);
  });

  it('treats * in Allow-Headers as wildcard', () => {
    const r = classifyAllow({ allowOrigin: '*', allowMethods: '*', allowHeaders: '*', origin: '', method: 'GET', requestHeaders: ['anything'] });
    expect(r.willAllowHeaders).toBe(true);
  });
});
