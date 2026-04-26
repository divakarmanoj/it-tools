<script setup lang="ts">
import { whoisLookup } from './whois-lookup.service';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const query = ref('example.com');
const loading = ref(false);
const error = ref('');
const result = ref<Awaited<ReturnType<typeof whoisLookup>> | null>(null);

async function lookup() {
  loading.value = true;
  error.value = '';
  result.value = null;
  try {
    result.value = await whoisLookup(query.value);
  }
  catch (e: any) {
    error.value = e?.message ?? String(e);
  }
  finally {
    loading.value = false;
  }
}

const rawJson = computed(() => result.value ? JSON.stringify(result.value.raw, null, 2) : '');
</script>

<template>
  <c-card>
    <c-input-text
      v-model:value="query"
      label="Domain or IP"
      placeholder="example.com or 8.8.8.8"
      raw-text
      @keyup.enter="lookup"
    />
    <div mt-3 flex justify-center>
      <c-button :loading="loading" :disabled="loading || !query.trim()" @click="lookup">
        Lookup
      </c-button>
    </div>
    <div mt-3 text-center text-xs op-60>
      Uses <code>rdap.org</code> (RDAP — modern WHOIS over HTTPS). Requests follow a 302 to the authoritative registry (Verisign, ARIN, RIPE, etc.).
    </div>
  </c-card>

  <c-card v-if="error" mt-4 title="Error">
    <pre style="color: var(--n-error-color); white-space: pre-wrap">{{ error }}</pre>
  </c-card>

  <c-card v-if="result?.fields.length" mt-4 :title="`${result.kind === 'domain' ? 'Domain' : 'IP'} information`">
    <n-table size="small" :bordered="false" :single-line="false">
      <tbody>
        <tr v-for="f in result.fields" :key="f.label">
          <td style="width: 30%; font-weight: 600">
            {{ f.label }}
          </td>
          <td font-mono style="word-break: break-all">
            {{ f.value }}
          </td>
        </tr>
      </tbody>
    </n-table>
  </c-card>

  <div v-if="rawJson" mt-4>
    <h3>Raw RDAP response</h3>
    <TextareaCopyable :value="rawJson" language="json" />
  </div>
</template>
