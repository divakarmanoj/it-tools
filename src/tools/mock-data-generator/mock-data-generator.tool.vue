<script setup lang="ts">
import { FIELD_KIND_OPTIONS, type FieldDef, type FieldKind, generateMockData } from './mock-data-generator.service';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const fields = ref<FieldDef[]>([
  { name: 'id', kind: 'uuid' },
  { name: 'firstName', kind: 'firstName' },
  { name: 'lastName', kind: 'lastName' },
  { name: 'email', kind: 'email' },
  { name: 'createdAt', kind: 'isoDate' },
]);
const count = ref(10);
const format = ref<'json' | 'csv' | 'sql'>('json');
const tableName = ref('users');
const useSeed = ref(false);
const seed = ref(42);

const output = ref('');
const generating = ref(false);
const errorMsg = ref('');

const formatOpts = [
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
  { value: 'sql', label: 'SQL INSERT' },
];

const kindOpts = computed(() => {
  // Group by category for nicer dropdown.
  const groups = new Map<string, { value: FieldKind; label: string }[]>();
  for (const o of FIELD_KIND_OPTIONS) {
    if (!groups.has(o.group)) {
      groups.set(o.group, []);
    }
    groups.get(o.group)!.push({ value: o.value, label: o.label });
  }
  return [...groups.entries()].map(([type, children]) => ({
    type: 'group',
    label: type,
    key: type,
    children,
  }));
});

function addField() {
  fields.value.push({ name: `field${fields.value.length + 1}`, kind: 'word' });
}
function removeField(i: number) {
  fields.value.splice(i, 1);
}

async function regenerate() {
  if (!fields.value.length || count.value <= 0) {
    output.value = '';
    return;
  }
  generating.value = true;
  errorMsg.value = '';
  try {
    output.value = await generateMockData({
      fields: fields.value,
      count: count.value,
      format: format.value,
      tableName: tableName.value,
      seed: useSeed.value ? seed.value : undefined,
    });
  }
  catch (e: any) {
    errorMsg.value = e?.message ?? String(e);
    output.value = '';
  }
  finally {
    generating.value = false;
  }
}

const highlightLang = computed(() => format.value === 'csv' ? 'plaintext' : format.value === 'sql' ? 'sql' : 'json');
</script>

<template>
  <c-card title="Fields">
    <div v-for="(f, i) in fields" :key="i" mb-2 flex items-center gap-2>
      <c-input-text v-model:value="f.name" placeholder="field name" style="flex: 1" />
      <n-select v-model:value="f.kind" :options="kindOpts" style="flex: 2" />
      <c-input-text v-if="f.kind === 'enum'" v-model:value="f.enumValues" placeholder="A, B, C" style="flex: 2" />
      <c-button @click="removeField(i)">
        ×
      </c-button>
    </div>
    <c-button @click="addField">
      + Add field
    </c-button>
  </c-card>

  <c-card mt-4 title="Output">
    <n-grid :cols="3" :x-gap="12" :y-gap="8">
      <n-gi>
        <n-form-item label="Number of rows" label-placement="top">
          <n-input-number v-model:value="count" :min="1" :max="10000" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Format" label-placement="top">
          <n-select v-model:value="format" :options="formatOpts" />
        </n-form-item>
      </n-gi>
      <n-gi v-if="format === 'sql'">
        <n-form-item label="Table name" label-placement="top">
          <c-input-text v-model:value="tableName" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Deterministic (seed)" label-placement="top">
          <n-switch v-model:value="useSeed" />
        </n-form-item>
      </n-gi>
      <n-gi v-if="useSeed">
        <n-form-item label="Seed" label-placement="top">
          <n-input-number v-model:value="seed" />
        </n-form-item>
      </n-gi>
    </n-grid>
    <c-button mt-3 type="primary" :loading="generating" @click="regenerate">
      Generate
    </c-button>
  </c-card>

  <c-card v-if="errorMsg" mt-4 title="Error">
    <pre style="color: var(--n-error-color); white-space: pre-wrap">{{ errorMsg }}</pre>
  </c-card>

  <c-card v-if="output" mt-4 title="Result">
    <TextareaCopyable :value="output" :language="highlightLang" />
  </c-card>
</template>
