<template>
  <div class="diary">
    <!-- 身体成长曲线 -->
    <section class="card">
      <h2 class="section-title">📏 身体成长曲线</h2>
      <div class="body-tabs">
        <button
          v-for="t in bodyTypes"
          :key="t.key"
          class="body-tabs__item"
          :class="{ active: activeBody === t.key }"
          @click="activeBody = t.key"
        >
          {{ t.label }}
        </button>
      </div>
      <TrendChart
        v-if="bodyChart"
        type="line"
        :x-data="bodyChart.xData"
        :series="bodyChart.series"
        height="200px"
      />
      <div v-else class="empty">还没有{{ activeBodyLabel }}数据，点下面记录吧～</div>
      <button class="btn btn--primary record-btn" @click="showBodyForm = true">＋ 记录身体数据</button>
    </section>

    <!-- 写点滴 -->
    <button class="btn btn--primary write-btn" @click="showEntryForm = true">➕ 写点滴</button>

    <!-- 时光时间线 -->
    <section class="card">
      <h2 class="section-title">📖 时光时间线</h2>
      <div v-for="[date, entries] in grouped" :key="date" class="tl-group">
        <div class="tl-date">
          {{ date }}
          <span v-if="entries.some((e) => e.type === 'milestone')" class="tl-flag">🏆</span>
        </div>
        <div
          v-for="e in entries"
          :key="e.id"
          class="tl-item"
          :style="{ borderLeftColor: typeMeta(e.type)?.color ?? '#ddd' }"
        >
          <div class="tl-item__head">
            <span class="tl-item__icon">{{ itemIcon(e) }}</span>
            <span class="tl-item__type">{{ typeMeta(e.type)?.label ?? '记录' }}</span>
          </div>
          <div class="tl-item__content">{{ itemText(e) }}</div>
        </div>
      </div>
      <div v-if="!diaryStore.entries.length" class="empty">还没有点滴记录，点上面写一条吧～</div>
    </section>

    <!-- 写点滴面板 -->
    <div v-if="showEntryForm" class="picker-mask" @click.self="showEntryForm = false">
      <div class="picker">
        <div class="picker__title">写点滴</div>
        <div class="type-grid">
          <button
            v-for="t in entryTypes"
            :key="t.key"
            class="type-grid__item"
            :class="{ active: entryType === t.key }"
            @click="entryType = t.key"
          >
            <span class="type-grid__icon">{{ t.icon }}</span>
            <span>{{ t.label }}</span>
          </button>
        </div>
        <div class="field">
          <textarea v-model="entryContent" placeholder="写点什么…"></textarea>
        </div>
        <div class="picker__actions">
          <button class="btn btn--ghost" @click="showEntryForm = false">取消</button>
          <button class="btn btn--primary" :disabled="!entryContent.trim()" @click="saveEntry">保存</button>
        </div>
      </div>
    </div>

    <!-- 身体数据面板 -->
    <div v-if="showBodyForm" class="picker-mask" @click.self="showBodyForm = false">
      <div class="picker">
        <div class="picker__title">记录身体数据</div>
        <div class="field">
          <label>类型</label>
          <select v-model="bodyType">
            <option v-for="t in bodyTypes" :key="t.key" :value="t.key">
              {{ t.label }}（{{ t.unit || '—' }}）
            </option>
          </select>
        </div>
        <div class="field">
          <label>数值</label>
          <input type="number" step="0.1" v-model.number="bodyValue" placeholder="输入数值" />
        </div>
        <div class="picker__actions">
          <button class="btn btn--ghost" @click="showBodyForm = false">取消</button>
          <button class="btn btn--primary" :disabled="!bodyValue" @click="saveBody">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDiaryStore } from '../stores/diary'
import TrendChart from '../components/TrendChart.vue'

const diaryStore = useDiaryStore()

const showEntryForm = ref(false)
const showBodyForm = ref(false)
const entryType = ref('insight')
const entryContent = ref('')
const activeBody = ref('height')
const bodyType = ref('height')
const bodyValue = ref(null)

onMounted(async () => {
  await diaryStore.init()
})

const entryTypes = [
  { key: 'insight', icon: '👀', label: '见闻感悟', color: '#FF9A76' },
  { key: 'inspiration', icon: '💡', label: '灵感便签', color: '#81D4FA' },
  { key: 'skill', icon: '🌟', label: '技能解锁', color: '#A8E6CF' },
  { key: 'milestone', icon: '🏆', label: '里程碑', color: '#FFD93D' },
]

const bodyTypes = [
  { key: 'height', label: '身高', unit: 'cm' },
  { key: 'weight', label: '体重', unit: 'kg' },
  { key: 'vision', label: '视力', unit: '' },
]

function typeMeta(type) {
  if (type === 'body') return { icon: '📏', label: '身体数据', color: '#679B9B' }
  return entryTypes.find((t) => t.key === type) || null
}

function itemText(e) {
  if (e.type === 'body') {
    const t = bodyTypes.find((b) => b.key === e.bodyType)
    return `${t?.label ?? e.bodyType} ${e.value}${t?.unit ?? ''}`
  }
  return e.content
}

function itemIcon(e) {
  return typeMeta(e.type)?.icon ?? '📝'
}

const grouped = computed(() => diaryStore.grouped)

const activeBodyLabel = computed(() => bodyTypes.find((t) => t.key === activeBody.value)?.label ?? '')

const bodyChart = computed(() => {
  const list = diaryStore.entries
    .filter((e) => e.type === 'body' && e.bodyType === activeBody.value)
    .sort((a, b) => (a.date > b.date ? 1 : -1))
  if (!list.length) return null
  const meta = bodyTypes.find((t) => t.key === activeBody.value)
  return {
    xData: list.map((e) => e.date),
    series: [{ name: meta?.label ?? '', data: list.map((e) => e.value), color: '#679B9B' }],
  }
})

async function saveEntry() {
  await diaryStore.addEntry({ type: entryType.value, content: entryContent.value.trim() })
  showEntryForm.value = false
  entryContent.value = ''
}

async function saveBody() {
  await diaryStore.addEntry({ type: 'body', bodyType: bodyType.value, value: bodyValue.value })
  showBodyForm.value = false
  bodyValue.value = null
}
</script>

<style scoped>
.diary {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.card {
  background: #fff;
  border-radius: var(--radius-md);
  padding: var(--space-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--space-md);
}

.body-tabs {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.body-tabs__item {
  padding: 6px 16px;
  border: none;
  border-radius: 20px;
  background: var(--bg-grey);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
}

.body-tabs__item.active {
  background: var(--color-primary);
  color: #fff;
}

.record-btn {
  margin-top: var(--space-sm);
}

.write-btn {
  align-self: flex-start;
}

.empty {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  padding: var(--space-md) 0;
}

.tl-group {
  margin-bottom: var(--space-md);
}

.tl-date {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: var(--space-sm);
}

.tl-flag {
  margin-left: 4px;
}

.tl-item {
  border-left: 3px solid #ddd;
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-sm);
  background: var(--bg-warm);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.tl-item__head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.tl-item__icon {
  font-size: 16px;
}

.tl-item__type {
  font-size: 12px;
  color: var(--text-secondary);
}

.tl-item__content {
  font-size: 15px;
  line-height: 1.5;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: var(--space-md);
}

.type-grid__item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 0;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  background: var(--bg-grey);
  cursor: pointer;
  font-size: 14px;
}

.type-grid__item.active {
  border-color: var(--color-primary);
  background: #fff2ec;
}

.type-grid__icon {
  font-size: 18px;
}
</style>
