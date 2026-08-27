<template>
  <div class="picker-mask" @click.self="$emit('close')">
    <div class="picker">
      <div class="picker__title">今天心情怎么样？</div>

      <div class="mood-grid">
        <button
          v-for="m in MOODS"
          :key="m.id"
          class="mood-grid__item"
          :class="{ active: moodId === m.id }"
          :style="moodId === m.id ? { background: m.color + '33' } : {}"
          @click="moodId = m.id"
        >
          <span class="mood-grid__emoji">{{ m.emoji }}</span>
          <span class="mood-grid__name">{{ m.name }}</span>
        </button>
      </div>

      <div class="intensity">
        <span class="intensity__label">强度</span>
        <input type="range" min="1" max="10" v-model.number="score" />
        <span class="intensity__value">{{ score }}</span>
      </div>

      <div class="picker__actions">
        <button class="btn btn--ghost" @click="$emit('close')">取消</button>
        <button class="btn btn--primary" :disabled="!moodId" @click="save">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { MOODS } from '../../constants/moods'

const emit = defineEmits(['save', 'close'])
const moodId = ref(null)
const score = ref(5)

function save() {
  emit('save', { moodId: moodId.value, score: score.value })
}
</script>

<style scoped>
.mood-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: var(--space-md);
}

.mood-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 0;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  background: var(--bg-grey);
  cursor: pointer;
}

.mood-grid__item.active {
  border-color: var(--color-primary);
}

.mood-grid__emoji {
  font-size: 26px;
}

.mood-grid__name {
  font-size: 11px;
  color: var(--text-secondary);
}

.intensity {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.intensity__label {
  font-size: 13px;
  color: var(--text-secondary);
}

.intensity input[type='range'] {
  flex: 1;
}

.intensity__value {
  font-weight: 600;
  min-width: 20px;
}
</style>
