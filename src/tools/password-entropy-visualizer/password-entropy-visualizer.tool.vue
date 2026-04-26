<script setup lang="ts">
import { useThemeVars } from 'naive-ui';
import { analyzePassword } from './password-entropy-visualizer.service';

const themeVars = useThemeVars();
const password = ref('');
const analysis = computed(() => analyzePassword(password.value));

const segmentColors: Record<string, string> = {
  Lowercase: '#5b8def',
  Uppercase: '#7c4dff',
  Digits: '#1abc9c',
  Symbols: '#f39c12',
  Whitespace: '#95a5a6',
  Unicode: '#e74c3c',
};

const entropyPercent = computed(() => Math.min(100, (analysis.value.entropyBits / 128) * 100));
const entropyStatus = computed(() => {
  const b = analysis.value.entropyBits;
  if (b < 28) {
    return { label: 'Very weak', color: themeVars.value.errorColor };
  }
  if (b < 50) {
    return { label: 'Weak', color: themeVars.value.warningColor };
  }
  if (b < 80) {
    return { label: 'Reasonable', color: themeVars.value.infoColor };
  }
  if (b < 128) {
    return { label: 'Strong', color: themeVars.value.successColor };
  }
  return { label: 'Very strong', color: themeVars.value.successColor };
});
</script>

<template>
  <c-card>
    <c-input-text
      v-model:value="password"
      type="password"
      placeholder="Enter a password to analyze..."
      autofocus
      raw-text
    />
  </c-card>

  <c-card mt-4 title="Entropy">
    <div mb-2 flex items-baseline justify-between gap-3>
      <div text-3xl font-bold>
        {{ analysis.entropyBits.toFixed(1) }} <span text-base op-60>bits</span>
      </div>
      <div font-bold :style="{ color: entropyStatus.color }">
        {{ entropyStatus.label }}
      </div>
    </div>
    <n-progress
      :percentage="entropyPercent"
      :color="entropyStatus.color"
      :show-indicator="false"
      :height="12"
    />
    <div mt-2 text-center text-sm op-60>
      Length {{ analysis.length }} × log₂({{ analysis.charsetSize || 0 }}) = {{ analysis.entropyBits.toFixed(2) }} bits
    </div>
  </c-card>

  <c-card mt-4 title="Character composition">
    <div v-if="analysis.length === 0" text-center op-60>
      Type a password above to see the breakdown.
    </div>
    <div v-else>
      <div class="composition-bar">
        <div
          v-for="seg in analysis.segments.filter(s => s.count > 0)"
          :key="seg.name"
          class="segment"
          :style="{ width: `${seg.fraction * 100}%`, background: segmentColors[seg.name] }"
          :title="`${seg.name}: ${seg.count} char(s)`"
        />
      </div>
      <div grid mt-3 gap-1 style="grid-template-columns: auto 1fr auto auto;">
        <template v-for="seg in analysis.segments.filter(s => s.count > 0)" :key="seg.name">
          <div class="legend-swatch" :style="{ background: segmentColors[seg.name] }" />
          <div>{{ seg.name }}</div>
          <div op-60>
            {{ seg.count }} char{{ seg.count === 1 ? '' : 's' }}
          </div>
          <div op-60>
            +{{ seg.size }} alphabet
          </div>
        </template>
      </div>
    </div>
  </c-card>

  <c-card mt-4 title="Estimated time to crack">
    <n-table size="small" :bordered="false" :single-line="false">
      <thead>
        <tr>
          <th>Attacker model</th>
          <th>Guesses / sec</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in analysis.crackTimes" :key="row.profile.name">
          <td>
            <div font-medium>
              {{ row.profile.name }}
            </div>
            <div text-xs op-60>
              {{ row.profile.description }}
            </div>
          </td>
          <td>{{ row.profile.guessesPerSecond.toExponential(0) }}</td>
          <td font-mono>
            {{ row.humanReadable }}
          </td>
        </tr>
      </tbody>
    </n-table>
    <div mt-3 text-xs op-60>
      Estimates assume the attacker knows the charset but does not exploit dictionary words or common patterns.
      Real-world cracking against weak passwords is typically much faster.
    </div>
  </c-card>
</template>

<style lang="less" scoped>
.composition-bar {
  display: flex;
  width: 100%;
  height: 24px;
  border-radius: 4px;
  overflow: hidden;

  .segment {
    height: 100%;
    transition: width 0.2s ease-in-out;
  }
}

.legend-swatch {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  align-self: center;
  margin-right: 6px;
}
</style>
