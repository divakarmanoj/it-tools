import _ from 'lodash';

function prettifyExponentialNotation(exp: number) {
  const [base, exponent] = exp.toString().split('e');
  const baseAsNumber = Number.parseFloat(base);
  const prettyBase = baseAsNumber % 1 === 0 ? baseAsNumber.toLocaleString() : baseAsNumber.toFixed(2);
  return exponent ? `${prettyBase}e${exponent}` : prettyBase;
}

function getHumanFriendlyDuration({ seconds }: { seconds: number }) {
  if (seconds <= 0.001) {
    return 'Instantly';
  }
  if (seconds <= 1) {
    return 'Less than a second';
  }
  const timeUnits = [
    { unit: 'millenium', secondsInUnit: 31536000000, format: prettifyExponentialNotation, plural: 'millennia' },
    { unit: 'century', secondsInUnit: 3153600000, plural: 'centuries' },
    { unit: 'decade', secondsInUnit: 315360000, plural: 'decades' },
    { unit: 'year', secondsInUnit: 31536000, plural: 'years' },
    { unit: 'month', secondsInUnit: 2592000, plural: 'months' },
    { unit: 'week', secondsInUnit: 604800, plural: 'weeks' },
    { unit: 'day', secondsInUnit: 86400, plural: 'days' },
    { unit: 'hour', secondsInUnit: 3600, plural: 'hours' },
    { unit: 'minute', secondsInUnit: 60, plural: 'minutes' },
    { unit: 'second', secondsInUnit: 1, plural: 'seconds' },
  ];

  return _.chain(timeUnits)
    .map(({ unit, secondsInUnit, plural, format = _.identity }) => {
      const quantity = Math.floor(seconds / secondsInUnit);
      seconds %= secondsInUnit;
      if (quantity <= 0) {
        return undefined;
      }
      const formattedQuantity = format(quantity);
      return `${formattedQuantity} ${quantity > 1 ? plural : unit}`;
    })
    .compact()
    .take(2)
    .join(', ')
    .value();
}

export interface CharsetSegment {
  name: string
  size: number
  bits: number
  fraction: number
  count: number
}

export interface AttackerProfile {
  name: string
  guessesPerSecond: number
  description: string
}

export const ATTACKER_PROFILES: AttackerProfile[] = [
  { name: 'Online (throttled)', guessesPerSecond: 10, description: 'Login form with rate limiting (~10 guesses/s)' },
  { name: 'Online (unthrottled)', guessesPerSecond: 1e3, description: 'Misconfigured login endpoint (~1k guesses/s)' },
  { name: 'Offline (slow hash)', guessesPerSecond: 1e6, description: 'Stolen bcrypt/Argon2 database (~1M guesses/s)' },
  { name: 'Offline (fast hash)', guessesPerSecond: 1e10, description: 'Stolen MD5/SHA1 + GPU (~10B guesses/s)' },
  { name: 'Offline (ASIC)', guessesPerSecond: 1e12, description: 'Custom ASIC farm (~1T guesses/s)' },
];

export interface PasswordAnalysis {
  password: string
  length: number
  segments: CharsetSegment[]
  charsetSize: number
  entropyBits: number
  crackTimes: { profile: AttackerProfile; seconds: number; humanReadable: string }[]
}

const segmentDefs: { name: string; test: (ch: string) => boolean; size: number }[] = [
  { name: 'Lowercase', test: ch => /^[a-z]$/.test(ch), size: 26 },
  { name: 'Uppercase', test: ch => /^[A-Z]$/.test(ch), size: 26 },
  { name: 'Digits', test: ch => /^\d$/.test(ch), size: 10 },
  { name: 'Symbols', test: ch => /^[!-/:-@[-`{-~]$/.test(ch), size: 32 },
  { name: 'Whitespace', test: ch => /^\s$/.test(ch), size: 1 },
  { name: 'Unicode', test: ch => ch.codePointAt(0)! > 127, size: 1024 },
];

export function analyzePassword(password: string): PasswordAnalysis {
  const codePoints = [...password];
  const length = codePoints.length;

  const counts = segmentDefs.map((def) => {
    let count = 0;
    for (const ch of codePoints) {
      if (def.test(ch)) {
        count++;
      }
    }
    return { def, count };
  });

  const charsetSize = counts.reduce((acc, { def, count }) => acc + (count > 0 ? def.size : 0), 0);
  const entropyBits = length === 0 || charsetSize === 0
    ? 0
    : Math.log2(charsetSize) * length;

  const segments: CharsetSegment[] = counts.map(({ def, count }) => ({
    name: def.name,
    size: def.size,
    bits: count > 0 ? Math.log2(def.size) : 0,
    fraction: length > 0 ? count / length : 0,
    count,
  }));

  const crackTimes = ATTACKER_PROFILES.map((profile) => {
    const seconds = entropyBits === 0 ? 0 : (2 ** entropyBits) / profile.guessesPerSecond;
    return {
      profile,
      seconds,
      humanReadable: seconds === 0
        ? 'Instantly'
        : (getHumanFriendlyDuration({ seconds }) || 'Less than a second'),
    };
  });

  return {
    password,
    length,
    segments,
    charsetSize,
    entropyBits,
    crackTimes,
  };
}
