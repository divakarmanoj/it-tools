<script setup lang="ts">
import { dnsLookupAll } from './dns-lookup.service';

const name = ref('example.com');

const loading = ref(false);
const error = ref('');
const result = ref<Awaited<ReturnType<typeof dnsLookupAll>> | null>(null);

async function lookup() {
  loading.value = true;
  error.value = '';
  try {
    result.value = await dnsLookupAll(name.value);
  }
  catch (e: any) {
    error.value = e?.message ?? String(e);
    result.value = null;
  }
  finally {
    loading.value = false;
  }
}

onMounted(() => lookup());
</script>

<template>
  <c-card>
    <n-form-item label="Domain" label-placement="top">
      <c-input-text v-model:value="name" placeholder="example.com" raw-text @keyup.enter="lookup" />
    </n-form-item>
    <div mt-3 flex justify-center>
      <c-button :loading="loading" :disabled="loading || !name.trim()" @click="lookup">
        Lookup all records
      </c-button>
    </div>
    <div mt-3 text-center text-xs op-60>
      Resolves A, AAAA, CNAME, MX, TXT, NS, SOA, CAA, SRV in parallel via Cloudflare DNS-over-HTTPS (1.1.1.1).
    </div>
  </c-card>

  <c-card v-if="error" mt-4 title="Error">
    <pre style="color: var(--n-error-color); white-space: pre-wrap">{{ error }}</pre>
  </c-card>

  <div v-if="result" mt-4 flex flex-col gap-3>
    <c-card v-for="entry in result.results" :key="entry.type">
      <div mb-2 flex items-center gap-3>
        <div class="record-type-badge">
          {{ entry.type }}
        </div>
        <div text-sm op-60>
          {{ entry.answers.length }} record{{ entry.answers.length === 1 ? '' : 's' }}
          <span v-if="entry.statusName !== 'NoError'">— {{ entry.statusName }}</span>
        </div>
      </div>

      <div v-if="entry.error" op-70 style="color: var(--n-error-color)">
        {{ entry.error }}
      </div>
      <div v-else-if="entry.answers.length === 0" text-sm op-50>
        No records.
      </div>
      <n-table v-else size="small" :bordered="false" :single-line="false">
        <thead>
          <tr>
            <th style="width: 40%">
              Name
            </th>
            <th style="width: 70px">
              TTL
            </th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(a, i) in entry.answers" :key="i">
            <td font-mono>
              {{ a.name }}
            </td>
            <td>{{ a.TTL }}s</td>
            <td font-mono style="word-break: break-all">
              {{ a.data }}
            </td>
          </tr>
        </tbody>
      </n-table>
    </c-card>
  </div>
</template>

<style lang="less" scoped>
.record-type-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  background: var(--n-color-target);
  border: 1px solid var(--n-border-color);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.5px;
}
</style>
