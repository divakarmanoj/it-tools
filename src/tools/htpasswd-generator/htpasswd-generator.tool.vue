<script setup lang="ts">
import { type HtpasswdAlgo, generateHtpasswdLine, verifyHtpasswdLine } from './htpasswd-generator.service';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const username = ref('admin');
const password = ref('');
const algo = ref<HtpasswdAlgo>('bcrypt');
const bcryptCost = ref(10);

const output = ref('');
const generating = ref(false);
const generateError = ref('');

const algoOpts = [
  { value: 'bcrypt', label: 'bcrypt ($2y$) — recommended' },
  { value: 'sha1', label: 'SHA1 ({SHA}base64) — insecure' },
  { value: 'plain', label: 'plain text — only for testing' },
];

async function regenerate() {
  if (!username.value || !password.value) {
    output.value = '';
    generateError.value = '';
    return;
  }
  generating.value = true;
  generateError.value = '';
  try {
    output.value = await generateHtpasswdLine({
      username: username.value,
      password: password.value,
      algo: algo.value,
      bcryptCost: bcryptCost.value,
    });
  }
  catch (e: any) {
    output.value = '';
    generateError.value = e?.message ?? String(e);
  }
  finally {
    generating.value = false;
  }
}

watch([username, password, algo, bcryptCost], regenerate, { immediate: true });

// ----- verify section -----
const verifyLine = ref('');
const verifyPassword = ref('');
const verifyResult = ref<{ valid: boolean; algo: string } | null>(null);
const verifyError = ref('');
const verifying = ref(false);

async function runVerify() {
  verifying.value = true;
  verifyError.value = '';
  verifyResult.value = null;
  try {
    verifyResult.value = await verifyHtpasswdLine(verifyLine.value, verifyPassword.value);
  }
  catch (e: any) {
    verifyError.value = e?.message ?? String(e);
  }
  finally {
    verifying.value = false;
  }
}
</script>

<template>
  <c-card title="Generate">
    <n-grid :cols="2" :x-gap="12">
      <n-gi>
        <n-form-item label="Username" label-placement="top">
          <c-input-text v-model:value="username" placeholder="admin" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Password" label-placement="top">
          <n-input v-model:value="password" type="password" show-password-on="click" placeholder="..." />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Algorithm" label-placement="top">
          <n-select v-model:value="algo" :options="algoOpts" />
        </n-form-item>
      </n-gi>
      <n-gi v-if="algo === 'bcrypt'">
        <n-form-item label="bcrypt cost (4–14)" label-placement="top">
          <n-input-number v-model:value="bcryptCost" :min="4" :max="14" />
        </n-form-item>
      </n-gi>
    </n-grid>
    <p v-if="algo === 'sha1'" mt-2 style="color: var(--n-warning-color)">
      ⚠ SHA1 is unsalted and trivially crackable. Use bcrypt unless you have a hard compatibility constraint.
    </p>
    <p v-if="algo === 'plain'" mt-2 style="color: var(--n-error-color)">
      ⚠ Plain text storage is only valid on Windows/Netware Apache builds, and only for testing.
    </p>
  </c-card>

  <c-card v-if="generateError" mt-4 title="Error">
    <pre style="color: var(--n-error-color); white-space: pre-wrap">{{ generateError }}</pre>
  </c-card>

  <c-card v-if="output" mt-4 title=".htpasswd line">
    <TextareaCopyable :value="output" />
    <p mt-2 text-sm op-70>
      Append this line to your <code>.htpasswd</code> file. Each line is one user.
    </p>
  </c-card>

  <c-card mt-4 title="Verify a password against an existing line">
    <n-form-item label=".htpasswd line" label-placement="top">
      <c-input-text v-model:value="verifyLine" placeholder="user:$2y$10$..." monospace />
    </n-form-item>
    <n-form-item label="Candidate password" label-placement="top">
      <n-input v-model:value="verifyPassword" type="password" show-password-on="click" placeholder="..." />
    </n-form-item>
    <c-button type="primary" :loading="verifying" @click="runVerify">
      Verify
    </c-button>
    <p v-if="verifyResult" mt-3>
      <n-tag :type="verifyResult.valid ? 'success' : 'error'">
        {{ verifyResult.valid ? '✓ Match' : '✗ No match' }}
      </n-tag>
      <span ml-2 op-70>detected algorithm: {{ verifyResult.algo }}</span>
    </p>
    <p v-if="verifyError" mt-2 style="color: var(--n-error-color)">
      {{ verifyError }}
    </p>
  </c-card>
</template>
