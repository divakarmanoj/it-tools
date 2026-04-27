// Pure-JS Dockerfile linter implementing a useful subset of hadolint rules.
// Reference: https://github.com/hadolint/hadolint/wiki

export interface LintIssue {
  line: number
  rule: string // e.g. "DL3007"
  level: 'error' | 'warning' | 'info'
  message: string
}

interface ParsedLine {
  line: number // 1-based
  text: string // logical line (joined `\` continuations), with comments stripped
  raw: string // raw text
  instruction: string // upper-case, e.g. "RUN"
  args: string
}

const INSTRUCTIONS = new Set([
  'FROM', 'RUN', 'CMD', 'LABEL', 'MAINTAINER', 'EXPOSE', 'ENV', 'ADD', 'COPY',
  'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD', 'STOPSIGNAL',
  'HEALTHCHECK', 'SHELL',
]);

export function parseDockerfile(text: string): ParsedLine[] {
  const physicalLines = text.split(/\r?\n/);
  const out: ParsedLine[] = [];
  let i = 0;
  while (i < physicalLines.length) {
    const startLineNo = i + 1;
    let acc = physicalLines[i].replace(/#.*$/, '').trimEnd();
    // Continuation joining
    while (acc.endsWith('\\') && i + 1 < physicalLines.length) {
      acc = `${acc.slice(0, -1).trimEnd()} ${physicalLines[++i].replace(/#.*$/, '').trim()}`;
    }
    i++;
    const trimmed = acc.trim();
    if (!trimmed) {
      continue;
    }
    const m = trimmed.match(/^(\w+)\s+(.*)$/s);
    if (!m) {
      continue;
    }
    const instruction = m[1].toUpperCase();
    if (!INSTRUCTIONS.has(instruction)) {
      continue;
    }
    out.push({
      line: startLineNo,
      text: trimmed,
      raw: physicalLines[startLineNo - 1],
      instruction,
      args: m[2].trim(),
    });
  }
  return out;
}

// ------------------------------ rules ------------------------------

interface Rule {
  id: string
  level: 'error' | 'warning' | 'info'
  description: string
  check: (lines: ParsedLine[]) => LintIssue[]
}

function emit(line: number, rule: Rule, message?: string): LintIssue {
  return { line, rule: rule.id, level: rule.level, message: message ?? rule.description };
}

const DL3000_workdir_absolute: Rule = {
  id: 'DL3000',
  level: 'error',
  description: 'WORKDIR must be an absolute path.',
  check: ls => ls.filter(l => l.instruction === 'WORKDIR' && !l.args.startsWith('/') && !l.args.startsWith('$'))
    .map(l => emit(l.line, DL3000_workdir_absolute, `WORKDIR "${l.args}" is not absolute.`)),
};

const DL3001_no_sudo: Rule = {
  id: 'DL3001',
  level: 'warning',
  description: 'Avoid sudo as it leads to unpredictable behavior.',
  check: ls => ls.filter(l => l.instruction === 'RUN' && /\bsudo\b/.test(l.args))
    .map(l => emit(l.line, DL3001_no_sudo)),
};

const DL3002_no_root_user: Rule = {
  id: 'DL3002',
  level: 'warning',
  description: 'Last USER should not be root.',
  check: (ls) => {
    const users = ls.filter(l => l.instruction === 'USER');
    const last = users[users.length - 1];
    if (last && /^(root|0)\b/.test(last.args)) {
      return [emit(last.line, DL3002_no_root_user)];
    }
    return [];
  },
};

const DL3003_no_cd: Rule = {
  id: 'DL3003',
  level: 'warning',
  description: 'Use WORKDIR to switch to a directory.',
  check: ls => ls.filter(l => l.instruction === 'RUN' && /(?:^|\b)cd\s+/.test(l.args))
    .map(l => emit(l.line, DL3003_no_cd)),
};

const DL3007_no_latest: Rule = {
  id: 'DL3007',
  level: 'warning',
  description: 'Using `latest` is prone to errors. Pin the version explicitly.',
  check: ls => ls.filter(l => l.instruction === 'FROM' && /:latest(\b|$)/.test(l.args))
    .map(l => emit(l.line, DL3007_no_latest)),
};

const DL3008_pin_apt: Rule = {
  id: 'DL3008',
  level: 'warning',
  description: 'Pin versions in apt-get install (e.g. `package=1.2.3`).',
  check: (ls) => {
    const out: LintIssue[] = [];
    for (const l of ls) {
      if (l.instruction !== 'RUN') {
        continue;
      }
      // crude: if `apt-get install` appears and any token after install lacks `=`, flag.
      const m = l.args.match(/apt-get\s+install\s+([^&|;]+)/);
      if (!m) {
        continue;
      }
      const tokens = m[1].split(/\s+/).filter(t => t && !t.startsWith('-'));
      if (tokens.some(t => !t.includes('='))) {
        out.push(emit(l.line, DL3008_pin_apt));
      }
    }
    return out;
  },
};

const DL3009_apt_clean: Rule = {
  id: 'DL3009',
  level: 'info',
  description: 'Delete the apt-get lists after installing.',
  check: ls => ls.filter(l =>
    l.instruction === 'RUN'
    && /apt-get\s+install/.test(l.args)
    && !/rm\s+-r?f?\s+\/var\/lib\/apt\/lists/.test(l.args),
  ).map(l => emit(l.line, DL3009_apt_clean)),
};

const DL3015_no_recommends: Rule = {
  id: 'DL3015',
  level: 'info',
  description: 'Avoid additional packages by specifying `--no-install-recommends`.',
  check: ls => ls.filter(l =>
    l.instruction === 'RUN'
    && /apt-get\s+install/.test(l.args)
    && !/--no-install-recommends/.test(l.args),
  ).map(l => emit(l.line, DL3015_no_recommends)),
};

const DL3018_pin_apk: Rule = {
  id: 'DL3018',
  level: 'warning',
  description: 'Pin versions in apk add (e.g. `package=1.2.3-r0`).',
  check: (ls) => {
    const out: LintIssue[] = [];
    for (const l of ls) {
      if (l.instruction !== 'RUN') {
        continue;
      }
      const m = l.args.match(/apk\s+add\s+([^&|;]+)/);
      if (!m) {
        continue;
      }
      const tokens = m[1].split(/\s+/).filter(t => t && !t.startsWith('-'));
      if (tokens.some(t => !t.includes('='))) {
        out.push(emit(l.line, DL3018_pin_apk));
      }
    }
    return out;
  },
};

const DL3020_use_copy: Rule = {
  id: 'DL3020',
  level: 'warning',
  description: 'Use COPY instead of ADD for files and folders.',
  check: ls => ls.filter(l => l.instruction === 'ADD' && !/^https?:\/\//.test(l.args) && !/\.(tar|gz|tgz|bz2|xz)\b/.test(l.args))
    .map(l => emit(l.line, DL3020_use_copy)),
};

const DL3025_json_cmd: Rule = {
  id: 'DL3025',
  level: 'warning',
  description: 'Use the JSON form for CMD/ENTRYPOINT to avoid running through /bin/sh.',
  check: (ls) => {
    const out: LintIssue[] = [];
    for (const l of ls) {
      if (l.instruction !== 'CMD' && l.instruction !== 'ENTRYPOINT') {
        continue;
      }
      if (!l.args.trim().startsWith('[')) {
        out.push(emit(l.line, DL3025_json_cmd, `${l.instruction} should use JSON array form.`));
      }
    }
    return out;
  },
};

const DL3027_no_apt: Rule = {
  id: 'DL3027',
  level: 'warning',
  description: 'Do not use `apt`, prefer `apt-get` (CLI is unstable).',
  check: ls => ls.filter(l => l.instruction === 'RUN' && /\bapt\s+(install|update|upgrade)\b/.test(l.args))
    .map(l => emit(l.line, DL3027_no_apt)),
};

const DL3045_workdir_for_copy: Rule = {
  id: 'DL3045',
  level: 'info',
  description: 'COPY to a relative destination requires WORKDIR to be set.',
  check: (ls) => {
    const out: LintIssue[] = [];
    let workdirSeen = false;
    for (const l of ls) {
      if (l.instruction === 'WORKDIR') {
        workdirSeen = true;
      }
      if (l.instruction === 'COPY') {
        const parts = l.args.split(/\s+/).filter(p => !p.startsWith('--'));
        const dest = parts[parts.length - 1];
        if (dest && !dest.startsWith('/') && !workdirSeen) {
          out.push(emit(l.line, DL3045_workdir_for_copy));
        }
      }
    }
    return out;
  },
};

const DL4000_no_maintainer: Rule = {
  id: 'DL4000',
  level: 'error',
  description: 'MAINTAINER is deprecated. Use a LABEL instead.',
  check: ls => ls.filter(l => l.instruction === 'MAINTAINER').map(l => emit(l.line, DL4000_no_maintainer)),
};

const DL4006_set_pipefail: Rule = {
  id: 'DL4006',
  level: 'warning',
  description: 'Set the SHELL with `pipefail` before pipelined RUN, e.g. `SHELL ["/bin/bash", "-o", "pipefail", "-c"]`.',
  check: (ls) => {
    const out: LintIssue[] = [];
    let pipefail = false;
    for (const l of ls) {
      if (l.instruction === 'SHELL' && /pipefail/.test(l.args)) {
        pipefail = true;
      }
      if (l.instruction === 'RUN' && /\|/.test(l.args) && !pipefail) {
        out.push(emit(l.line, DL4006_set_pipefail));
      }
    }
    return out;
  },
};

const RULES: Rule[] = [
  DL3000_workdir_absolute,
  DL3001_no_sudo,
  DL3002_no_root_user,
  DL3003_no_cd,
  DL3007_no_latest,
  DL3008_pin_apt,
  DL3009_apt_clean,
  DL3015_no_recommends,
  DL3018_pin_apk,
  DL3020_use_copy,
  DL3025_json_cmd,
  DL3027_no_apt,
  DL3045_workdir_for_copy,
  DL4000_no_maintainer,
  DL4006_set_pipefail,
];

export function lintDockerfile(text: string): LintIssue[] {
  const lines = parseDockerfile(text);
  if (!lines.length) {
    return [];
  }
  const issues: LintIssue[] = [];
  for (const r of RULES) {
    issues.push(...r.check(lines));
  }
  return issues.sort((a, b) => a.line - b.line || a.rule.localeCompare(b.rule));
}

export function listRules(): Array<{ id: string; level: string; description: string }> {
  return RULES.map(r => ({ id: r.id, level: r.level, description: r.description }));
}
