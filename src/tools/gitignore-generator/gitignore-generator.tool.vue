<script setup lang="ts">
import { TEMPLATES, buildGitignore } from './gitignore-templates';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const selected = ref<string[]>(['node', 'macos', 'vscode']);

const options = TEMPLATES.map(t => ({ value: t.id, label: t.name }));

const output = computed(() => buildGitignore(selected.value));
</script>

<template>
  <c-card title="Pick templates">
    <n-select
      v-model:value="selected"

      filterable multiple
      :options="options"
      placeholder="Search and pick languages, IDEs, OSes..."
    />
    <p mt-2 text-sm op-70>
      {{ TEMPLATES.length }} templates available. Order is preserved in the output.
    </p>
  </c-card>

  <c-card v-if="output" mt-4 title=".gitignore">
    <TextareaCopyable :value="output" />
  </c-card>
</template>
