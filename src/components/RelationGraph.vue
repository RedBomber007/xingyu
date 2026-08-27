<template>
  <div>
    <EChart v-if="hasActive" :option="option" height="220px" />
    <div v-else class="relation-empty">还没有和家人的互动记录，去联系人详情里记一条吧～</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import EChart from './EChart.vue'

const props = defineProps({
  contacts: { type: Array, default: () => [] },
})

// 有互动记录（健康/心情/趣事）的联系人
const active = computed(() =>
  props.contacts.filter(
    (c) => (c.health?.length || 0) + (c.mood?.length || 0) + (c.funStories?.length || 0) > 0,
  ),
)

const hasActive = computed(() => active.value.length > 0)

const option = computed(() => ({
  tooltip: {},
  series: [
    {
      type: 'graph',
      layout: 'force',
      data: [
        { name: '妹妹', symbolSize: 46, itemStyle: { color: '#FF9A76' } },
        ...active.value.map((c) => ({
          name: c.name,
          symbolSize: 34,
          itemStyle: { color: '#679B9B' },
        })),
      ],
      links: active.value.map((c) => ({ source: '妹妹', target: c.name })),
      roam: false,
      force: { repulsion: 130, edgeLength: 70 },
      label: { show: true, position: 'bottom', fontSize: 12, color: '#4a4a4a' },
      lineStyle: { color: '#ddd', width: 2 },
      emphasis: { focus: 'adjacency' },
    },
  ],
}))
</script>

<style scoped>
.relation-empty {
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
  padding: var(--space-md) 0;
}
</style>
