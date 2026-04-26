<script setup lang="ts">
import { generateCsr } from './csr-generator.service';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { useValidation } from '@/composable/validation';

const commonName = ref('example.com');
const organization = ref('');
const organizationalUnit = ref('');
const country = ref('');
const state = ref('');
const locality = ref('');
const emailAddress = ref('');
const sansRaw = ref('DNS:example.com\nDNS:www.example.com');
const rsaBits = ref<2048 | 3072 | 4096>(2048);

const cnValidation = useValidation({
  source: commonName,
  rules: [{ message: 'Common name is required', validator: (v: string) => v.trim() !== '' }],
});

const countryValidation = useValidation({
  source: country,
  rules: [{
    message: 'Country must be a 2-letter ISO 3166 code (or empty)',
    validator: (v: string) => v === '' || /^[A-Z]{2}$/i.test(v),
  }],
});

const generating = ref(false);
const error = ref('');
const csrPem = ref('');
const privateKeyPem = ref('');

async function generate() {
  if (!cnValidation.isValid || !countryValidation.isValid) {
    return;
  }
  generating.value = true;
  error.value = '';
  csrPem.value = '';
  privateKeyPem.value = '';
  try {
    const sans = sansRaw.value
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const result = await generateCsr({
      commonName: commonName.value.trim(),
      organization: organization.value.trim() || undefined,
      organizationalUnit: organizationalUnit.value.trim() || undefined,
      country: country.value.trim().toUpperCase() || undefined,
      state: state.value.trim() || undefined,
      locality: locality.value.trim() || undefined,
      emailAddress: emailAddress.value.trim() || undefined,
      sans,
      rsaBits: rsaBits.value,
    });
    csrPem.value = result.csrPem;
    privateKeyPem.value = result.privateKeyPem;
  }
  catch (e: any) {
    error.value = e?.message ?? String(e);
  }
  finally {
    generating.value = false;
  }
}

const rsaOptions = [
  { label: '2048 bits', value: 2048 },
  { label: '3072 bits', value: 3072 },
  { label: '4096 bits', value: 4096 },
];
</script>

<template>
  <c-card title="Subject">
    <n-grid :cols="2" :x-gap="12" :y-gap="6">
      <n-gi>
        <n-form-item label="Common name (CN, required)" label-placement="top" v-bind="cnValidation.attrs as any">
          <c-input-text v-model:value="commonName" placeholder="example.com" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Organization (O)" label-placement="top">
          <c-input-text v-model:value="organization" placeholder="Example Inc" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Organizational unit (OU)" label-placement="top">
          <c-input-text v-model:value="organizationalUnit" placeholder="Engineering" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Email" label-placement="top">
          <c-input-text v-model:value="emailAddress" placeholder="admin@example.com" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Locality (L)" label-placement="top">
          <c-input-text v-model:value="locality" placeholder="San Francisco" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="State / province (ST)" label-placement="top">
          <c-input-text v-model:value="state" placeholder="California" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Country (C, 2-letter)" label-placement="top" v-bind="countryValidation.attrs as any">
          <c-input-text v-model:value="country" placeholder="US" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Key size" label-placement="top">
          <n-select v-model:value="rsaBits" :options="rsaOptions" />
        </n-form-item>
      </n-gi>
    </n-grid>

    <c-input-text
      v-model:value="sansRaw"
      label="Subject alternative names (one per line; prefix DNS:, IP:, email:, URI:)"
      multiline
      rows="4"
      monospace
      mt-2
    />

    <div mt-4 flex justify-center>
      <c-button
        :loading="generating"
        :disabled="generating || !cnValidation.isValid || !countryValidation.isValid"
        @click="generate"
      >
        Generate CSR
      </c-button>
    </div>

    <div v-if="error" mt-3 op-70 style="color: var(--n-error-color)">
      {{ error }}
    </div>
  </c-card>

  <div v-if="csrPem" mt-4>
    <h3>Certificate Signing Request</h3>
    <TextareaCopyable :value="csrPem" />
  </div>
  <div v-if="privateKeyPem" mt-4>
    <h3>Private key (keep secret)</h3>
    <TextareaCopyable :value="privateKeyPem" />
  </div>
</template>
