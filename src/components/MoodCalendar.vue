<template>
  <div class="mood-calendar">
    <div class="mood-calendar__head">
      <button class="mood-calendar__nav" @click="shift(-1)">‹</button>
      <div class="mood-calendar__title">{{ year }}年{{ month + 1 }}月</div>
      <button class="mood-calendar__nav" @click="shift(1)">›</button>
    </div>

    <div class="mood-calendar__week">
      <span v-for="w in ['日', '一', '二', '三', '四', '五', '六']" :key="w">{{ w }}</span>
    </div>

    <div class="mood-calendar__grid">
      <div
        v-for="cell in cells"
        :key="cell.key"
        class="mood-calendar__cell"
        :class="{ 'is-out': !cell.inMonth, 'is-today': cell.isToday }"
        :style="cellStyle(cell)"
        @click="pick(cell)"
      >
        <span class="mood-calendar__day">{{ cell.day }}</span>
        <span v-if="cell.mood" class="mood-calendar__emoji">{{ cell.mood.emoji }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getCalendarGrid, toKey } from '../utils/date'
import { moodById } from '../constants/moods'

const props = defineProps({
  moods: { type: Array, default: () => [] },
})

const emit = defineEmits(['pick'])

const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth())

function shift(n) {
  month.value += n
  if (month.value < 0) {
    month.value = 11
    year.value -= 1
  }
  if (month.value > 11) {
    month.value = 0
    year.value += 1
  }
}

// 同一天多条心情取最新一条
const moodMap = computed(() => {
  const map = {}
  for (const m of props.moods) map[m.date] = m
  return map
})

const cells = computed(() => {
  const todayKey = toKey()
  return getCalendarGrid(year.value, month.value).map((cell) => {
    const rec = moodMap.value[cell.key]
    const meta = rec ? moodById(rec.moodId) : null
    return {
      ...cell,
      day: cell.date.getDate(),
      isToday: cell.key === todayKey,
      mood: rec && meta ? { emoji: meta.emoji, color: meta.color, score: rec.score } : null,
    }
  })
})

function hexToRgba(hex, a) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

function cellStyle(cell) {
  if (cell.mood) {
    const alpha = 0.15 + (cell.mood.score / 10) * 0.6
    return { background: hexToRgba(cell.mood.color, alpha) }
  }
  return {}
}

function pick(cell) {
  if (cell.mood) emit('pick', cell)
}
</script>

<style scoped>
.mood-calendar__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.mood-calendar__title {
  font-size: 15px;
  font-weight: 600;
}

.mood-calendar__nav {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: var(--bg-grey);
  font-size: 18px;
  cursor: pointer;
  color: var(--text-primary);
}

.mood-calendar__week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.mood-calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.mood-calendar__cell {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s;
}

.mood-calendar__cell:active {
  transform: scale(0.92);
}

.mood-calendar__cell.is-out {
  opacity: 0.25;
}

.mood-calendar__cell.is-today {
  box-shadow: inset 0 0 0 2px var(--color-primary);
}

.mood-calendar__day {
  position: absolute;
  top: 3px;
  left: 5px;
  font-size: 11px;
  color: var(--text-secondary);
}

.mood-calendar__emoji {
  font-size: 20px;
}
</style>
