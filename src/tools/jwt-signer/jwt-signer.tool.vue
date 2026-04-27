<script setup lang="ts">
import { ALL_ALGS, type JwtAlg, decodeJwtUnverified, generateKeyPairPem, signJwt, verifyJwt } from './jwt-signer.service';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const tab = ref<'sign' | 'verify'>('sign');

const alg = ref<JwtAlg>('HS256');
const algOpts = ALL_ALGS.map(a => ({ value: a, label: a }));

const samplePayload = `{
  "sub": "1234567890",
  "name": "Alice",
  "admin": true
}`;

const payload = ref(samplePayload);
const key = ref('your-256-bit-secret');
const issuer = ref('');
const audience = ref('');
const subject = ref('');
const expiresIn = ref('1h');
const notBefore = ref('');
const jti = ref('');
const kid = ref('');

const signed = ref('');
const signError = ref('');
const signing = ref(false);

// ----- verify tab state (declared up here so genKeypair can populate the public key) -----
const verifyJwtInput = ref('');
const verifyKey = ref('your-256-bit-secret');
const verifyResult = ref<{ valid: boolean; header?: object; payload?: object; error?: string } | null>(null);
const verifying = ref(false);

const isAsymmetric = computed(() => !alg.value.startsWith('HS'));

async function doSign() {
  signError.value = '';
  signed.value = '';
  let parsed: object;
  try {
    parsed = JSON.parse(payload.value);
  }
  catch (e: any) {
    signError.value = `Payload JSON: ${e?.message}`;
    return;
  }
  signing.value = true;
  try {
    signed.value = await signJwt({
      alg: alg.value,
      payload: parsed,
      key: key.value,
      issuer: issuer.value || undefined,
      audience: audience.value || undefined,
      subject: subject.value || undefined,
      expiresIn: expiresIn.value || undefined,
      notBefore: notBefore.value || undefined,
      jti: jti.value || undefined,
      kid: kid.value || undefined,
    });
  }
  catch (e: any) {
    signError.value = e?.message ?? String(e);
  }
  finally {
    signing.value = false;
  }
}

async function genKeypair() {
  if (!isAsymmetric.value) {
    return;
  }
  signError.value = '';
  try {
    const { privateKey, publicKey } = await generateKeyPairPem(alg.value);
    key.value = privateKey;
    verifyKey.value = publicKey;
  }
  catch (e: any) {
    signError.value = e?.message ?? String(e);
  }
}

const decoded = computed(() => signed.value ? decodeJwtUnverified(signed.value) : null);

async function doVerify() {
  verifying.value = true;
  verifyResult.value = null;
  try {
    verifyResult.value = await verifyJwt({ jwt: verifyJwtInput.value, alg: alg.value, key: verifyKey.value });
  }
  finally {
    verifying.value = false;
  }
}
</script>

<template>
  <c-card>
    <n-tabs v-model:value="tab" type="line">
      <n-tab name="sign" tab="Sign" />
      <n-tab name="verify" tab="Verify" />
    </n-tabs>
  </c-card>

  <c-card mt-4 title="Algorithm">
    <n-select v-model:value="alg" :options="algOpts" />
    <p mt-2 text-sm op-70>
      <strong>HS</strong>* uses a shared secret. <strong>RS</strong>/<strong>PS</strong>/<strong>ES</strong>* use a PEM PKCS#8 private key (signing) or SPKI public key (verifying).
    </p>
  </c-card>

  <!-- SIGN -->
  <template v-if="tab === 'sign'">
    <c-card mt-4 title="Payload (JSON)">
      <c-input-text v-model:value="payload" multiline rows="8" monospace raw-text autosize />
    </c-card>

    <c-card mt-4 :title="isAsymmetric ? 'Private key (PEM PKCS#8)' : 'Secret (UTF-8 text)'">
      <c-input-text v-model:value="key" multiline rows="6" monospace raw-text autosize />
      <c-button v-if="isAsymmetric" mt-2 @click="genKeypair">
        Generate new keypair
      </c-button>
    </c-card>

    <c-card mt-4 title="Standard claims (optional)">
      <n-grid :cols="2" :x-gap="12">
        <n-gi>
          <n-form-item label="iss (issuer)" label-placement="top">
            <c-input-text v-model:value="issuer" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="aud (audience)" label-placement="top">
            <c-input-text v-model:value="audience" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="sub (subject)" label-placement="top">
            <c-input-text v-model:value="subject" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="exp (e.g. 1h, 3600s)" label-placement="top">
            <c-input-text v-model:value="expiresIn" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="nbf" label-placement="top">
            <c-input-text v-model:value="notBefore" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="jti" label-placement="top">
            <c-input-text v-model:value="jti" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="kid (header)" label-placement="top">
            <c-input-text v-model:value="kid" />
          </n-form-item>
        </n-gi>
      </n-grid>
    </c-card>

    <c-card mt-4>
      <c-button type="primary" :loading="signing" @click="doSign">
        Sign JWT
      </c-button>
    </c-card>

    <c-card v-if="signError" mt-4 title="Error">
      <pre style="color: var(--n-error-color); white-space: pre-wrap">{{ signError }}</pre>
    </c-card>

    <c-card v-if="signed" mt-4 title="Signed JWT">
      <TextareaCopyable :value="signed" />
    </c-card>

    <c-card v-if="decoded?.header" mt-4 title="Decoded">
      <h4 mt-0>
        Header
      </h4>
      <TextareaCopyable :value="JSON.stringify(decoded.header, null, 2)" language="json" />
      <h4 mt-3>
        Payload
      </h4>
      <TextareaCopyable :value="JSON.stringify(decoded.payload, null, 2)" language="json" />
    </c-card>
  </template>

  <!-- VERIFY -->
  <template v-if="tab === 'verify'">
    <c-card mt-4 title="JWT to verify">
      <c-input-text v-model:value="verifyJwtInput" multiline rows="4" monospace raw-text autosize placeholder="eyJ..." />
    </c-card>

    <c-card mt-4 :title="isAsymmetric ? 'Public key (PEM SPKI)' : 'Secret (UTF-8 text)'">
      <c-input-text v-model:value="verifyKey" multiline rows="6" monospace raw-text autosize />
    </c-card>

    <c-card mt-4>
      <c-button type="primary" :loading="verifying" @click="doVerify">
        Verify
      </c-button>
    </c-card>

    <c-card v-if="verifyResult" mt-4 title="Result">
      <n-tag :type="verifyResult.valid ? 'success' : 'error'" size="large">
        {{ verifyResult.valid ? '✓ Valid signature & not expired' : `✗ ${verifyResult.error}` }}
      </n-tag>
      <template v-if="verifyResult.valid">
        <h4 mt-3>
          Header
        </h4>
        <TextareaCopyable :value="JSON.stringify(verifyResult.header, null, 2)" language="json" />
        <h4 mt-3>
          Payload
        </h4>
        <TextareaCopyable :value="JSON.stringify(verifyResult.payload, null, 2)" language="json" />
      </template>
    </c-card>
  </template>
</template>
