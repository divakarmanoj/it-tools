<script setup lang="ts">
import {
  type RobotsGroup,
  buildRobotsTxt,
  buildSitemapXml,
  parseUrlList,
  validateRobotsTxt,
} from './robots-txt-and-sitemap-generator.service';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const tab = ref<'robots' | 'sitemap' | 'validate'>('robots');

// ----- robots.txt builder -----
const groups = ref<RobotsGroup[]>([
  { userAgent: '*', allow: [], disallow: ['/admin/', '/private/'], crawlDelay: null },
]);
const sitemaps = ref<string[]>(['https://example.com/sitemap.xml']);
const host = ref('');

function addGroup() {
  groups.value.push({ userAgent: '*', allow: [], disallow: [], crawlDelay: null });
}
function removeGroup(i: number) {
  groups.value.splice(i, 1);
}
function addLine(arr: string[]) {
  arr.push('');
}
function removeLine(arr: string[], i: number) {
  arr.splice(i, 1);
}
function addSitemap() {
  sitemaps.value.push('');
}
function removeSitemap(i: number) {
  sitemaps.value.splice(i, 1);
}

const robotsOutput = computed(() => buildRobotsTxt({
  groups: groups.value,
  sitemaps: sitemaps.value,
  host: host.value,
}));

// ----- robots.txt validator -----
const validatorInput = ref(`User-agent: *
Disallow: /admin/
Allow: /admin/public/

Sitemap: https://example.com/sitemap.xml`);
const validatorIssues = computed(() => validateRobotsTxt(validatorInput.value));

// ----- sitemap.xml generator -----
const sitemapInput = ref(`https://example.com/
https://example.com/about
https://example.com/contact`);
const defaultChangefreq = ref<'' | 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'>('');
const defaultPriority = ref<number | null>(null);

const sitemapResult = computed(() => parseUrlList(sitemapInput.value, {
  changefreq: defaultChangefreq.value || undefined,
  priority: defaultPriority.value ?? undefined,
}));
const sitemapXml = computed(() => buildSitemapXml(sitemapResult.value.entries));

const changefreqOpts = ['', 'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
  .map(v => ({ value: v, label: v || '— none —' }));
</script>

<template>
  <c-card>
    <n-tabs v-model:value="tab" type="line">
      <n-tab name="robots" tab="Build robots.txt" />
      <n-tab name="sitemap" tab="Generate sitemap.xml" />
      <n-tab name="validate" tab="Validate robots.txt" />
    </n-tabs>
  </c-card>

  <!-- ROBOTS BUILDER -->
  <template v-if="tab === 'robots'">
    <c-card v-for="(g, gi) in groups" :key="gi" mt-4 :title="`Group ${gi + 1}`">
      <n-form-item label="User-agent" label-placement="top">
        <c-input-text v-model:value="g.userAgent" placeholder="* or Googlebot" />
      </n-form-item>

      <n-form-item label="Allow paths" label-placement="top">
        <div w-full>
          <div v-for="(_, i) in g.allow" :key="i" mb-2 flex gap-2>
            <c-input-text v-model:value="g.allow[i]" placeholder="/path/" />
            <c-button @click="removeLine(g.allow, i)">
              ×
            </c-button>
          </div>
          <c-button @click="addLine(g.allow)">
            + Add allow
          </c-button>
        </div>
      </n-form-item>

      <n-form-item label="Disallow paths" label-placement="top">
        <div w-full>
          <div v-for="(_, i) in g.disallow" :key="i" mb-2 flex gap-2>
            <c-input-text v-model:value="g.disallow[i]" placeholder="/admin/" />
            <c-button @click="removeLine(g.disallow, i)">
              ×
            </c-button>
          </div>
          <c-button @click="addLine(g.disallow)">
            + Add disallow
          </c-button>
        </div>
      </n-form-item>

      <n-form-item label="Crawl-delay (seconds, optional)" label-placement="top">
        <n-input-number v-model:value="g.crawlDelay" min="0" placeholder="empty for none" />
      </n-form-item>

      <c-button v-if="groups.length > 1" type="error" @click="removeGroup(gi)">
        Remove group
      </c-button>
    </c-card>

    <c-card mt-4 title="Sitemaps & host">
      <n-form-item label="Sitemap URLs" label-placement="top">
        <div w-full>
          <div v-for="(_, i) in sitemaps" :key="i" mb-2 flex gap-2>
            <c-input-text v-model:value="sitemaps[i]" placeholder="https://example.com/sitemap.xml" />
            <c-button @click="removeSitemap(i)">
              ×
            </c-button>
          </div>
          <c-button @click="addSitemap">
            + Add sitemap
          </c-button>
        </div>
      </n-form-item>
      <n-form-item label="Host (optional, Yandex extension)" label-placement="top">
        <c-input-text v-model:value="host" placeholder="example.com" />
      </n-form-item>
    </c-card>

    <c-card mb-4 mt-4 flex gap-2>
      <c-button @click="addGroup">
        + Add user-agent group
      </c-button>
    </c-card>

    <c-card mt-4 title="robots.txt">
      <TextareaCopyable :value="robotsOutput" />
    </c-card>
  </template>

  <!-- SITEMAP GENERATOR -->
  <template v-if="tab === 'sitemap'">
    <c-card mt-4 title="URLs">
      <p mb-2 text-sm op-70>
        One per line. Optional CSV: <code>URL,lastmod,changefreq,priority</code>
      </p>
      <c-input-text
        v-model:value="sitemapInput"

        rows="10"

        raw-text autosize multiline monospace
      />
    </c-card>

    <c-card mt-4 title="Defaults">
      <n-grid :cols="2" :x-gap="12">
        <n-gi>
          <n-form-item label="Default changefreq" label-placement="top">
            <n-select v-model:value="defaultChangefreq" :options="changefreqOpts" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="Default priority (0.0–1.0)" label-placement="top">
            <n-input-number v-model:value="defaultPriority" :min="0" :max="1" :step="0.1" />
          </n-form-item>
        </n-gi>
      </n-grid>
    </c-card>

    <c-card v-if="sitemapResult.warnings.length" mt-4 title="Warnings">
      <ul>
        <li v-for="(w, i) in sitemapResult.warnings" :key="i">
          {{ w }}
        </li>
      </ul>
    </c-card>

    <c-card mt-4 title="sitemap.xml">
      <TextareaCopyable :value="sitemapXml" language="xml" />
    </c-card>
  </template>

  <!-- VALIDATOR -->
  <template v-if="tab === 'validate'">
    <c-card mt-4 title="Paste a robots.txt to check">
      <c-input-text
        v-model:value="validatorInput"
        multiline
        rows="10"
        monospace
        raw-text
        autosize
      />
    </c-card>
    <c-card mt-4 title="Issues">
      <p v-if="!validatorIssues.length" op-70>
        ✓ No issues detected.
      </p>
      <ul v-else>
        <li v-for="(iss, i) in validatorIssues" :key="i" mb-1>
          <n-tag size="small" :type="iss.level === 'error' ? 'error' : iss.level === 'warning' ? 'warning' : 'info'" mr-2>
            {{ iss.level }}
          </n-tag>
          <span v-if="iss.line">line {{ iss.line }} — </span>{{ iss.message }}
        </li>
      </ul>
    </c-card>
  </template>
</template>
