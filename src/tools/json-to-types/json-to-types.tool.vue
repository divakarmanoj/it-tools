<script setup lang="ts">
import { type TargetLang, convertJsonToTypes, languageDisplay } from './json-to-types.service';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const sample = `{
  "id": 42,
  "name": "Alice",
  "email": "alice@example.com",
  "tags": ["admin", "beta"],
  "metadata": { "signupDate": "2026-01-01", "verified": true }
}`;

const json = ref(sample);
const language = ref<TargetLang>('typescript');
const typeName = ref('Root');

const output = ref('');
const error = ref('');
const converting = ref(false);

const languageOptions = (Object.entries(languageDisplay) as [TargetLang, { label: string }][])
  .map(([value, { label }]) => ({ value, label }));

watch([json, language, typeName], async () => {
  if (!json.value.trim()) {
    output.value = '';
    error.value = '';
    return;
  }
  converting.value = true;
  error.value = '';
  try {
    output.value = await convertJsonToTypes({ json: json.value, language: language.value, typeName: typeName.value || 'Root' });
  }
  catch (e: any) {
    output.value = '';
    error.value = e?.message ?? String(e);
  }
  finally {
    converting.value = false;
  }
}, { immediate: true });

const highlightLang = computed(() => languageDisplay[language.value].highlight);
</script>

<template>
  <c-card title="Input JSON">
    <c-input-text
      v-model:value="json"
      placeholder="Paste a JSON sample..."
      multiline
      rows="10"
      monospace
      raw-text
      autosize
    />
  </c-card>

  <c-card mt-4>
    <n-grid :cols="2" :x-gap="12">
      <n-gi>
        <n-form-item label="Target language" label-placement="top">
          <n-select v-model:value="language" :options="languageOptions" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Root type name" label-placement="top">
          <c-input-text v-model:value="typeName" placeholder="Root" />
        </n-form-item>
      </n-gi>
    </n-grid>
  </c-card>

  <c-card v-if="error" mt-4 title="Error">
    <pre style="color: var(--n-error-color); white-space: pre-wrap">{{ error }}</pre>
  </c-card>

  <div v-if="output" mt-4>
    <h3>{{ languageDisplay[language].label }} types</h3>
    <TextareaCopyable :value="output" :language="highlightLang" />
  </div>
</template>
