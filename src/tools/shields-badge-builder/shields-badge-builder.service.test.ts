import { describe, expect, it } from 'vitest';
import { buildBadgeUrl, buildHtml, buildMarkdown } from './shields-badge-builder.service';

describe('shields-badge-builder', () => {
  it('builds a basic badge URL', () => {
    const url = buildBadgeUrl({ label: 'build', message: 'passing', color: 'brightgreen' });
    expect(url).toBe('https://img.shields.io/badge/build-passing-brightgreen');
  });

  it('escapes spaces, dashes, and underscores per shields.io rules', () => {
    const url = buildBadgeUrl({ label: 'code style', message: 'awesome-stuff_here', color: 'blue' });
    // " " -> "_", "-" -> "--", "_" -> "__"
    expect(url).toContain('code_style');
    expect(url).toContain('awesome--stuff__here');
  });

  it('appends style and logo as query params', () => {
    const url = buildBadgeUrl({ label: 'l', message: 'm', color: 'red', style: 'for-the-badge', logo: 'github', logoColor: 'white' });
    expect(url).toContain('style=for-the-badge');
    expect(url).toContain('logo=github');
    expect(url).toContain('logoColor=white');
  });

  it('omits label segment when label is empty', () => {
    const url = buildBadgeUrl({ label: '', message: 'hello', color: 'blue' });
    expect(url).toBe('https://img.shields.io/badge/hello-blue');
  });

  it('builds markdown with optional link', () => {
    expect(buildMarkdown({ label: 'a', message: 'b', color: 'blue' })).toContain('![a: b](');
    expect(buildMarkdown({ label: 'a', message: 'b', color: 'blue', link: 'https://x.test' })).toMatch(/^\[!\[.*]\(.*\)]\(https:\/\/x\.test\)$/);
  });

  it('builds html with optional link', () => {
    expect(buildHtml({ label: 'a', message: 'b', color: 'blue' })).toContain('<img src=');
    expect(buildHtml({ label: 'a', message: 'b', color: 'blue', link: 'https://x.test' })).toContain('<a href="https://x.test">');
  });
});
