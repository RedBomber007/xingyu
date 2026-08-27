<template>
  <div class="clover" :class="{ 'clover--full': isFull }">
    <svg viewBox="0 0 200 200" class="clover__svg">
      <g v-for="(petal, i) in petals" :key="petal.key" :transform="`rotate(${i * 90} 100 100)`">
        <circle cx="100" cy="58" r="36" fill="none" stroke="#f0edea" stroke-width="12" />
        <circle
          cx="100"
          cy="58"
          r="36"
          fill="none"
          :stroke="petal.color"
          stroke-width="12"
          stroke-linecap="round"
          :stroke-dasharray="`${progress(petal.key) * C} ${C}`"
          transform="rotate(-90 100 58)"
        />
        <text x="100" y="58" text-anchor="middle" dominant-baseline="central" class="clover__icon">
          {{ petal.icon }}
        </text>
      </g>
      <circle cx="100" cy="100" r="11" fill="#fff" stroke="#f0edea" stroke-width="2" />
    </svg>

    <div class="clover__labels">
      <span v-for="petal in petals" :key="petal.key" class="clover__label">
        {{ petal.icon }}{{ petal.label }} {{ Math.round(progress(petal.key) * 100) }}%
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  breakdown: {
    type: Object,
    default: () => ({ water: 0, sleep: 0, meal: 0, play: 0 }),
  },
})

const C = 2 * Math.PI * 36

const petals = [
  { key: 'water', icon: '💧', color: '#4ECDC4', label: '喝水' },
  { key: 'sleep', icon: '😴', color: '#FF6B6B', label: '睡眠' },
  { key: 'meal', icon: '🍽️', color: '#FFE66D', label: '三餐' },
  { key: 'play', icon: '🎮', color: '#A8E6CF', label: '玩耍' },
]

function progress(key) {
  return Math.min(1, Math.max(0, props.breakdown[key] || 0))
}

const isFull = computed(() => petals.every((p) => progress(p.key) >= 1))
</script>

<style scoped>
.clover {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.clover__svg {
  width: 200px;
  height: 200px;
}

.clover__icon {
  font-size: 16px;
}

.clover__labels {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
  justify-content: center;
}

.clover__label {
  font-size: 12px;
  color: var(--text-secondary);
}

.clover--full .clover__svg {
  animation: clover-glow 1.6s ease-in-out infinite;
}

@keyframes clover-glow {
  0%,
  100% {
    filter: drop-shadow(0 0 2px rgba(255, 230, 109, 0.4));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(255, 214, 89, 0.9));
    transform: scale(1.04);
  }
}
</style>
