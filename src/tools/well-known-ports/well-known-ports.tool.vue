<script setup lang="ts">
import { WELL_KNOWN_PORTS, searchPorts } from './well-known-ports.service';

const query = ref('');
const filtered = computed(() => searchPorts(query.value));
</script>

<template>
  <c-card>
    <c-input-text
      v-model:value="query"
      placeholder="Filter by port number, service name, or description..."
      clearable
      raw-text
    />
    <div mt-2 text-sm op-60>
      Showing <strong>{{ filtered.length }}</strong> of {{ WELL_KNOWN_PORTS.length }} entries.
    </div>
  </c-card>

  <c-card mt-4>
    <n-table size="small" :bordered="false" :single-line="false" striped>
      <thead>
        <tr>
          <th style="width: 90px">
            Port
          </th>
          <th style="width: 100px">
            Protocol
          </th>
          <th style="width: 25%">
            Service
          </th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in filtered" :key="`${p.port}-${p.protocol}-${p.service}`">
          <td font-mono>
            {{ p.port }}
          </td>
          <td>{{ p.protocol }}</td>
          <td font-mono>
            {{ p.service }}
          </td>
          <td>{{ p.description }}</td>
        </tr>
      </tbody>
    </n-table>
  </c-card>
</template>
