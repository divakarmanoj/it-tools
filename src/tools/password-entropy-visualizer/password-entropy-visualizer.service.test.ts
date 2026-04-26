import { describe, expect, it } from 'vitest';
import { analyzePassword } from './password-entropy-visualizer.service';

describe('password-entropy-visualizer', () => {
  it('returns zero entropy for empty input', () => {
    const result = analyzePassword('');
    expect(result.entropyBits).toBe(0);
    expect(result.charsetSize).toBe(0);
    expect(result.length).toBe(0);
  });

  it('detects lowercase + digits charset (length * log2(36))', () => {
    const result = analyzePassword('hello42');
    expect(result.length).toBe(7);
    expect(result.charsetSize).toBe(36);
    expect(result.entropyBits).toBeCloseTo(7 * Math.log2(36), 6);
  });

  it('detects all four ASCII classes (94 chars)', () => {
    const result = analyzePassword('Aa1!');
    expect(result.charsetSize).toBe(26 + 26 + 10 + 32);
    expect(result.entropyBits).toBeCloseTo(4 * Math.log2(94), 6);
  });

  it('per-segment counts sum to password length', () => {
    const result = analyzePassword('Hello World 1!');
    const sum = result.segments.reduce((acc, s) => acc + s.count, 0);
    expect(sum).toBe(result.length);
  });

  it('crack-time scales monotonically with length', () => {
    const short = analyzePassword('Aa1!');
    const long = analyzePassword('Aa1!Aa1!Aa1!');
    const shortFastest = short.crackTimes[short.crackTimes.length - 1].seconds;
    const longFastest = long.crackTimes[long.crackTimes.length - 1].seconds;
    expect(longFastest).toBeGreaterThan(shortFastest);
  });

  it('flags unicode characters', () => {
    const result = analyzePassword('héllo🚀');
    const unicodeSeg = result.segments.find(s => s.name === 'Unicode');
    expect(unicodeSeg!.count).toBeGreaterThan(0);
  });
});
