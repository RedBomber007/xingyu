<template>
  <EChart :option="option" :height="height" />
</template>

<script setup>
import { computed } from 'vue'
import EChart from './EChart.vue'

const props = defineProps({
  type: { type: String, default: 'line' },
  xData: { type: Array, default: () => [] },
  series: { type: Array, default: () => [] },
  height: { type: String, default: '200px' },
  yName: { type: String, default: '' },
})

const option = computed(() => ({
  grid: { left: 40, right: 16, top: 28, bottom: 28 },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: props.xData,
    axisLine: { lineStyle: { color: '#ccc' } },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    name: props.yName,
    splitLine: { lineStyle: { color: '#eee' } },
  },
  series: props.series.map((s) => ({
    type: props.type,
    name: s.name,
    data: s.data,
    stack: s.stack ? 'total' : undefined,
    smooth: props.type === 'line',
    areaStyle: s.area ? {} : undefined,
    itemStyle: s.color ? { color: s.color } : undefined,
    lineStyle: s.color ? { color: s.color } : undefined,
    barMaxWidth: 26,
  })),
}))
</script>
