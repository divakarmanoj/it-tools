import { describe, expect, it } from 'vitest';
import { TEMPLATES, buildGitignore } from './gitignore-templates';

describe('gitignore-generator', () => {
  it('has at least 20 templates', () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(20);
  });

  it('builds with header per template', () => {
    const out = buildGitignore(['node', 'python']);
    expect(out).toContain('### Node');
    expect(out).toContain('### Python');
    expect(out).toContain('node_modules/');
    expect(out).toContain('__pycache__/');
  });

  it('deduplicates templates', () => {
    const out = buildGitignore(['node', 'node']);
    const matches = out.match(/### Node/g);
    expect(matches?.length).toBe(1);
  });

  it('skips unknown ids', () => {
    const out = buildGitignore(['nope', 'node']);
    expect(out).toContain('### Node');
    expect(out).not.toContain('nope');
  });

  it('returns empty string when no ids match', () => {
    expect(buildGitignore([])).toBe('');
    expect(buildGitignore(['nope'])).toBe('');
  });
});
