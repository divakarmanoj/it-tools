<script setup lang="ts">
import { LICENSES, getLicense, renderLicense } from './license-chooser.service';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const selectedId = ref('mit');
const author = ref('Your Name');
const year = ref(String(new Date().getFullYear()));

const license = computed(() => getLicense(selectedId.value));
const output = computed(() => renderLicense(selectedId.value, { author: author.value, year: year.value }));

const options = LICENSES.map(l => ({ value: l.id, label: l.name }));
</script>

<template>
  <c-card title="Pick a license">
    <n-form-item label="License" label-placement="top">
      <n-select v-model:value="selectedId" :options="options" filterable />
    </n-form-item>

    <div v-if="license" mt-2>
      <n-tag v-if="license.permissive" type="success" size="small" mr-2>
        Permissive
      </n-tag>
      <n-tag v-if="license.copyleft" type="warning" size="small" mr-2>
        Copyleft
      </n-tag>
      <n-tag size="small" mr-2>
        SPDX: {{ license.spdx }}
      </n-tag>
      <p mt-2 op-80>
        {{ license.description }}
      </p>
    </div>
  </c-card>

  <c-card v-if="license" mt-4 title="Fill in fields">
    <n-grid :cols="2" :x-gap="12">
      <n-gi>
        <n-form-item label="Copyright holder" label-placement="top">
          <c-input-text v-model:value="author" :disabled="!license.needsAuthor" placeholder="Your Name" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Year" label-placement="top">
          <c-input-text v-model:value="year" :disabled="!license.needsYear" placeholder="2026" />
        </n-form-item>
      </n-gi>
    </n-grid>
  </c-card>

  <c-card v-if="output" mt-4 title="LICENSE">
    <TextareaCopyable :value="output" />
  </c-card>
</template>
