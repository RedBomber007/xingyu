<template>
  <div class="picker-mask" @click.self="$emit('close')">
    <div class="picker">
      <div class="picker__title">昨晚睡得好吗？</div>

      <div class="field">
        <label>睡了多久（小时）</label>
        <input type="number" min="0" max="24" step="0.5" v-model.number="hours" />
      </div>

      <div class="field">
        <label>睡眠质量</label>
        <select v-model="quality">
          <option v-for="q in ['很好', '还行', '一般', '不好']" :key="q" :value="q">{{ q }}</option>
        </select>
      </div>

      <div class="picker__actions">
        <button class="btn btn--ghost" @click="$emit('close')">取消</button>
        <button class="btn btn--primary" :disabled="!hours" @click="save">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['save', 'close'])
const hours = ref(8)
const quality = ref('还行')

function save() {
  emit('save', { hours: hours.value, quality: quality.value })
}
</script>
