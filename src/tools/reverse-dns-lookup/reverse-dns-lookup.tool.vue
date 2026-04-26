<script setup lang="ts">
import { reverseDnsLookup, statusName } from './reverse-dns-lookup.service';

const ip = ref('8.8.8.8');
const loading = ref(false);
const error = ref('');
const result = ref<Awaited<ReturnType<typeof reverseDnsLookup>> | null>(null);

async function lookup() {
  loading.value = true;
  error.value = '';
  result.value = null;
  try {
    result.value = await reverseDnsLookup(ip.value);
  }
  catch (e: any) {
    error.value = e?.message ?? String(e);
  }
  finally {
    loading.value = false;
  }
}

onMounted(() => lookup());
</script>

<template>
  <c-card>
    <c-input-text
      v-model:value="ip"
      label="IPv4 or IPv6 address"
      placeholder="8.8.8.8 or 2606:4700:4700::1111"
      monospace
      raw-text
      @keyup.enter="lookup"
    />
    <div mt-3 flex justify-center>
      <c-button :loading="loading" :disabled="loading || !ip.trim()" @click="lookup">
        Lookup PTR
      </c-button>
    </div>
    <div mt-3 text-center text-xs op-60>
      Resolves PTR records via Cloudflare DNS-over-HTTPS (1.1.1.1).
    </div>
  </c-card>

  <c-card v-if="error" mt-4 title="Error">
    <pre style="color: var(--n-error-color); white-space: pre-wrap">{{ error }}</pre>
  </c-card>

  <c-card v-if="result" mt-4 :title="`PTR for ${result.ip}`">
    <div mb-3 text-sm op-60>
      Reverse DNS name: <code>{{ result.reverseName }}</code>
    </div>
    <div v-if="result.names.length === 0" text-center op-60>
      No PTR records returned ({{ statusName(result.status) }}).
    </div>
    <ul v-else>
      <li v-for="n in result.names" :key="n" font-mono>
        {{ n }}
      </li>
    </ul>
  </c-card>
</template>
