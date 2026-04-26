import { effLargeWordlist } from './eff-large-wordlist';

export const WORDLIST_SIZE = effLargeWordlist.length;
export const BITS_PER_WORD = Math.log2(WORDLIST_SIZE);

function unbiasedRandomIndex(modulus: number): number {
  // Rejection-sampled random index in [0, modulus). Avoids modulo bias.
  const range = 0x100000000;
  const limit = range - (range % modulus);
  const buf = new Uint32Array(1);
  while (true) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) {
      return buf[0] % modulus;
    }
  }
}

export function pickWord(wordlist: readonly string[] = effLargeWordlist): string {
  return wordlist[unbiasedRandomIndex(wordlist.length)];
}

export interface PassphraseOptions {
  count: number
  separator: string
  capitalize: boolean
  includeNumber: boolean
  wordlist?: readonly string[]
}

export function generatePassphrase({
  count,
  separator,
  capitalize,
  includeNumber,
  wordlist = effLargeWordlist,
}: PassphraseOptions): string {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    let word = pickWord(wordlist);
    if (capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    words.push(word);
  }

  if (includeNumber && words.length > 0) {
    const idx = unbiasedRandomIndex(words.length);
    const digit = unbiasedRandomIndex(10);
    words[idx] = `${words[idx]}${digit}`;
  }

  return words.join(separator);
}

export function entropyBits(count: number, wordlistSize: number = WORDLIST_SIZE): number {
  return count * Math.log2(wordlistSize);
}
