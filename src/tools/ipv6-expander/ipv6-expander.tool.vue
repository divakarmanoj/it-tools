<script setup lang="ts">
import { compressIpv6, expandIpv6 } from './ipv6-expander.service';
import InputCopyable from '@/components/InputCopyable.vue';

const input = ref('2606:4700:4700::1111');

const expanded = computed(() => {
  try {
    return expandIpv6(input.value);
  }
  catch {
    return '';
  }
});

const compressed = computed(() => {
  try {
    return compressIpv6(input.value);
  }
  catch {
    return '';
  }
});

const error = computed(() => {
  try {
    expandIpv6(input.value);
    return '';
  }
  catch (e: any) {
    return e?.message ?? String(e);
  }
});
</script>

<template>
  <c-card>
    <c-input-text
      v-model:value="input"
      label="IPv6 address (compressed or expanded)"
      placeholder="2606:4700:4700::1111"
      monospace
      raw-text
    />
    <div v-if="error && input.trim()" mt-3 op-70 style="color: var(--n-error-color)">
      {{ error }}
    </div>
  </c-card>

  <c-card v-if="expanded" mt-4 title="Expanded (full form)">
    <InputCopyable :value="expanded" />
  </c-card>

  <c-card v-if="compressed" mt-4 title="Compressed (RFC 5952 canonical)">
    <InputCopyable :value="compressed" />
  </c-card>
</template>
