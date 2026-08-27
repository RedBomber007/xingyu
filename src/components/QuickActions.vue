<template>
  <div class="quick-actions">
    <button v-for="a in actions" :key="a.key" class="quick-actions__btn" @click="$emit(a.key)">
      <span class="quick-actions__icon">{{ a.icon }}</span>
      <span class="quick-actions__label">{{ a.label }}</span>
    </button>
  </div>
</template>

<script setup>
defineEmits(['mood', 'meal', 'water', 'sleep', 'play', 'study'])

const actions = [
  { key: 'mood', icon: '😊', label: '心情' },
  { key: 'meal', icon: '🍽️', label: '吃饭' },
  { key: 'water', icon: '💧', label: '喝水' },
  { key: 'sleep', icon: '😴', label: '睡觉' },
  { key: 'play', icon: '🎮', label: '玩耍' },
  { key: 'study', icon: '📚', label: '学习' },
]
</script>

<style scoped>
.quick-actions {
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 6px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-md);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
  z-index: 10;
}

.quick-actions__btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 6px 0;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
}

.quick-actions__btn:active {
  background: var(--bg-grey);
}

.quick-actions__icon {
  font-size: 22px;
}

.quick-actions__label {
  font-size: 11px;
  color: var(--text-secondary);
}
</style>
