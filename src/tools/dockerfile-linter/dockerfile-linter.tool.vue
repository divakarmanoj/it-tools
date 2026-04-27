<script setup lang="ts">
import { lintDockerfile, listRules } from './dockerfile-linter.service';

const sample = `FROM ubuntu:latest
MAINTAINER me@example.com
WORKDIR app
RUN cd /app && apt-get install -y curl python3
RUN apt update
COPY . app/
USER root
CMD node index.js
`;

const text = ref(sample);
const issues = computed(() => lintDockerfile(text.value));
const rules = listRules();

const errCount = computed(() => issues.value.filter(i => i.level === 'error').length);
const warnCount = computed(() => issues.value.filter(i => i.level === 'warning').length);
const infoCount = computed(() => issues.value.filter(i => i.level === 'info').length);
</script>

<template>
  <c-card title="Dockerfile">
    <c-input-text v-model:value="text" multiline rows="14" monospace raw-text autosize />
  </c-card>

  <c-card mt-4 title="Findings">
    <div mb-3>
      <n-tag :type="errCount === 0 ? 'success' : 'error'" mr-2>
        {{ errCount }} errors
      </n-tag>
      <n-tag :type="warnCount === 0 ? 'success' : 'warning'" mr-2>
        {{ warnCount }} warnings
      </n-tag>
      <n-tag :type="infoCount === 0 ? 'success' : 'info'">
        {{ infoCount }} hints
      </n-tag>
    </div>
    <p v-if="!issues.length" op-70>
      ✓ No issues detected by the bundled rule subset.
    </p>
    <n-table v-else size="small" striped>
      <thead><tr><th>line</th><th>rule</th><th>level</th><th>message</th></tr></thead>
      <tbody>
        <tr v-for="(iss, i) in issues" :key="i">
          <td>{{ iss.line }}</td>
          <td><code>{{ iss.rule }}</code></td>
          <td>
            <n-tag size="small" :type="iss.level === 'error' ? 'error' : iss.level === 'warning' ? 'warning' : 'info'">
              {{ iss.level }}
            </n-tag>
          </td>
          <td>{{ iss.message }}</td>
        </tr>
      </tbody>
    </n-table>
  </c-card>

  <c-card mt-4 title="Rules implemented">
    <n-table size="small" striped>
      <thead><tr><th>id</th><th>level</th><th>description</th></tr></thead>
      <tbody>
        <tr v-for="r in rules" :key="r.id">
          <td><code>{{ r.id }}</code></td>
          <td>{{ r.level }}</td>
          <td>{{ r.description }}</td>
        </tr>
      </tbody>
    </n-table>
    <p mt-2 text-sm op-60>
      Subset of <a href="https://github.com/hadolint/hadolint" target="_blank" rel="noopener">hadolint</a> rules ported to plain JavaScript so the linter runs offline in your browser.
    </p>
  </c-card>
</template>
