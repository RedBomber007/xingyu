<template>
  <EChart :option="option" :height="height" />
</template>

<script setup>
import { computed } from 'vue'
import EChart from './EChart.vue'

const props = defineProps({
  // [{ name, duration, color }] duration 为分钟
  subjects: { type: Array, default: () => [] },
  height: { type: String, default: '200px' },
})

const option = computed(() => {
  const max = Math.max(1, ...props.subjects.map((s) => s.duration))
  return {
    grid: { left: 0, right: 0, top: 10, bottom: 40 },
    xAxis: { show: false, min: 0, max: 100 },
    yAxis: { show: false, min: 0, max: 100 },
    tooltip: {
      trigger: 'item',
      formatter: (p) => `${p.data.name}<br/>学习 ${(p.data.duration / 60).toFixed(1)} 小时`,
    },
    series: [
      {
        type: 'scatter',
        data: props.subjects.map((s, i) => ({
          value: [18 + i * 32, 48],
          name: s.name,
          duration: s.duration,
          symbolSize: 26 + (s.duration / max) * 54,
          itemStyle: { color: s.color, opacity: 0.85 },
          label: { show: true, formatter: '{b}', position: 'bottom', fontSize: 13, color: '#4a4a4a' },
        })),
      },
    ],
  }
})
</script>
