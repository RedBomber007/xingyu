<template>
  <div class="app">
    <main class="app__content">
      <router-view />
    </main>
    <TabBar />
  </div>
</template>

<script setup>
import TabBar from './components/TabBar.vue'
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 480px;
  margin: 0 auto;
}

.app__content {
  flex: 1;
  overflow-y: auto;
}
</style>
