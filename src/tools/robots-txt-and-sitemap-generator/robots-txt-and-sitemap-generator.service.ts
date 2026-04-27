// robots.txt builder + validator and sitemap.xml generator (URL-list-based).

// ---------- robots.txt ----------

export interface RobotsGroup {
  userAgent: string
  allow: string[]
  disallow: string[]
  crawlDelay?: number | null
}

export interface RobotsOptions {
  groups: RobotsGroup[]
  sitemaps: string[]
  host?: string
}

export function buildRobotsTxt(opts: RobotsOptions): string {
  const lines: string[] = [];
  for (const g of opts.groups) {
    const ua = (g.userAgent || '*').trim();
    lines.push(`User-agent: ${ua}`);
    for (const path of g.allow) {
      const p = path.trim();
      if (p) {
        lines.push(`Allow: ${p}`);
      }
    }
    for (const path of g.disallow) {
      const p = path.trim();
      lines.push(`Disallow: ${p}`); // empty Disallow is valid (means allow all)
    }
    if (g.crawlDelay != null && Number.isFinite(g.crawlDelay) && g.crawlDelay > 0) {
      lines.push(`Crawl-delay: ${g.crawlDelay}`);
    }
    lines.push('');
  }
  if (opts.host) {
    lines.push(`Host: ${opts.host.trim()}`);
  }
  for (const sm of opts.sitemaps) {
    const s = sm.trim();
    if (s) {
      lines.push(`Sitemap: ${s}`);
    }
  }
  return lines.join('\n').replace(/\n+$/, '\n');
}

export interface RobotsValidationIssue {
  line: number
  level: 'error' | 'warning' | 'info'
  message: string
}

const KNOWN_DIRECTIVES = new Set([
  'user-agent',
  'allow',
  'disallow',
  'crawl-delay',
  'sitemap',
  'host',
  'request-rate',
  'visit-time',
  'noindex', // non-standard, deprecated
  'clean-param',
]);

export function validateRobotsTxt(text: string): RobotsValidationIssue[] {
  const issues: RobotsValidationIssue[] = [];
  const lines = text.split(/\r?\n/);
  let sawUserAgent = false;
  let groupHasUa = false;

  lines.forEach((rawLine, idx) => {
    const lineNo = idx + 1;
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) {
      return;
    }
    const colonAt = line.indexOf(':');
    if (colonAt === -1) {
      issues.push({ line: lineNo, level: 'error', message: 'Missing ":" — directives must be "Field: value".' });
      return;
    }
    const directive = line.slice(0, colonAt).trim().toLowerCase();
    const value = line.slice(colonAt + 1).trim();

    if (!KNOWN_DIRECTIVES.has(directive)) {
      issues.push({ line: lineNo, level: 'warning', message: `Unknown directive "${directive}".` });
    }

    if (directive === 'user-agent') {
      sawUserAgent = true;
      groupHasUa = true;
      if (!value) {
        issues.push({ line: lineNo, level: 'error', message: 'User-agent value is empty.' });
      }
    }

    if ((directive === 'allow' || directive === 'disallow') && !groupHasUa) {
      issues.push({ line: lineNo, level: 'error', message: `${directive} appeared before any User-agent.` });
    }

    if (directive === 'allow' || directive === 'disallow') {
      if (value && !value.startsWith('/') && !value.startsWith('*')) {
        issues.push({ line: lineNo, level: 'warning', message: `${directive} path should start with "/" or "*".` });
      }
    }

    if (directive === 'crawl-delay') {
      const n = Number(value);
      if (!Number.isFinite(n) || n < 0) {
        issues.push({ line: lineNo, level: 'error', message: 'Crawl-delay must be a non-negative number.' });
      }
    }

    if (directive === 'sitemap') {
      try {
        // Sitemaps must be absolute URLs.
        const u = new URL(value);
        if (!['http:', 'https:'].includes(u.protocol)) {
          issues.push({ line: lineNo, level: 'warning', message: 'Sitemap URL should use http or https.' });
        }
      }
      catch {
        issues.push({ line: lineNo, level: 'error', message: 'Sitemap value must be an absolute URL.' });
      }
    }
  });

  if (!sawUserAgent && text.trim()) {
    issues.push({ line: 0, level: 'warning', message: 'No User-agent directive found.' });
  }
  return issues;
}

// ---------- sitemap.xml ----------

export interface SitemapEntry {
  loc: string
  lastmod?: string // ISO date or YYYY-MM-DD
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number // 0.0–1.0
}

const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const SITEMAP_LIMIT = 50_000;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildSitemapXml(entries: SitemapEntry[]): string {
  const out: string[] = [];
  out.push('<?xml version="1.0" encoding="UTF-8"?>');
  out.push(`<urlset xmlns="${SITEMAP_NS}">`);
  for (const e of entries) {
    if (!e.loc) {
      continue;
    }
    out.push('  <url>');
    out.push(`    <loc>${escapeXml(e.loc)}</loc>`);
    if (e.lastmod) {
      out.push(`    <lastmod>${escapeXml(e.lastmod)}</lastmod>`);
    }
    if (e.changefreq) {
      out.push(`    <changefreq>${e.changefreq}</changefreq>`);
    }
    if (e.priority != null && Number.isFinite(e.priority)) {
      const p = Math.max(0, Math.min(1, e.priority));
      out.push(`    <priority>${p.toFixed(1)}</priority>`);
    }
    out.push('  </url>');
  }
  out.push('</urlset>');
  return out.join('\n');
}

// Parse a "URLs as text" input into entries. Accepts:
//   bare URLs (one per line)
//   "URL,YYYY-MM-DD,changefreq,priority" CSV-ish lines
export function parseUrlList(text: string, defaults: Partial<SitemapEntry> = {}): { entries: SitemapEntry[]; warnings: string[] } {
  const entries: SitemapEntry[] = [];
  const warnings: string[] = [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length > SITEMAP_LIMIT) {
    warnings.push(`Truncated to ${SITEMAP_LIMIT} URLs (sitemap.xml spec limit).`);
  }
  for (const line of lines.slice(0, SITEMAP_LIMIT)) {
    const parts = line.split(',').map(p => p.trim());
    const [loc, lastmod, changefreq, priorityRaw] = parts;
    if (!loc) {
      continue;
    }
    try {
      // eslint-disable-next-line no-new
      new URL(loc);
    }
    catch {
      warnings.push(`Skipping invalid URL: ${loc}`);
      continue;
    }
    const priority = priorityRaw ? Number(priorityRaw) : defaults.priority;
    entries.push({
      loc,
      lastmod: lastmod || defaults.lastmod,
      changefreq: (changefreq as SitemapEntry['changefreq']) || defaults.changefreq,
      priority,
    });
  }
  return { entries, warnings };
}
