// Build a shields.io badge URL from form fields.
// Reference: https://shields.io/badges

export interface BadgeOptions {
  label: string
  message: string
  color: string
  labelColor?: string
  style?: 'flat' | 'flat-square' | 'plastic' | 'for-the-badge' | 'social'
  logo?: string
  logoColor?: string
  link?: string
}

// Shields.io applies "URL escaping" with three substitutions on label/message:
//   "_" -> " "
//   "__" -> "_"
//   "-"  -> " " (when at end), but use "--" -> "-"
// Encode user input so a literal "_" or "-" survives:
//   _ -> __
//   - -> --
//   space -> _
// then percent-encode.
function escapeShieldSegment(input: string): string {
  return encodeURIComponent(
    input
      .replace(/-/g, '--')
      .replace(/_/g, '__')
      .replace(/ /g, '_'),
  );
}

export function buildBadgeUrl(opts: BadgeOptions): string {
  const label = escapeShieldSegment(opts.label || '');
  const message = escapeShieldSegment(opts.message || '');
  const color = encodeURIComponent(opts.color || 'blue');

  const path = label
    ? `${label}-${message}-${color}`
    : `${message}-${color}`;

  const url = new URL(`https://img.shields.io/badge/${path}`);
  if (opts.style) {
    url.searchParams.set('style', opts.style);
  }
  if (opts.logo) {
    url.searchParams.set('logo', opts.logo);
  }
  if (opts.logoColor) {
    url.searchParams.set('logoColor', opts.logoColor);
  }
  if (opts.labelColor) {
    url.searchParams.set('labelColor', opts.labelColor);
  }
  return url.toString();
}

export function buildMarkdown(opts: BadgeOptions, alt?: string): string {
  const url = buildBadgeUrl(opts);
  const altText = alt || `${opts.label}: ${opts.message}`;
  return opts.link
    ? `[![${altText}](${url})](${opts.link})`
    : `![${altText}](${url})`;
}

export function buildHtml(opts: BadgeOptions, alt?: string): string {
  const url = buildBadgeUrl(opts);
  const altText = alt || `${opts.label}: ${opts.message}`;
  const img = `<img src="${url}" alt="${altText}">`;
  return opts.link ? `<a href="${opts.link}">${img}</a>` : img;
}

export const STYLE_OPTIONS: Array<NonNullable<BadgeOptions['style']>> = [
  'flat',
  'flat-square',
  'plastic',
  'for-the-badge',
  'social',
];

// A handful of preset colors shields.io accepts as named values.
export const COLOR_PRESETS = [
  'brightgreen', 'green', 'yellowgreen', 'yellow', 'orange', 'red',
  'blue', 'lightgrey', 'success', 'important', 'critical', 'informational', 'inactive',
  'blueviolet', 'ff69b4',
];

// Common simple-icons logo slugs (https://simpleicons.org).
export const POPULAR_LOGOS = [
  'github', 'gitlab', 'docker', 'npm', 'pypi', 'rust', 'go', 'python', 'javascript',
  'typescript', 'react', 'vue.js', 'svelte', 'nodedotjs', 'kubernetes', 'terraform',
  'apache', 'nginx', 'cloudflare', 'aws', 'googlecloud', 'microsoftazure',
];
