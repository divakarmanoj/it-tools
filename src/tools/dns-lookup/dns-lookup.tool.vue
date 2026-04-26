<script setup lang="ts">
import { RECORD_TYPES, type RecordType, dnsLookup } from './dns-lookup.service';

const name = ref('example.com');
const type = ref<RecordType>('A');

const loading = ref(false);
const error = ref('');
const result = ref<Awaited<ReturnType<typeof dnsLookup>> | null>(null);

async function lookup() {
  loading.value = true;
  error.value = '';
  result.value = null;
  try {
    result.value = await dnsLookup({ name: name.value, type: type.value });
  }
  catch (e: any) {
    error.value = e?.message ?? String(e);
  }
  finally {
    loading.value = false;
  }
}

const typeOptions = RECORD_TYPES.map(t => ({ value: t, label: t }));

onMounted(() => lookup());
</script>

<template>
  <c-card>
    <n-grid :cols="3" :x-gap="12">
      <n-gi :span="2">
        <n-form-item label="Domain" label-placement="top">
          <c-input-text v-model:value="name" placeholder="example.com" raw-text @keyup.enter="lookup" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Record type" label-placement="top">
          <n-select v-model:value="type" :options="typeOptions" />
        </n-form-item>
      </n-gi>
    </n-grid>
    <div mt-3 flex justify-center>
      <c-button :loading="loading" :disabled="loading || !name.trim()" @click="lookup">
        Lookup
      </c-button>
    </div>
    <div mt-3 text-center text-xs op-60>
      Resolves via Cloudflare DNS-over-HTTPS (1.1.1.1). Queries leave your browser only to <code>1.1.1.1</code>.
    </div>
  </c-card>

  <c-card v-if="error" mt-4 title="Error">
    <pre style="color: var(--n-error-color); white-space: pre-wrap">{{ error }}</pre>
  </c-card>

  <c-card v-if="result" mt-4 :title="`${result.question.type} records for ${result.question.name}`">
    <div v-if="result.answers.length === 0" text-center op-60>
      No records returned. Status: {{ result.statusName }}
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
        <tr v-for="(a, i) in result.answers" :key="i">
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

    <div v-if="result.authority.length" mt-4>
      <h3>Authority</h3>
      <n-table size="small" :bordered="false" :single-line="false">
        <tbody>
          <tr v-for="(a, i) in result.authority" :key="i">
            <td font-mono>
              {{ a.name }}
            </td>
            <td font-mono style="word-break: break-all">
              {{ a.data }}
            </td>
          </tr>
        </tbody>
      </n-table>
    </div>
  </c-card>
</template>
