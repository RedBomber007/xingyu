<template>
  <div class="picker-mask" @click.self="$emit('close')">
    <div class="picker">
      <div class="picker__title">今天玩了多久？</div>

      <div class="field">
        <label>玩耍时长（分钟）</label>
        <input type="number" min="0" max="600" step="5" v-model.number="minutes" />
      </div>

      <div class="picker__actions">
        <button class="btn btn--ghost" @click="$emit('close')">取消</button>
        <button class="btn btn--primary" :disabled="!minutes" @click="save">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['save', 'close'])
const minutes = ref(30)

function save() {
  emit('save', { minutes: minutes.value })
}
</script>
