<script setup lang="ts">
import { type TypeSummary, formatGraphql, summarizeSdl } from './graphql-formatter.service';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const tab = ref<'format' | 'schema'>('format');

// ----- format tab -----
const queryInput = ref('query  GetUser ($id : ID!){ user(id:$id){ id   name email posts{title} }}');
const formatted = ref('');
const formatError = ref('');

async function reformat() {
  const r = await formatGraphql(queryInput.value);
  formatted.value = r.formatted;
  formatError.value = r.error ?? '';
}
watch(queryInput, reformat, { immediate: true });

// ----- schema tab -----
const sdlInput = ref(`"""A blog user."""
type User {
  id: ID!
  name: String!
  email: String
  posts(limit: Int = 10): [Post!]!
}

type Post {
  id: ID!
  title: String!
  body: String
  author: User!
}

enum Role { ADMIN USER GUEST }
union SearchResult = User | Post
input PostInput { title: String!, body: String }
scalar DateTime
`);
const sdlTypes = ref<TypeSummary[]>([]);
const sdlError = ref('');

async function reparseSdl() {
  const r = await summarizeSdl(sdlInput.value);
  sdlTypes.value = r.types;
  sdlError.value = r.error ?? '';
}
watch(sdlInput, reparseSdl, { immediate: true });

function kindTone(k: string) {
  return {
    Object: 'success',
    Interface: 'info',
    Union: 'warning',
    Enum: 'info',
    InputObject: 'warning',
    Scalar: 'default',
  }[k] ?? 'default';
}
</script>

<template>
  <c-card>
    <n-tabs v-model:value="tab" type="line">
      <n-tab name="format" tab="Format query / SDL" />
      <n-tab name="schema" tab="Schema viewer (SDL)" />
    </n-tabs>
  </c-card>

  <!-- FORMAT -->
  <template v-if="tab === 'format'">
    <c-card mt-4 title="Input">
      <c-input-text v-model:value="queryInput" multiline rows="10" monospace raw-text autosize />
    </c-card>
    <c-card v-if="formatError" mt-4 title="Parse error">
      <pre style="color: var(--n-error-color); white-space: pre-wrap">{{ formatError }}</pre>
    </c-card>
    <c-card v-if="formatted" mt-4 title="Formatted">
      <TextareaCopyable :value="formatted" language="graphql" />
    </c-card>
  </template>

  <!-- SCHEMA -->
  <template v-if="tab === 'schema'">
    <c-card mt-4 title="Schema (SDL)">
      <c-input-text v-model:value="sdlInput" multiline rows="14" monospace raw-text autosize />
    </c-card>
    <c-card v-if="sdlError" mt-4 title="Parse error">
      <pre style="color: var(--n-error-color); white-space: pre-wrap">{{ sdlError }}</pre>
    </c-card>
    <c-card v-if="sdlTypes.length" mt-4 :title="`Types (${sdlTypes.length})`">
      <n-collapse>
        <n-collapse-item v-for="t in sdlTypes" :key="t.name" :name="t.name">
          <template #header>
            <n-tag :type="kindTone(t.kind) as any" size="small" mr-2>
              {{ t.kind }}
            </n-tag>
            <code>{{ t.name }}</code>
          </template>
          <p v-if="t.description" op-80>
            {{ t.description }}
          </p>
          <div v-if="t.values?.length">
            <strong>Values:</strong>
            <n-tag v-for="v in t.values" :key="v" size="small" ml-1>
              {{ v }}
            </n-tag>
          </div>
          <div v-if="t.members?.length">
            <strong>Members:</strong>
            <n-tag v-for="m in t.members" :key="m" size="small" ml-1>
              {{ m }}
            </n-tag>
          </div>
          <n-table v-if="t.fields.length" size="small" striped mt-2>
            <thead><tr><th>field</th><th>type</th><th>arguments</th></tr></thead>
            <tbody>
              <tr v-for="f in t.fields" :key="f.name">
                <td><code>{{ f.name }}</code></td>
                <td><code>{{ f.type }}</code></td>
                <td>
                  <span v-if="!f.args.length" op-50>—</span>
                  <span v-else>
                    <code v-for="a in f.args" :key="a.name" mr-2>{{ a.name }}: {{ a.type }}<span v-if="a.defaultValue"> = {{ a.defaultValue }}</span></code>
                  </span>
                </td>
              </tr>
            </tbody>
          </n-table>
        </n-collapse-item>
      </n-collapse>
    </c-card>
  </template>
</template>
