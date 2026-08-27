<template>
  <div class="growth-tree">
    <svg viewBox="0 0 200 260" class="growth-tree__svg">
      <!-- 树冠（同心圆 = 年轮） -->
      <g>
        <circle v-for="(r, i) in rings" :key="i" cx="100" cy="95" :r="r" :fill="ringFill(i)" />
      </g>

      <!-- 果实（身高记录） -->
      <g>
        <circle
          v-for="(f, i) in fruits"
          :key="'f' + i"
          :cx="f.x"
          :cy="f.y"
          r="6"
          fill="#FF6B6B"
          stroke="#fff"
          stroke-width="1.5"
        />
      </g>

      <!-- 树干 -->
      <rect x="85" y="172" width="30" height="72" rx="8" fill="#C9A27E" />

      <!-- 里程碑刻痕 -->
      <g>
        <line
          v-for="(m, i) in marks"
          :key="'m' + i"
          :x1="87"
          :x2="113"
          :y1="m"
          :y2="m"
          stroke="#8C6A4A"
          stroke-width="3"
          stroke-linecap="round"
        />
      </g>
    </svg>

    <div class="growth-tree__legend">
      <span>🍎 身高 {{ fruitCount }} 条</span>
      <span>🏆 里程碑 {{ milestoneCount }} 个</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  fruitCount: { type: Number, default: 0 },
  milestoneCount: { type: Number, default: 0 },
})

const rings = [78, 58, 38]

function ringFill(i) {
  return i % 2 === 0 ? '#A8E6CF' : '#C9EBD8'
}

const fruits = computed(() => {
  const n = props.fruitCount
  if (!n) return []
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2
    const radius = 30 + (i % 3) * 22
    return {
      x: Math.round(100 + Math.cos(angle) * radius),
      y: Math.round(95 + Math.sin(angle) * radius),
    }
  })
})

const marks = computed(() => {
  const n = Math.min(props.milestoneCount, 6)
  if (n <= 0) return []
  const start = 185
  const end = 232
  return Array.from({ length: n }, (_, i) => start + (i / (n - 1)) * (end - start))
})
</script>

<style scoped>
.growth-tree {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.growth-tree__svg {
  width: 200px;
  height: 260px;
}

.growth-tree__legend {
  display: flex;
  gap: var(--space-md);
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
