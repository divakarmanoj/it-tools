<script setup lang="ts">
import { useThemeVars } from 'naive-ui';
import {
  type Argon2Variant,
  generateSalt,
  hashPassword,
  verifyPassword,
} from './argon2-hash-generator.service';
import { useCopy } from '@/composable/copy';

const themeVars = useThemeVars();

const password = ref('correct horse battery staple');
const variant = ref<Argon2Variant>('argon2id');
const iterations = ref(3);
const memorySize = ref(4096);
const parallelism = ref(1);
const hashLength = ref(32);
const saltLength = ref(16);

const saltSeed = ref(0);
function refreshSalt() {
  saltSeed.value++;
}

const salt = computed(() => {
  // recompute when saltSeed/saltLength changes
  void saltSeed.value;
  return generateSalt(saltLength.value);
});

const hashing = ref(false);
const hashed = ref('');
const hashError = ref('');

watch(
  [password, variant, iterations, memorySize, parallelism, hashLength, salt],
  async () => {
    if (!password.value) {
      hashed.value = '';
      hashError.value = '';
      return;
    }
    hashing.value = true;
    hashError.value = '';
    try {
      hashed.value = await hashPassword({
        password: password.value,
        salt: salt.value,
        variant: variant.value,
        iterations: iterations.value,
        memorySize: memorySize.value,
        parallelism: parallelism.value,
        hashLength: hashLength.value,
      });
    }
    catch (e: any) {
      hashError.value = e?.message ?? String(e);
      hashed.value = '';
    }
    finally {
      hashing.value = false;
    }
  },
  { immediate: true },
);

const { copy } = useCopy({ source: hashed, text: 'Argon2 hash copied to the clipboard' });

const verifyPasswordInput = ref('');
const verifyHashInput = ref('');
const verifyResult = ref<boolean | null>(null);
const verifyError = ref('');

watch([verifyPasswordInput, verifyHashInput], async () => {
  verifyError.value = '';
  if (!verifyPasswordInput.value || !verifyHashInput.value) {
    verifyResult.value = null;
    return;
  }
  try {
    verifyResult.value = await verifyPassword({ password: verifyPasswordInput.value, hash: verifyHashInput.value.trim() });
  }
  catch (e: any) {
    verifyError.value = e?.message ?? String(e);
    verifyResult.value = null;
  }
});

const variantOptions = [
  { label: 'Argon2id (recommended)', value: 'argon2id' },
  { label: 'Argon2i', value: 'argon2i' },
  { label: 'Argon2d', value: 'argon2d' },
];
</script>

<template>
  <c-card title="Hash">
    <c-input-text
      v-model:value="password"
      label="Password"
      placeholder="Password to hash..."
      raw-text
      mb-3
    />

    <n-grid :cols="2" :x-gap="12">
      <n-gi>
        <n-form-item label="Variant" label-placement="top">
          <n-select v-model:value="variant" :options="variantOptions" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Salt length (bytes)" label-placement="top">
          <n-input-number v-model:value="saltLength" :min="8" :max="64" w-full />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Iterations (t)" label-placement="top">
          <n-input-number v-model:value="iterations" :min="1" :max="16" w-full />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Memory (KiB)" label-placement="top">
          <n-input-number v-model:value="memorySize" :min="64" :max="1048576" :step="1024" w-full />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Parallelism (p)" label-placement="top">
          <n-input-number v-model:value="parallelism" :min="1" :max="16" w-full />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Hash length (bytes)" label-placement="top">
          <n-input-number v-model:value="hashLength" :min="4" :max="128" w-full />
        </n-form-item>
      </n-gi>
    </n-grid>

    <c-input-text :value="hashing ? 'Hashing…' : hashed" multiline rows="3" autosize readonly monospace mt-3 />
    <div v-if="hashError" mt-2 op-70 style="color: var(--n-error-color)">
      {{ hashError }}
    </div>

    <div mt-4 flex justify-center gap-3>
      <c-button :disabled="!hashed || hashing" @click="copy()">
        Copy hash
      </c-button>
      <c-button :disabled="hashing" @click="refreshSalt">
        New salt
      </c-button>
    </div>
  </c-card>

  <c-card title="Verify" mt-4>
    <c-input-text
      v-model:value="verifyPasswordInput"
      label="Password"
      placeholder="Password to verify..."
      raw-text
      mb-3
    />
    <c-input-text
      v-model:value="verifyHashInput"
      label="Argon2 PHC hash"
      placeholder="$argon2id$v=19$m=...,t=...,p=...$..."
      multiline
      rows="2"
      autosize
      monospace
      raw-text
    />

    <div v-if="verifyResult !== null" mt-4 flex justify-center>
      <div class="verify-result" :class="{ positive: verifyResult }">
        {{ verifyResult ? 'Match' : 'No match' }}
      </div>
    </div>
    <div v-if="verifyError" mt-2 op-70 style="color: var(--n-error-color)">
      {{ verifyError }}
    </div>
  </c-card>
</template>

<style lang="less" scoped>
.verify-result {
  font-size: 1.1rem;
  font-weight: 600;
  color: v-bind('themeVars.errorColor');

  &.positive {
    color: v-bind('themeVars.successColor');
  }
}
</style>
