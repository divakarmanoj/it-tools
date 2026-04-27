<script setup lang="ts">
import { parseSpec, validate } from './openapi-viewer.service';

const sample = `openapi: 3.0.3
info:
  title: Petstore
  version: 1.0.0
  description: A tiny demo spec.
servers:
  - url: https://petstore.example/api
paths:
  /pets:
    get:
      operationId: listPets
      summary: List pets
      tags: [pets]
      parameters:
        - name: limit
          in: query
          schema: { type: integer }
      responses:
        '200':
          description: ok
    post:
      operationId: createPet
      summary: Create a pet
      tags: [pets]
      responses:
        '201': { description: created }
  /pets/{id}:
    get:
      operationId: getPet
      summary: Get a pet
      tags: [pets]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        '200': { description: ok }
        '404': { description: not found }
components:
  schemas:
    Pet:
      type: object
      required: [id, name]
      properties:
        id: { type: string }
        name: { type: string }
        tag: { type: string }
`;

const text = ref(sample);
const parsed = computed(() => parseSpec(text.value));
const issues = computed(() => validate(parsed.value));
const errorCount = computed(() => issues.value.filter(i => i.level === 'error').length);
const warnCount = computed(() => issues.value.filter(i => i.level === 'warning').length);

function methodTone(m: string) {
  return {
    GET: 'success',
    POST: 'info',
    PUT: 'warning',
    PATCH: 'warning',
    DELETE: 'error',
    OPTIONS: 'default',
    HEAD: 'default',
    TRACE: 'default',
  }[m] ?? 'default';
}
</script>

<template>
  <c-card title="OpenAPI / Swagger spec (YAML or JSON)">
    <c-input-text
      v-model:value="text"
      multiline
      rows="14"
      monospace
      raw-text
      autosize
      placeholder="Paste your spec..."
    />
  </c-card>

  <c-card mt-4 title="Validation">
    <div mb-2>
      <n-tag :type="errorCount === 0 ? 'success' : 'error'" mr-2>
        {{ errorCount }} errors
      </n-tag>
      <n-tag :type="warnCount === 0 ? 'success' : 'warning'" mr-2>
        {{ warnCount }} warnings
      </n-tag>
      <n-tag size="small">
        Detected: {{ parsed.version }}
      </n-tag>
    </div>
    <ul v-if="issues.length">
      <li v-for="(iss, i) in issues" :key="i">
        <n-tag size="small" :type="iss.level === 'error' ? 'error' : 'warning'" mr-2>
          {{ iss.level }}
        </n-tag>
        <code>{{ iss.path }}</code> — {{ iss.message }}
      </li>
    </ul>
    <p v-else op-70>
      ✓ All structural checks passed.
    </p>
  </c-card>

  <c-card v-if="parsed.title" mt-4 :title="`${parsed.title} (v${parsed.versionString})`">
    <p v-if="parsed.description" op-80>
      {{ parsed.description }}
    </p>
    <div v-if="parsed.servers.length" mt-2>
      <strong>Servers:</strong>
      <ul mt-1>
        <li v-for="s in parsed.servers" :key="s">
          <code>{{ s }}</code>
        </li>
      </ul>
    </div>
  </c-card>

  <c-card v-if="parsed.endpoints.length" mt-4 :title="`Endpoints (${parsed.endpoints.length})`">
    <n-collapse>
      <n-collapse-item v-for="(e, i) in parsed.endpoints" :key="i" :name="i">
        <template #header>
          <n-tag :type="methodTone(e.method) as any" size="small" mr-2>
            {{ e.method }}
          </n-tag>
          <code>{{ e.path }}</code>
          <span ml-3 op-70>{{ e.summary }}</span>
        </template>
        <p v-if="e.description" op-80>
          {{ e.description }}
        </p>
        <p v-if="e.operationId">
          <strong>operationId:</strong> <code>{{ e.operationId }}</code>
        </p>
        <p v-if="e.tags.length">
          <strong>tags:</strong>
          <n-tag v-for="t in e.tags" :key="t" size="small" ml-1>
            {{ t }}
          </n-tag>
        </p>
        <div v-if="e.parameters.length" mt-2>
          <strong>Parameters</strong>
          <n-table size="small" striped mt-1>
            <thead><tr><th>name</th><th>in</th><th>type</th><th>required</th><th>description</th></tr></thead>
            <tbody>
              <tr v-for="p in e.parameters" :key="`${p.in}-${p.name}`">
                <td><code>{{ p.name }}</code></td>
                <td>{{ p.in }}</td>
                <td>{{ p.type ?? '—' }}</td>
                <td>{{ p.required ? 'yes' : 'no' }}</td>
                <td>{{ p.description ?? '' }}</td>
              </tr>
            </tbody>
          </n-table>
        </div>
        <div v-if="e.responses.length" mt-2>
          <strong>Responses</strong>
          <ul mt-1>
            <li v-for="r in e.responses" :key="r.code">
              <code>{{ r.code }}</code> — {{ r.description ?? '' }}
            </li>
          </ul>
        </div>
      </n-collapse-item>
    </n-collapse>
  </c-card>

  <c-card v-if="parsed.schemas.length" mt-4 :title="`Schemas (${parsed.schemas.length})`">
    <n-collapse>
      <n-collapse-item v-for="s in parsed.schemas" :key="s.name" :name="s.name">
        <template #header>
          <code>{{ s.name }}</code>
          <span ml-3 op-70>{{ s.type ?? '' }}</span>
        </template>
        <n-table size="small" striped>
          <thead><tr><th>property</th><th>type</th><th>required</th><th>description</th></tr></thead>
          <tbody>
            <tr v-for="p in s.properties" :key="p.name">
              <td><code>{{ p.name }}</code></td>
              <td>{{ p.type ?? '—' }}</td>
              <td>{{ s.required.includes(p.name) ? 'yes' : 'no' }}</td>
              <td>{{ p.description ?? '' }}</td>
            </tr>
          </tbody>
        </n-table>
      </n-collapse-item>
    </n-collapse>
  </c-card>
</template>
