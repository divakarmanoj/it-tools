<script setup lang="ts">
import { asnLookup } from './asn-lookup.service';

const ip = ref('8.8.8.8');
const loading = ref(false);
const error = ref('');
const result = ref<Awaited<ReturnType<typeof asnLookup>> | null>(null);

async function lookup() {
  loading.value = true;
  error.value = '';
  result.value = null;
  try {
    result.value = await asnLookup(ip.value);
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
        Lookup ASN
      </c-button>
    </div>
    <div mt-3 text-center text-xs op-60>
      Queries Team Cymru's IP-to-ASN service via Cloudflare DNS-over-HTTPS.
    </div>
  </c-card>

  <c-card v-if="error" mt-4 title="Error">
    <pre style="color: var(--n-error-color); white-space: pre-wrap">{{ error }}</pre>
  </c-card>

  <c-card v-if="result?.origin.length" mt-4 title="Origin AS">
    <n-table size="small" :bordered="false" :single-line="false">
      <thead>
        <tr><th>ASN</th><th>Prefix</th><th>Country</th><th>RIR</th><th>Allocated</th></tr>
      </thead>
      <tbody>
        <tr v-for="(o, i) in result.origin" :key="i">
          <td font-mono>
            AS{{ o.asn }}
          </td>
          <td font-mono>
            {{ o.prefix }}
          </td>
          <td>{{ o.country }}</td>
          <td>{{ o.rir }}</td>
          <td>{{ o.allocated }}</td>
        </tr>
      </tbody>
    </n-table>
  </c-card>

  <c-card v-if="result?.holder" mt-4 :title="`AS${result.holder.asn} holder`">
    <n-table size="small" :bordered="false" :single-line="false">
      <tbody>
        <tr>
          <td style="width: 30%; font-weight: 600">
            Name
          </td><td>{{ result.holder.name }}</td>
        </tr>
        <tr>
          <td style="font-weight: 600">
            Country
          </td><td>{{ result.holder.country }}</td>
        </tr>
        <tr>
          <td style="font-weight: 600">
            RIR
          </td><td>{{ result.holder.rir }}</td>
        </tr>
        <tr>
          <td style="font-weight: 600">
            Allocated
          </td><td>{{ result.holder.allocated }}</td>
        </tr>
      </tbody>
    </n-table>
  </c-card>
</template>
