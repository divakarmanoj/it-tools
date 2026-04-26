<script setup lang="ts">
import {
  decryptWithIdentity,
  decryptWithPassphrase,
  encryptWithPassphrase,
  encryptWithRecipient,
  generateAgeIdentity,
} from './age-encryption.service';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import InputCopyable from '@/components/InputCopyable.vue';

const tab = ref<'generate' | 'encrypt' | 'decrypt'>('generate');

// --- Generate
const identity = ref('');
const recipient = ref('');
const generating = ref(false);
const genError = ref('');

async function generate() {
  generating.value = true;
  genError.value = '';
  try {
    const r = await generateAgeIdentity();
    identity.value = r.identity;
    recipient.value = r.recipient;
  }
  catch (e: any) {
    genError.value = e?.message ?? String(e);
  }
  finally {
    generating.value = false;
  }
}

// --- Encrypt
const encMode = ref<'recipient' | 'passphrase'>('recipient');
const encMessage = ref('');
const encRecipient = ref('');
const encPassphrase = ref('');
const encResult = ref('');
const encError = ref('');
const encrypting = ref(false);

async function doEncrypt() {
  encrypting.value = true;
  encError.value = '';
  encResult.value = '';
  try {
    encResult.value = encMode.value === 'recipient'
      ? await encryptWithRecipient({ message: encMessage.value, recipient: encRecipient.value })
      : await encryptWithPassphrase({ message: encMessage.value, passphrase: encPassphrase.value });
  }
  catch (e: any) {
    encError.value = e?.message ?? String(e);
  }
  finally {
    encrypting.value = false;
  }
}

// --- Decrypt
const decMode = ref<'identity' | 'passphrase'>('identity');
const decArmored = ref('');
const decIdentity = ref('');
const decPassphrase = ref('');
const decResult = ref('');
const decError = ref('');
const decrypting = ref(false);

async function doDecrypt() {
  decrypting.value = true;
  decError.value = '';
  decResult.value = '';
  try {
    decResult.value = decMode.value === 'identity'
      ? await decryptWithIdentity({ armored: decArmored.value, identity: decIdentity.value })
      : await decryptWithPassphrase({ armored: decArmored.value, passphrase: decPassphrase.value });
  }
  catch (e: any) {
    decError.value = e?.message ?? String(e);
  }
  finally {
    decrypting.value = false;
  }
}

const encModeOptions = [
  { label: 'Recipient (age1...)', value: 'recipient' },
  { label: 'Passphrase', value: 'passphrase' },
];
const decModeOptions = [
  { label: 'Identity (AGE-SECRET-KEY-1...)', value: 'identity' },
  { label: 'Passphrase', value: 'passphrase' },
];
</script>

<template>
  <c-card>
    <n-tabs v-model:value="tab" type="line" animated>
      <n-tab-pane name="generate" tab="Generate identity">
        <div flex justify-center>
          <c-button :loading="generating" :disabled="generating" @click="generate">
            Generate X25519 identity
          </c-button>
        </div>
        <div v-if="genError" mt-3 op-70 style="color: var(--n-error-color)">
          {{ genError }}
        </div>
        <div v-if="identity" mt-4>
          <h3>Public recipient (share this)</h3>
          <InputCopyable :value="recipient" />
          <h3 mt-4>
            Private identity (keep secret)
          </h3>
          <InputCopyable :value="identity" />
        </div>
      </n-tab-pane>

      <n-tab-pane name="encrypt" tab="Encrypt">
        <n-form-item label="Mode" label-placement="top">
          <n-select v-model:value="encMode" :options="encModeOptions" />
        </n-form-item>
        <c-input-text
          v-if="encMode === 'recipient'"
          v-model:value="encRecipient"
          label="Recipient (age1...)"
          placeholder="age1..."
          monospace
          raw-text
          mb-3
        />
        <c-input-text
          v-else
          v-model:value="encPassphrase"
          label="Passphrase"
          type="password"
          mb-3
        />
        <c-input-text
          v-model:value="encMessage"
          label="Message"
          multiline
          rows="4"
          mb-3
        />
        <div flex justify-center>
          <c-button :loading="encrypting" :disabled="encrypting || !encMessage" @click="doEncrypt">
            Encrypt
          </c-button>
        </div>
        <div v-if="encError" mt-3 op-70 style="color: var(--n-error-color)">
          {{ encError }}
        </div>
        <div v-if="encResult" mt-4>
          <h3>Armored age payload</h3>
          <TextareaCopyable :value="encResult" />
        </div>
      </n-tab-pane>

      <n-tab-pane name="decrypt" tab="Decrypt">
        <n-form-item label="Mode" label-placement="top">
          <n-select v-model:value="decMode" :options="decModeOptions" />
        </n-form-item>
        <c-input-text
          v-if="decMode === 'identity'"
          v-model:value="decIdentity"
          label="Identity (AGE-SECRET-KEY-1...)"
          placeholder="AGE-SECRET-KEY-1..."
          monospace
          raw-text
          mb-3
        />
        <c-input-text
          v-else
          v-model:value="decPassphrase"
          label="Passphrase"
          type="password"
          mb-3
        />
        <c-input-text
          v-model:value="decArmored"
          label="Armored age payload"
          placeholder="-----BEGIN AGE ENCRYPTED FILE-----..."
          multiline
          rows="6"
          monospace
          raw-text
          mb-3
        />
        <div flex justify-center>
          <c-button :loading="decrypting" :disabled="decrypting || !decArmored" @click="doDecrypt">
            Decrypt
          </c-button>
        </div>
        <div v-if="decError" mt-3 op-70 style="color: var(--n-error-color)">
          {{ decError }}
        </div>
        <div v-if="decResult" mt-4>
          <h3>Decrypted message</h3>
          <TextareaCopyable :value="decResult" />
        </div>
      </n-tab-pane>
    </n-tabs>
  </c-card>
</template>
