<script setup lang="ts">
import { useThemeVars } from 'naive-ui';
import { useQRCode } from '../qr-code-generator/useQRCode';
import { type OtpAlgorithm, type OtpType, buildKeyUri, generateSecret } from './totp-secret-generator.service';
import { useStyleStore } from '@/stores/style.store';
import InputCopyable from '@/components/InputCopyable.vue';

const themeVars = useThemeVars();
const styleStore = useStyleStore();

const type = ref<OtpType>('totp');
const issuer = ref('IT-Tools');
const account = ref('user@example.com');
const algorithm = ref<OtpAlgorithm>('SHA1');
const digits = ref(6);
const period = ref(30);
const counter = ref(0);
const secretLength = ref(32);

const secret = ref(generateSecret(secretLength.value));
function refreshSecret() {
  secret.value = generateSecret(secretLength.value);
}
watch(secretLength, () => refreshSecret());

const secretValidationRules = [
  {
    message: 'Secret must be base32 (A–Z, 2–7)',
    validator: (v: string) => /^[A-Z2-7]+$/i.test(v),
  },
  {
    message: 'Secret is required',
    validator: (v: string) => v !== '',
  },
];

const keyUri = computed(() =>
  buildKeyUri({
    type: type.value,
    secret: secret.value.toUpperCase(),
    issuer: issuer.value || 'IT-Tools',
    account: account.value || 'user',
    algorithm: algorithm.value,
    digits: digits.value,
    period: period.value,
    counter: counter.value,
  }),
);

const { qrcode } = useQRCode({
  text: keyUri,
  color: {
    background: computed(() => (styleStore.isDarkTheme ? '#ffffff' : '#ffffff')),
    foreground: '#000000',
  },
  options: { width: 280, margin: 2 },
});

const typeOptions = [
  { label: 'TOTP (time-based)', value: 'totp' },
  { label: 'HOTP (counter-based)', value: 'hotp' },
];
const algorithmOptions = [
  { label: 'SHA1 (default)', value: 'SHA1' },
  { label: 'SHA256', value: 'SHA256' },
  { label: 'SHA512', value: 'SHA512' },
];
const digitOptions = [
  { label: '6', value: 6 },
  { label: '7', value: 7 },
  { label: '8', value: 8 },
];
const periodOptions = [
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
];
</script>

<template>
  <c-card>
    <n-grid :cols="2" :x-gap="12">
      <n-gi>
        <n-form-item label="Type" label-placement="top">
          <n-select v-model:value="type" :options="typeOptions" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Algorithm" label-placement="top">
          <n-select v-model:value="algorithm" :options="algorithmOptions" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Issuer" label-placement="top">
          <c-input-text v-model:value="issuer" placeholder="Your service name" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Account" label-placement="top">
          <c-input-text v-model:value="account" placeholder="user@example.com" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Digits" label-placement="top">
          <n-select v-model:value="digits" :options="digitOptions" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item v-if="type === 'totp'" label="Period (s)" label-placement="top">
          <n-select v-model:value="period" :options="periodOptions" />
        </n-form-item>
        <n-form-item v-else label="Counter" label-placement="top">
          <n-input-number v-model:value="counter" :min="0" w-full />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Secret length (chars)" label-placement="top">
          <n-input-number v-model:value="secretLength" :min="16" :max="128" :step="2" w-full />
        </n-form-item>
      </n-gi>
    </n-grid>

    <c-input-text
      v-model:value="secret"
      label="Secret (base32)"
      :validation-rules="secretValidationRules"
      mt-2
    >
      <template #suffix>
        <c-tooltip tooltip="Generate a new random secret">
          <c-button circle variant="text" size="small" @click="refreshSecret">
            <icon-mdi-refresh />
          </c-button>
        </c-tooltip>
      </template>
    </c-input-text>

    <div mt-4 flex flex-col items-center gap-3>
      <n-image :src="qrcode" />
      <p text-center op-70>
        Scan with Google Authenticator, 1Password, Authy, etc. — or copy the URI manually.
      </p>
    </div>

    <InputCopyable
      :value="keyUri"
      mt-3
    />
  </c-card>
</template>

<style lang="less" scoped>
:deep(.n-image img) {
  border: 1px solid v-bind('themeVars.borderColor');
  border-radius: 6px;
  background: white;
}
</style>
