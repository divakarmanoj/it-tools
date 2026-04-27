<script setup lang="ts">
import { COLOR_PRESETS, POPULAR_LOGOS, STYLE_OPTIONS, buildBadgeUrl, buildHtml, buildMarkdown } from './shields-badge-builder.service';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const label = ref('build');
const message = ref('passing');
const color = ref('brightgreen');
const labelColor = ref('');
const style = ref<'flat' | 'flat-square' | 'plastic' | 'for-the-badge' | 'social'>('flat');
const logo = ref('');
const logoColor = ref('');
const link = ref('');

const opts = computed(() => ({
  label: label.value,
  message: message.value,
  color: color.value,
  labelColor: labelColor.value || undefined,
  style: style.value,
  logo: logo.value || undefined,
  logoColor: logoColor.value || undefined,
  link: link.value || undefined,
}));

const url = computed(() => buildBadgeUrl(opts.value));
const md = computed(() => buildMarkdown(opts.value));
const html = computed(() => buildHtml(opts.value));

const styleOpts = STYLE_OPTIONS.map(s => ({ value: s, label: s }));
const colorOpts = COLOR_PRESETS.map(c => ({ value: c, label: c }));
const logoOpts = [{ value: '', label: '— none —' }, ...POPULAR_LOGOS.map(l => ({ value: l, label: l }))];
</script>

<template>
  <c-card title="Badge content">
    <n-grid :cols="2" :x-gap="12">
      <n-gi>
        <n-form-item label="Label (left)" label-placement="top">
          <c-input-text v-model:value="label" placeholder="build" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Message (right)" label-placement="top">
          <c-input-text v-model:value="message" placeholder="passing" />
        </n-form-item>
      </n-gi>
    </n-grid>
  </c-card>

  <c-card mt-4 title="Style">
    <n-grid :cols="2" :x-gap="12" :y-gap="8">
      <n-gi>
        <n-form-item label="Color (right)" label-placement="top">
          <n-select v-model:value="color" :options="colorOpts" filterable tag />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Label color (left, optional)" label-placement="top">
          <c-input-text v-model:value="labelColor" placeholder="grey or hex" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Style" label-placement="top">
          <n-select v-model:value="style" :options="styleOpts" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Link URL (optional)" label-placement="top">
          <c-input-text v-model:value="link" placeholder="https://example.com" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Logo (simple-icons slug)" label-placement="top">
          <n-select v-model:value="logo" :options="logoOpts" filterable tag />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="Logo color (optional)" label-placement="top">
          <c-input-text v-model:value="logoColor" placeholder="white" />
        </n-form-item>
      </n-gi>
    </n-grid>
  </c-card>

  <c-card mt-4 title="Preview">
    <img :src="url" :alt="`${label}: ${message}`">
  </c-card>

  <c-card mt-4 title="URL">
    <TextareaCopyable :value="url" />
  </c-card>

  <c-card mt-4 title="Markdown">
    <TextareaCopyable :value="md" />
  </c-card>

  <c-card mt-4 title="HTML">
    <TextareaCopyable :value="html" />
  </c-card>
</template>
