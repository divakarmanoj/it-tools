import { describe, expect, it } from 'vitest';
import {
  buildRobotsTxt,
  buildSitemapXml,
  parseUrlList,
  validateRobotsTxt,
} from './robots-txt-and-sitemap-generator.service';

describe('buildRobotsTxt', () => {
  it('emits a basic group with sitemaps', () => {
    const out = buildRobotsTxt({
      groups: [{ userAgent: '*', allow: ['/'], disallow: ['/admin/'], crawlDelay: 5 }],
      sitemaps: ['https://example.com/sitemap.xml'],
    });
    expect(out).toContain('User-agent: *');
    expect(out).toContain('Allow: /');
    expect(out).toContain('Disallow: /admin/');
    expect(out).toContain('Crawl-delay: 5');
    expect(out).toContain('Sitemap: https://example.com/sitemap.xml');
  });

  it('skips empty allow lines and trims', () => {
    const out = buildRobotsTxt({ groups: [{ userAgent: 'Googlebot', allow: ['', '   '], disallow: ['/'] }], sitemaps: [] });
    expect(out).not.toContain('Allow:');
  });
});

describe('validateRobotsTxt', () => {
  it('flags directives before user-agent', () => {
    const issues = validateRobotsTxt('Disallow: /\nUser-agent: *');
    expect(issues.some(i => i.level === 'error' && i.message.includes('before any User-agent'))).toBe(true);
  });

  it('flags missing colon', () => {
    const issues = validateRobotsTxt('User-agent *\nDisallow /');
    expect(issues.filter(i => i.message.includes('Missing ":"')).length).toBe(2);
  });

  it('flags non-absolute sitemap URL', () => {
    const issues = validateRobotsTxt('User-agent: *\nSitemap: /sitemap.xml');
    expect(issues.some(i => i.level === 'error' && i.message.includes('absolute URL'))).toBe(true);
  });

  it('passes a valid file', () => {
    const issues = validateRobotsTxt('User-agent: *\nDisallow: /admin/\nSitemap: https://x.test/sitemap.xml\n');
    expect(issues.filter(i => i.level === 'error')).toHaveLength(0);
  });
});

describe('sitemap', () => {
  it('parses a plain URL list', () => {
    const { entries, warnings } = parseUrlList('https://a.test\nhttps://b.test');
    expect(entries).toHaveLength(2);
    expect(warnings).toHaveLength(0);
  });

  it('warns on invalid URLs', () => {
    const { entries, warnings } = parseUrlList('not-a-url\nhttps://ok.test');
    expect(entries).toHaveLength(1);
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('supports CSV per-URL overrides', () => {
    const { entries } = parseUrlList('https://a.test,2026-01-01,daily,0.8');
    expect(entries[0]).toMatchObject({ loc: 'https://a.test', lastmod: '2026-01-01', changefreq: 'daily', priority: 0.8 });
  });

  it('builds well-formed XML', () => {
    const xml = buildSitemapXml([
      { loc: 'https://a.test', lastmod: '2026-01-01', changefreq: 'daily', priority: 0.8 },
      { loc: 'https://b.test/path?x=1&y=2' },
    ]);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://a.test</loc>');
    expect(xml).toContain('<priority>0.8</priority>');
    // Ampersands escaped:
    expect(xml).toContain('&amp;');
  });

  it('clamps priority to [0,1]', () => {
    const xml = buildSitemapXml([{ loc: 'https://a.test', priority: 99 }, { loc: 'https://b.test', priority: -5 }]);
    expect(xml).toContain('<priority>1.0</priority>');
    expect(xml).toContain('<priority>0.0</priority>');
  });
});
