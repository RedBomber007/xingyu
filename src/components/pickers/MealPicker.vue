<template>
  <div class="picker-mask" @click.self="$emit('close')">
    <div class="picker">
      <div class="picker__title">今天吃了哪几顿？</div>

      <div class="meal-grid">
        <button
          v-for="m in meals"
          :key="m.key"
          class="meal-grid__item"
          :class="{ active: selected.includes(m.key) }"
          @click="toggle(m.key)"
        >
          <span class="meal-grid__icon">{{ m.icon }}</span>
          <span>{{ m.label }}</span>
        </button>
      </div>

      <div class="picker__actions">
        <button class="btn btn--ghost" @click="$emit('close')">取消</button>
        <button class="btn btn--primary" :disabled="selected.length === 0" @click="save">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['save', 'close'])

const meals = [
  { key: 'breakfast', icon: '🌅', label: '早餐' },
  { key: 'lunch', icon: '☀️', label: '午餐' },
  { key: 'dinner', icon: '🌙', label: '晚餐' },
]

const selected = ref([])

function toggle(key) {
  const i = selected.value.indexOf(key)
  if (i >= 0) selected.value.splice(i, 1)
  else selected.value.push(key)
}

function save() {
  emit('save', { meals: [...selected.value] })
}
</script>

<style scoped>
.meal-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.meal-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 14px 0;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  background: var(--bg-grey);
  cursor: pointer;
  font-size: 14px;
}

.meal-grid__item.active {
  border-color: var(--color-primary);
  background: #fff2ec;
}

.meal-grid__icon {
  font-size: 26px;
}
</style>
