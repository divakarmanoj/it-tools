<script setup lang="ts">
import { BITS_PER_WORD, entropyBits, generatePassphrase } from './diceware-passphrase-generator.service';
import { useCopy } from '@/composable/copy';
import { computedRefreshable } from '@/composable/computedRefreshable';

const count = ref(6);
const separator = ref('-');
const capitalize = ref(false);
const includeNumber = ref(false);

const [passphrase, refresh] = computedRefreshable(() =>
  generatePassphrase({
    count: count.value,
    separator: separator.value,
    capitalize: capitalize.value,
    includeNumber: includeNumber.value,
  }),
);

const bits = computed(() => entropyBits(count.value));
const { copy } = useCopy({ source: passphrase, text: 'Passphrase copied to the clipboard' });

const separatorOptions = [
  { label: 'Hyphen (-)', value: '-' },
  { label: 'Space ( )', value: ' ' },
  { label: 'Period (.)', value: '.' },
  { label: 'Underscore (_)', value: '_' },
  { label: 'Comma (,)', value: ',' },
];
</script>

<template>
  <c-card>
    <n-grid :cols="2" :x-gap="12">
      <n-gi>
        <n-form-item :label="`Words (${count})`" label-placement="top">
          <n-slider v-model:value="count" :min="3" :max="12" :step="1" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Separator" label-placement="top">
          <n-select v-model:value="separator" :options="separatorOptions" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Capitalize words" label-placement="top">
          <n-switch v-model:value="capitalize" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Append a random digit" label-placement="top">
          <n-switch v-model:value="includeNumber" />
        </n-form-item>
      </n-gi>
    </n-grid>

    <c-input-text
      :value="passphrase"
      multiline
      rows="2"
      autosize
      readonly
      monospace
      mt-2
    />

    <div mt-3 op-70 text-center>
      Entropy: <strong>{{ bits.toFixed(2) }} bits</strong>
      ({{ count }} × {{ BITS_PER_WORD.toFixed(2) }} bits/word)
    </div>

    <div mt-4 flex justify-center gap-3>
      <c-button @click="copy()">
        Copy
      </c-button>
      <c-button @click="refresh">
        Regenerate
      </c-button>
    </div>

    <div mt-6 op-50 text-xs text-center>
      Wordlist © Electronic Frontier Foundation, CC-BY 3.0 — EFF Large Wordlist (7,776 words).
    </div>
  </c-card>
</template>
