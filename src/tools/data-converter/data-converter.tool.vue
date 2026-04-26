<template>
  <div mx-auto w-full max-w-2400px important:flex-1>
    <div mb-3 flex flex-wrap items-end gap-3>
      <c-select
        v-model:value="from"
        label="From"
        label-position="top"
        :options="dataFormats"
        flex-1
        min-w-120px
      />
      <c-button circle title="Swap" mb-1 @click="swap">
        <n-icon size="20" :component="ArrowsLeftRight" />
      </c-button>
      <c-select
        v-model:value="to"
        label="To"
        label-position="top"
        :options="dataFormats"
        flex-1
        min-w-120px
      />
    </div>

    <div flex flex-col gap-4 class="panes" lg:flex-row>
      <div flex-1 class="pane">
        <c-input-text
          ref="inputElement"
          v-model:value="input"
          :label="`Input (${from.toUpperCase()})`"
          :placeholder="`Paste your ${from.toUpperCase()} here...`"
          raw-text
          multiline
          monospace
          test-id="input"
          class="fill"
          :validation-rules="rules"
        />
      </div>
      <div flex-1 overflow-auto class="pane">
        <div mb-5px>
          Output ({{ to.toUpperCase() }})
        </div>
        <textarea-copyable
          :value="output"
          :language="outputLanguage"
          :follow-height-of="inputElement?.inputWrapperRef"
          class="fill"
        />
        <c-alert v-if="error" mt-2 type="error">
          {{ error }}
        </c-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowsLeftRight } from '@vicons/tabler';
import { type DataFormat, convert, dataFormats, parse } from './data-converter.service';
import CInputText from '@/ui/c-input-text/c-input-text.vue';
import type { UseValidationRule } from '@/composable/validation';

const from = ref<DataFormat>('json');
const to = ref<DataFormat>('yaml');
const input = ref('{\n  "hello": "world",\n  "items": [1, 2, 3]\n}');
const inputElement = ref<typeof CInputText>();

const rules = computed<UseValidationRule<string>[]>(() => [
  {
    validator: (v: string) => v.trim() === '' || parse({ format: from.value, text: v }) !== undefined,
    message: `Invalid ${from.value.toUpperCase()} input.`,
  },
]);

const result = computed<{ output: string; error: string }>(() => {
  if (input.value.trim() === '') {
    return { output: '', error: '' };
  }
  try {
    return { output: convert({ from: from.value, to: to.value, text: input.value }), error: '' };
  }
  catch (e: any) {
    return { output: '', error: e?.message ?? String(e) };
  }
});
const output = computed(() => result.value.output);
const error = computed(() => result.value.error);

const languageMap: Record<DataFormat, string> = {
  json: 'json',
  yaml: 'yaml',
  toml: 'toml',
  xml: 'xml',
  csv: 'txt',
};
const outputLanguage = computed(() => languageMap[to.value]);

function swap() {
  const previousOutput = output.value;
  const next = from.value;
  from.value = to.value;
  to.value = next;
  if (previousOutput) {
    input.value = previousOutput;
  }
}
</script>

<style lang="less" scoped>
.panes {
  height: calc(100vh - 260px);
  min-height: 360px;
}
.pane {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.pane > .fill {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.pane :deep(.c-input-text) {
  flex: 1;
  min-height: 0;
}
.pane :deep(.feedback-wrapper),
.pane :deep(.input-wrapper) {
  height: 100%;
}
.pane :deep(textarea.input) {
  height: 100%;
  resize: none;
}
.pane :deep(.c-card) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.pane :deep(.c-card > .n-scrollbar) {
  flex: 1;
  min-height: 0 !important;
}
</style>
