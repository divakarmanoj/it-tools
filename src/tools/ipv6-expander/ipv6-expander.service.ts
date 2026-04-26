export function isValidIpv6(input: string): boolean {
  try {
    expandIpv6(input);
    return true;
  }
  catch {
    return false;
  }
}

/**
 * Expand a (possibly compressed) IPv6 address to its full 8-hextet, 4-hex-digit-per-hextet form.
 * Throws on invalid input.
 */
export function expandIpv6(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) {
    throw new Error('IPv6 address is required.');
  }

  // Reject anything that's clearly not IPv6 (no colon at all is invalid).
  if (!trimmed.includes(':')) {
    throw new Error('Not a valid IPv6 address.');
  }

  if ((trimmed.match(/::/g) ?? []).length > 1) {
    throw new Error('IPv6 may contain at most one "::".');
  }

  const [head, tail] = trimmed.includes('::')
    ? trimmed.split('::') as [string, string]
    : [trimmed, ''];

  const headParts = head ? head.split(':') : [];
  const tailParts = tail ? tail.split(':') : [];
  const fillCount = 8 - headParts.length - tailParts.length;

  if (fillCount < 0 || (!trimmed.includes('::') && headParts.length !== 8)) {
    throw new Error('IPv6 must have exactly 8 hextets.');
  }

  const fill = Array.from({ length: fillCount }, () => '0');
  const allHextets = [...headParts, ...fill, ...tailParts];

  if (allHextets.length !== 8) {
    throw new Error('IPv6 must have exactly 8 hextets.');
  }

  return allHextets.map((h) => {
    if (!/^[0-9a-f]{1,4}$/.test(h)) {
      throw new Error(`Invalid hextet "${h}".`);
    }
    return h.padStart(4, '0');
  }).join(':');
}

/**
 * Compress a (possibly expanded) IPv6 address using the canonical RFC 5952 rules:
 * - lowercase, leading zeros stripped from each hextet
 * - longest run (length >= 2) of all-zero hextets replaced with "::"
 * - tie-broken by the first such run
 */
export function compressIpv6(input: string): string {
  const expanded = expandIpv6(input);
  const hextets = expanded.split(':').map(h => h.replace(/^0+/, '') || '0');

  let bestStart = -1;
  let bestLen = 0;
  let i = 0;
  while (i < hextets.length) {
    if (hextets[i] === '0') {
      let j = i;
      while (j < hextets.length && hextets[j] === '0') {
        j++;
      }
      const len = j - i;
      if (len > bestLen && len >= 2) {
        bestLen = len;
        bestStart = i;
      }
      i = j;
    }
    else {
      i++;
    }
  }

  if (bestStart === -1) {
    return hextets.join(':');
  }

  const before = hextets.slice(0, bestStart).join(':');
  const after = hextets.slice(bestStart + bestLen).join(':');
  return `${before}::${after}`;
}
