<template>
  <nav class="tab-bar">
    <router-link
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="tab-bar__item"
      active-class="tab-bar__item--active"
    >
      <span class="tab-bar__icon">{{ tab.icon }}</span>
      <span class="tab-bar__label">{{ tab.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
const tabs = [
  { path: '/living-room', icon: '🏠', label: '客厅' },
  { path: '/diary', icon: '🌱', label: '点滴' },
  { path: '/knowledge', icon: '🌌', label: '知识库' },
  { path: '/contacts', icon: '👤', label: '通讯录' },
  { path: '/profile', icon: '⚙️', label: '我的' },
]
</script>

<style scoped>
.tab-bar {
  display: flex;
  flex-shrink: 0;
  background: #ffffff;
  border-top: 1px solid var(--bg-grey);
  padding: var(--space-sm) 0 calc(var(--space-sm) + env(safe-area-inset-bottom));
}

.tab-bar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.tab-bar__icon {
  font-size: 22px;
  line-height: 1;
}

.tab-bar__label {
  font-size: 11px;
}

.tab-bar__item--active {
  color: var(--color-primary);
}
</style>
