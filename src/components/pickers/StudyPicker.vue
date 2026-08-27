<template>
  <div class="picker-mask" @click.self="$emit('close')">
    <div class="picker">
      <div class="picker__title">记录学习</div>

      <div class="field">
        <label>学科</label>
        <select v-model="subject">
          <option v-for="s in SUBJECTS" :key="s.name" :value="s.name">{{ s.name }}</option>
        </select>
      </div>

      <div class="field">
        <label>时长（分钟）</label>
        <input type="number" min="1" max="600" step="5" v-model.number="duration" />
      </div>

      <div class="field">
        <label>学了什么</label>
        <textarea v-model="content" placeholder="今天学了什么内容…"></textarea>
      </div>

      <div class="field">
        <label>一句话收获</label>
        <input v-model="gain" placeholder="比如：我搞懂了数轴" />
      </div>

      <div class="picker__actions">
        <button class="btn btn--ghost" @click="$emit('close')">取消</button>
        <button class="btn btn--primary" :disabled="!duration" @click="save">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { SUBJECTS } from '../../constants/subjects'

const props = defineProps({
  initialDuration: { type: Number, default: 30 },
})

const emit = defineEmits(['save', 'close'])
const subject = ref('数学')
const duration = ref(props.initialDuration)
const content = ref('')
const gain = ref('')

function save() {
  emit('save', {
    subject: subject.value,
    duration: duration.value,
    content: content.value,
    gain: gain.value,
  })
}
</script>
