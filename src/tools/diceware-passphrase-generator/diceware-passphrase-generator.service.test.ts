import { describe, expect, it } from 'vitest';
import {
  BITS_PER_WORD,
  WORDLIST_SIZE,
  entropyBits,
  generatePassphrase,
  pickWord,
} from './diceware-passphrase-generator.service';
import { effLargeWordlist } from './eff-large-wordlist';

describe('diceware-passphrase-generator', () => {
  it('bundles the EFF large wordlist (7,776 words)', () => {
    expect(WORDLIST_SIZE).toBe(7776);
    expect(effLargeWordlist).toHaveLength(7776);
  });

  it('exposes ~12.92 bits per word', () => {
    expect(BITS_PER_WORD).toBeCloseTo(Math.log2(7776), 6);
  });

  describe('pickWord', () => {
    it('returns a word from the wordlist', () => {
      const word = pickWord();
      expect(effLargeWordlist).toContain(word);
    });
  });

  describe('generatePassphrase', () => {
    it('produces the requested number of words', () => {
      const phrase = generatePassphrase({ count: 6, separator: '-', capitalize: false, includeNumber: false });
      expect(phrase.split('-')).toHaveLength(6);
    });

    it('respects the separator', () => {
      const phrase = generatePassphrase({ count: 4, separator: '_', capitalize: false, includeNumber: false });
      expect(phrase.split('_')).toHaveLength(4);
    });

    it('capitalizes when requested', () => {
      const phrase = generatePassphrase({ count: 4, separator: ' ', capitalize: true, includeNumber: false });
      for (const w of phrase.split(' ')) {
        expect(w[0]).toBe(w[0].toUpperCase());
      }
    });

    it('appends a single digit when includeNumber is true', () => {
      const phrase = generatePassphrase({ count: 4, separator: '-', capitalize: false, includeNumber: true });
      expect(phrase).toMatch(/\d/);
    });
  });

  describe('entropyBits', () => {
    it('matches count * log2(wordlistSize)', () => {
      expect(entropyBits(6)).toBeCloseTo(6 * Math.log2(7776), 6);
      expect(entropyBits(8)).toBeCloseTo(8 * Math.log2(7776), 6);
    });
  });
});
