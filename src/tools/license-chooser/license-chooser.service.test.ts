import { describe, expect, it } from 'vitest';
import { LICENSES, getLicense, renderLicense } from './license-chooser.service';

describe('license-chooser', () => {
  it('exposes a non-empty list of licenses with required fields', () => {
    expect(LICENSES.length).toBeGreaterThan(5);
    LICENSES.forEach((l) => {
      expect(l.id).toBeTruthy();
      expect(l.name).toBeTruthy();
      expect(l.spdx).toBeTruthy();
      expect(l.text).toBeTruthy();
    });
  });

  it('substitutes author and year placeholders', () => {
    const out = renderLicense('mit', { author: 'Alice', year: '2030' });
    expect(out).toContain('Copyright (c) 2030 Alice');
    expect(out).not.toContain('{{author}}');
    expect(out).not.toContain('{{year}}');
  });

  it('falls back to defaults for empty inputs', () => {
    const out = renderLicense('mit', { author: '', year: '' });
    expect(out).toContain('<author>');
    expect(out).toContain(String(new Date().getFullYear()));
  });

  it('returns empty string for unknown id', () => {
    expect(renderLicense('not-a-license', { author: 'x', year: '2026' })).toBe('');
  });

  it('getLicense returns the right entry', () => {
    expect(getLicense('mit')?.spdx).toBe('MIT');
    expect(getLicense('apache-2.0')?.spdx).toBe('Apache-2.0');
  });
});
