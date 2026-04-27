import { describe, expect, it } from 'vitest';
import { lintDockerfile, parseDockerfile } from './dockerfile-linter.service';

describe('parseDockerfile', () => {
  it('joins backslash continuations and strips comments', () => {
    const text = `# top comment
RUN apt-get update \\
  && apt-get install -y curl  # inline
WORKDIR /app
`;
    const ls = parseDockerfile(text);
    expect(ls).toHaveLength(2);
    expect(ls[0].instruction).toBe('RUN');
    expect(ls[0].args).toContain('apt-get update');
    expect(ls[0].args).toContain('apt-get install -y curl');
    expect(ls[1].instruction).toBe('WORKDIR');
  });

  it('ignores blank lines and unknown instructions', () => {
    const ls = parseDockerfile('\n\nFOO bar\nFROM x\n');
    expect(ls).toHaveLength(1);
    expect(ls[0].instruction).toBe('FROM');
  });
});

describe('lintDockerfile rules', () => {
  it('DL3007 — :latest is flagged', () => {
    const issues = lintDockerfile('FROM nginx:latest');
    expect(issues.some(i => i.rule === 'DL3007')).toBe(true);
  });

  it('DL3007 — pinned tag is fine', () => {
    const issues = lintDockerfile('FROM nginx:1.27');
    expect(issues.find(i => i.rule === 'DL3007')).toBeUndefined();
  });

  it('DL4000 — MAINTAINER deprecated', () => {
    const issues = lintDockerfile('FROM x\nMAINTAINER a@b.com');
    expect(issues.some(i => i.rule === 'DL4000' && i.level === 'error')).toBe(true);
  });

  it('DL3000 — relative WORKDIR', () => {
    const issues = lintDockerfile('FROM x\nWORKDIR app');
    expect(issues.some(i => i.rule === 'DL3000')).toBe(true);
  });

  it('DL3000 — absolute WORKDIR is fine', () => {
    const issues = lintDockerfile('FROM x\nWORKDIR /app');
    expect(issues.find(i => i.rule === 'DL3000')).toBeUndefined();
  });

  it('DL3001 — sudo flagged', () => {
    const issues = lintDockerfile('FROM x\nRUN sudo apt-get install -y=1 curl=1');
    expect(issues.some(i => i.rule === 'DL3001')).toBe(true);
  });

  it('DL3002 — last USER root flagged', () => {
    const issues = lintDockerfile('FROM x\nUSER node\nUSER root');
    expect(issues.some(i => i.rule === 'DL3002')).toBe(true);
  });

  it('DL3002 — last USER non-root is fine', () => {
    const issues = lintDockerfile('FROM x\nUSER root\nUSER node');
    expect(issues.find(i => i.rule === 'DL3002')).toBeUndefined();
  });

  it('DL3003 — RUN cd flagged', () => {
    const issues = lintDockerfile('FROM x\nRUN cd /tmp && echo');
    expect(issues.some(i => i.rule === 'DL3003')).toBe(true);
  });

  it('DL3008 — apt-get install without pin', () => {
    const issues = lintDockerfile('FROM x\nRUN apt-get install -y curl');
    expect(issues.some(i => i.rule === 'DL3008')).toBe(true);
  });

  it('DL3008 — pinned packages pass', () => {
    const issues = lintDockerfile('FROM x\nRUN apt-get install -y --no-install-recommends curl=7.0 && rm -rf /var/lib/apt/lists/*');
    expect(issues.find(i => i.rule === 'DL3008')).toBeUndefined();
    expect(issues.find(i => i.rule === 'DL3009')).toBeUndefined();
    expect(issues.find(i => i.rule === 'DL3015')).toBeUndefined();
  });

  it('DL3009 — apt without cleaning lists', () => {
    const issues = lintDockerfile('FROM x\nRUN apt-get install -y curl=7.0');
    expect(issues.some(i => i.rule === 'DL3009')).toBe(true);
  });

  it('DL3015 — missing --no-install-recommends', () => {
    const issues = lintDockerfile('FROM x\nRUN apt-get install -y curl=7.0 && rm -rf /var/lib/apt/lists/*');
    expect(issues.some(i => i.rule === 'DL3015')).toBe(true);
  });

  it('DL3018 — apk add unpinned', () => {
    const issues = lintDockerfile('FROM alpine\nRUN apk add curl');
    expect(issues.some(i => i.rule === 'DL3018')).toBe(true);
  });

  it('DL3020 — ADD instead of COPY for local files', () => {
    const issues = lintDockerfile('FROM x\nADD ./src /app');
    expect(issues.some(i => i.rule === 'DL3020')).toBe(true);
  });

  it('DL3020 — ADD of remote URL is allowed', () => {
    const issues = lintDockerfile('FROM x\nADD https://example.com/file.bin /tmp/');
    expect(issues.find(i => i.rule === 'DL3020')).toBeUndefined();
  });

  it('DL3025 — shell-form CMD flagged', () => {
    const issues = lintDockerfile('FROM x\nCMD node index.js');
    expect(issues.some(i => i.rule === 'DL3025')).toBe(true);
  });

  it('DL3025 — JSON-form CMD passes', () => {
    const issues = lintDockerfile('FROM x\nCMD ["node", "index.js"]');
    expect(issues.find(i => i.rule === 'DL3025')).toBeUndefined();
  });

  it('DL3027 — `apt install` flagged', () => {
    const issues = lintDockerfile('FROM x\nRUN apt install -y curl');
    expect(issues.some(i => i.rule === 'DL3027')).toBe(true);
  });

  it('DL3045 — relative COPY without WORKDIR', () => {
    const issues = lintDockerfile('FROM x\nCOPY . app/');
    expect(issues.some(i => i.rule === 'DL3045')).toBe(true);
  });

  it('DL3045 — absolute COPY is fine', () => {
    const issues = lintDockerfile('FROM x\nCOPY . /app/');
    expect(issues.find(i => i.rule === 'DL3045')).toBeUndefined();
  });

  it('DL4006 — pipe in RUN without pipefail', () => {
    const issues = lintDockerfile('FROM x\nRUN cat /etc/passwd | grep root');
    expect(issues.some(i => i.rule === 'DL4006')).toBe(true);
  });

  it('DL4006 — pipefail SHELL silences the rule', () => {
    const issues = lintDockerfile('FROM x\nSHELL ["/bin/bash", "-o", "pipefail", "-c"]\nRUN cat x | grep y');
    expect(issues.find(i => i.rule === 'DL4006')).toBeUndefined();
  });

  it('returns issues sorted by line', () => {
    const issues = lintDockerfile('FROM x:latest\nMAINTAINER me\nWORKDIR app');
    const lines = issues.map(i => i.line);
    expect(lines).toEqual([...lines].sort((a, b) => a - b));
  });
});
