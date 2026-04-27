<script setup lang="ts">
import { type CorsTestResult, runCorsPreflight } from './cors-tester.service';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const url = ref('https://api.github.com/repos/torvalds/linux');
const method = ref('GET');
const origin = ref(typeof location !== 'undefined' ? location.origin : '');
const reqHeadersText = ref('Authorization\nContent-Type');
const result = ref<CorsTestResult | null>(null);
const loading = ref(false);

const methodOpts = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']
  .map(m => ({ value: m, label: m }));

async function run() {
  loading.value = true;
  try {
    result.value = await runCorsPreflight({
      url: url.value,
      method: method.value,
      origin: origin.value,
      requestHeaders: reqHeadersText.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean),
    });
  }
  finally {
    loading.value = false;
  }
}

function tone(v: boolean | null) {
  return v === true ? 'success' : v === false ? 'error' : 'default';
}
function label(v: boolean | null) {
  return v === true ? 'yes' : v === false ? 'no' : '?';
}
</script>

<template>
  <c-card title="Request">
    <n-form-item label="Target URL" label-placement="top">
      <c-input-text v-model:value="url" placeholder="https://api.example.com/v1/foo" />
    </n-form-item>
    <n-grid :cols="2" :x-gap="12">
      <n-gi>
        <n-form-item label="Method (the actual request you'll make)" label-placement="top">
          <n-select v-model:value="method" :options="methodOpts" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Origin (this is what the browser sends)" label-placement="top">
          <c-input-text v-model:value="origin" placeholder="https://your-frontend.example" disabled />
        </n-form-item>
      </n-gi>
    </n-grid>
    <n-form-item label="Request headers (one per line, e.g. Authorization, Content-Type)" label-placement="top">
      <c-input-text v-model:value="reqHeadersText" multiline rows="4" raw-text />
    </n-form-item>
    <c-button type="primary" :loading="loading" @click="run">
      Send preflight (OPTIONS)
    </c-button>
  </c-card>

  <c-card v-if="result" mt-4 :title="`Preflight result — ${result.status || 'network error'} ${result.statusText}`">
    <n-tag v-if="result.preflightSucceeded" type="success" size="large">
      ✓ The browser would allow this request.
    </n-tag>
    <n-tag v-else type="error" size="large">
      ✗ The browser would block this request.
    </n-tag>

    <n-grid :cols="3" :x-gap="12" mt-3>
      <n-gi>
        Origin allowed:
        <n-tag :type="tone(result.willMatchOrigin)" mt-1>
          {{ label(result.willMatchOrigin) }}
        </n-tag>
      </n-gi>
      <n-gi>
        Method allowed:
        <n-tag :type="tone(result.willAllowMethod)" mt-1>
          {{ label(result.willAllowMethod) }}
        </n-tag>
      </n-gi>
      <n-gi>
        Headers allowed:
        <n-tag :type="tone(result.willAllowHeaders)" mt-1>
          {{ label(result.willAllowHeaders) }}
        </n-tag>
      </n-gi>
    </n-grid>

    <p v-if="result.rawError" mt-2 style="color: var(--n-error-color)">
      {{ result.rawError }} <br>
      <small op-70>Note: when the preflight fails at the network or CORS layer, browsers hide the response. Use the curl command below to inspect what the server actually returns.</small>
    </p>
  </c-card>

  <c-card v-if="result" mt-4 title="Response headers">
    <n-table size="small" striped>
      <thead>
        <tr>
          <th style="width: 35%">
            Header
          </th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in result.headerRows" :key="row.name">
          <td>
            <strong>{{ row.name }}</strong>
            <div text-xs op-60>
              {{ row.note }}
            </div>
          </td>
          <td style="word-break: break-all">
            <code v-if="row.value !== null">{{ row.value }}</code>
            <span v-else op-50>not present</span>
          </td>
        </tr>
      </tbody>
    </n-table>
  </c-card>

  <c-card v-if="result" mt-4 title="Equivalent curl">
    <TextareaCopyable :value="result.curl" language="bash" />
  </c-card>
</template>
