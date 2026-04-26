<script setup lang="ts">
import {
  type PgpKeyType,
  decryptMessage,
  encryptMessage,
  generateKeyPair,
} from './pgp-key-generator.service';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const tab = ref<'generate' | 'encrypt' | 'decrypt'>('generate');

// --- Generate
const name = ref('');
const email = ref('');
const passphrase = ref('');
const algorithm = ref<'ecc' | 'rsa'>('ecc');
const curve = ref<'curve25519' | 'p256' | 'p384' | 'p521'>('curve25519');
const rsaBits = ref<2048 | 3072 | 4096>(2048);

const generating = ref(false);
const genError = ref('');
const publicKey = ref('');
const privateKey = ref('');

async function generate() {
  generating.value = true;
  genError.value = '';
  publicKey.value = '';
  privateKey.value = '';
  try {
    const keyType: PgpKeyType = algorithm.value === 'rsa'
      ? { algorithm: 'rsa', rsaBits: rsaBits.value }
      : { algorithm: 'ecc', curve: curve.value };

    const result = await generateKeyPair({
      name: name.value || 'Anonymous',
      email: email.value || 'anonymous@example.com',
      passphrase: passphrase.value || undefined,
      keyType,
    });
    publicKey.value = result.publicKey;
    privateKey.value = result.privateKey;
  }
  catch (e: any) {
    genError.value = e?.message ?? String(e);
  }
  finally {
    generating.value = false;
  }
}

// --- Encrypt
const encMessage = ref('');
const encPublicKey = ref('');
const encResult = ref('');
const encError = ref('');
const encrypting = ref(false);

async function doEncrypt() {
  encrypting.value = true;
  encError.value = '';
  encResult.value = '';
  try {
    encResult.value = await encryptMessage({ message: encMessage.value, publicKeyArmored: encPublicKey.value.trim() });
  }
  catch (e: any) {
    encError.value = e?.message ?? String(e);
  }
  finally {
    encrypting.value = false;
  }
}

// --- Decrypt
const decMessage = ref('');
const decPrivateKey = ref('');
const decPassphrase = ref('');
const decResult = ref('');
const decError = ref('');
const decrypting = ref(false);

async function doDecrypt() {
  decrypting.value = true;
  decError.value = '';
  decResult.value = '';
  try {
    decResult.value = await decryptMessage({
      armoredMessage: decMessage.value.trim(),
      privateKeyArmored: decPrivateKey.value.trim(),
      passphrase: decPassphrase.value || undefined,
    });
  }
  catch (e: any) {
    decError.value = e?.message ?? String(e);
  }
  finally {
    decrypting.value = false;
  }
}

const algorithmOptions = [
  { label: 'ECC (Curve25519)', value: 'ecc' },
  { label: 'RSA', value: 'rsa' },
];
const curveOptions = [
  { label: 'curve25519 (recommended)', value: 'curve25519' },
  { label: 'NIST P-256', value: 'p256' },
  { label: 'NIST P-384', value: 'p384' },
  { label: 'NIST P-521', value: 'p521' },
];
const rsaOptions = [
  { label: '2048 bits', value: 2048 },
  { label: '3072 bits', value: 3072 },
  { label: '4096 bits', value: 4096 },
];
</script>

<template>
  <c-card>
    <n-tabs v-model:value="tab" type="line" animated>
      <n-tab-pane name="generate" tab="Generate keypair">
        <n-grid :cols="2" :x-gap="12" mb-3>
          <n-gi>
            <n-form-item label="Name" label-placement="top">
              <c-input-text v-model:value="name" placeholder="Alice" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Email" label-placement="top">
              <c-input-text v-model:value="email" placeholder="alice@example.com" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Algorithm" label-placement="top">
              <n-select v-model:value="algorithm" :options="algorithmOptions" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item v-if="algorithm === 'ecc'" label="Curve" label-placement="top">
              <n-select v-model:value="curve" :options="curveOptions" />
            </n-form-item>
            <n-form-item v-else label="RSA bits" label-placement="top">
              <n-select v-model:value="rsaBits" :options="rsaOptions" />
            </n-form-item>
          </n-gi>
        </n-grid>

        <c-input-text
          v-model:value="passphrase"
          label="Passphrase (optional)"
          placeholder="Leave empty for an unprotected private key"
          type="password"
          mb-3
        />

        <div flex justify-center>
          <c-button :loading="generating" :disabled="generating" @click="generate">
            {{ generating ? 'Generating…' : 'Generate keypair' }}
          </c-button>
        </div>

        <div v-if="genError" mt-3 op-70 style="color: var(--n-error-color)">
          {{ genError }}
        </div>

        <div v-if="publicKey" mt-4>
          <h3>Public key</h3>
          <TextareaCopyable :value="publicKey" />
        </div>
        <div v-if="privateKey" mt-4>
          <h3>Private key</h3>
          <TextareaCopyable :value="privateKey" />
        </div>
      </n-tab-pane>

      <n-tab-pane name="encrypt" tab="Encrypt">
        <c-input-text
          v-model:value="encPublicKey"
          label="Recipient's public key (armored)"
          placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----..."
          multiline
          rows="6"
          monospace
          raw-text
          mb-3
        />
        <c-input-text
          v-model:value="encMessage"
          label="Message"
          placeholder="Plaintext to encrypt..."
          multiline
          rows="4"
          mb-3
        />
        <div flex justify-center>
          <c-button :loading="encrypting" :disabled="encrypting || !encPublicKey || !encMessage" @click="doEncrypt">
            Encrypt
          </c-button>
        </div>
        <div v-if="encError" mt-3 op-70 style="color: var(--n-error-color)">
          {{ encError }}
        </div>
        <div v-if="encResult" mt-4>
          <h3>Encrypted message</h3>
          <TextareaCopyable :value="encResult" />
        </div>
      </n-tab-pane>

      <n-tab-pane name="decrypt" tab="Decrypt">
        <c-input-text
          v-model:value="decPrivateKey"
          label="Your private key (armored)"
          placeholder="-----BEGIN PGP PRIVATE KEY BLOCK-----..."
          multiline
          rows="6"
          monospace
          raw-text
          mb-3
        />
        <c-input-text
          v-model:value="decPassphrase"
          label="Passphrase (if private key is protected)"
          type="password"
          mb-3
        />
        <c-input-text
          v-model:value="decMessage"
          label="Encrypted message"
          placeholder="-----BEGIN PGP MESSAGE-----..."
          multiline
          rows="6"
          monospace
          raw-text
          mb-3
        />
        <div flex justify-center>
          <c-button :loading="decrypting" :disabled="decrypting || !decPrivateKey || !decMessage" @click="doDecrypt">
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
