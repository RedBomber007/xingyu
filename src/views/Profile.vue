<template>
  <div class="profile">
    <!-- 周报（导出长图的目标） -->
    <section ref="reportEl" class="card report">
      <h2 class="section-title">📊 本周周报</h2>
      <div class="report-stats">
        <div class="rstat">
          <span class="rstat__num">{{ report.avgMood }}</span>
          <span class="rstat__label">平均心情</span>
        </div>
        <div class="rstat">
          <span class="rstat__num">{{ report.studyHours }}h</span>
          <span class="rstat__label">学习时长</span>
        </div>
        <div class="rstat">
          <span class="rstat__num">{{ report.checkinRate }}%</span>
          <span class="rstat__label">打卡率</span>
        </div>
        <div class="rstat">
          <span class="rstat__num">{{ report.newKnowledge }}</span>
          <span class="rstat__label">新增知识</span>
        </div>
      </div>
    </section>

    <!-- 关键词云 -->
    <section class="card">
      <h2 class="section-title">☁️ 本周关键词云</h2>
      <EChart v-if="wordcloudData.length" :option="wordcloudOption" height="200px" />
      <div v-else class="empty">本周还没有文字记录，写点点滴就有关键词啦～</div>
    </section>

    <!-- 成长年轮树 -->
    <section class="card">
      <h2 class="section-title">🌳 成长年轮树</h2>
      <GrowthTree :fruit-count="fruitCount" :milestone-count="milestoneCount" />
    </section>

    <!-- 导出 -->
    <section class="card">
      <h2 class="section-title">📤 数据导出（只含汇总，不含日记原文）</h2>
      <div class="export-actions">
        <button class="btn btn--primary" @click="exportJSON">导出汇总 JSON</button>
        <button class="btn btn--ghost" @click="exportImage">导出汇总长图</button>
      </div>
    </section>

    <!-- 管理员模式入口 -->
    <section class="card">
      <h2 class="section-title">🔐 管理员模式</h2>
      <button class="btn btn--ghost" @click="openAdmin">进入管理员模式</button>
    </section>

    <!-- 管理员弹层 -->
    <div v-if="showAdmin" class="picker-mask" @click.self="closeAdmin">
      <div class="picker admin">
        <div class="picker__title">管理员模式</div>

        <!-- 密码校验 -->
        <div v-if="!adminAuthed">
          <div class="field">
            <label>输入管理员密码</label>
            <input type="password" v-model="adminPwd" @keyup.enter="checkAdmin" />
          </div>
          <p v-if="adminError" class="admin-error">密码不对哦，再试试</p>
          <div class="picker__actions">
            <button class="btn btn--ghost" @click="closeAdmin">取消</button>
            <button class="btn btn--primary" @click="checkAdmin">进入</button>
          </div>
        </div>

        <!-- 管理员功能 -->
        <div v-else class="admin-panel">
          <div class="admin-section">
            <h3>💌 悄悄话（写给妹妹）</h3>
            <div class="field">
              <textarea v-model="whisperText" placeholder="写给妹妹的鼓励…"></textarea>
            </div>
            <button class="btn btn--primary" @click="saveWhisper">保存悄悄话</button>
          </div>

          <div class="admin-section">
            <h3>❄️ 新增冷知识</h3>
            <div class="field">
              <label>标题</label>
              <input v-model="factTitle" placeholder="比如：为什么天空是蓝色的？" />
            </div>
            <div class="field">
              <label>内容</label>
              <textarea v-model="factContent" placeholder="解释…"></textarea>
            </div>
            <button class="btn btn--primary" :disabled="!factTitle.trim() || !factContent.trim()" @click="addFact">
              添加到冷知识
            </button>
          </div>

          <div class="admin-section">
            <h3>📊 汇总（只读）</h3>
            <div class="admin-summary">
              <p>平均心情：{{ report.avgMood }}</p>
              <p>本周学习：{{ report.studyHours }} 小时</p>
              <p>打卡率：{{ report.checkinRate }}%</p>
              <p>新增知识：{{ report.newKnowledge }}</p>
              <p>联系人：{{ contactsStore.contacts.length }} 人</p>
              <p>点滴记录：{{ diaryStore.entries.length }} 条</p>
            </div>
          </div>

          <button class="btn btn--ghost" @click="closeAdmin">退出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMoodStore } from '../stores/mood'
import { useHealthStore } from '../stores/health'
import { useKnowledgeStore } from '../stores/knowledge'
import { useDiaryStore } from '../stores/diary'
import { useContactsStore } from '../stores/contacts'
import { useConfigStore } from '../stores/config'
import { toKey, getWeekDates } from '../utils/date'
import { avgMood, studyDuration, wordFrequency } from '../utils/stats'
import { exportJSON, exportImage } from '../utils/export'
import EChart from '../components/EChart.vue'
import GrowthTree from '../components/GrowthTree.vue'
import 'echarts-wordcloud'

const moodStore = useMoodStore()
const healthStore = useHealthStore()
const knowledgeStore = useKnowledgeStore()
const diaryStore = useDiaryStore()
const contactsStore = useContactsStore()
const configStore = useConfigStore()

const reportEl = ref(null)

const showAdmin = ref(false)
const adminAuthed = ref(false)
const adminPwd = ref('')
const adminError = ref(false)
const whisperText = ref('')
const factTitle = ref('')
const factContent = ref('')

onMounted(async () => {
  await Promise.all([
    moodStore.init(),
    healthStore.init(),
    knowledgeStore.init(),
    diaryStore.init(),
    contactsStore.init(),
    configStore.init(),
  ])
})

// —— 周报 ——
const report = computed(() => {
  const keys = getWeekDates().map(toKey)

  const weekMoods = moodStore.moods.filter((m) => keys.includes(m.date))
  const avg = Math.round(avgMood(weekMoods) * 10) / 10

  const weekLogs = knowledgeStore.logs.filter((l) => keys.includes(l.date || toKey(new Date(l.createdAt))))
  const studyHours = Math.round((studyDuration(weekLogs) / 60) * 10) / 10

  const activeDays = new Set(
    [...moodStore.moods, ...healthStore.records].filter((r) => keys.includes(r.date)).map((r) => r.date),
  )
  const checkinRate = Math.round((activeDays.size / 7) * 100)

  const favCount = knowledgeStore.favorites.filter((f) => keys.includes(toKey(new Date(f.createdAt)))).length
  const newKnowledge = weekLogs.length + favCount

  return { avgMood: avg || '—', studyHours, checkinRate, newKnowledge }
})

// —— 关键词云 ——
const wordcloudData = computed(() => {
  const keys = getWeekDates().map(toKey)
  const texts = []
  for (const e of diaryStore.entries) {
    if (keys.includes(e.date || toKey(new Date(e.createdAt)))) texts.push(e.content)
  }
  for (const l of knowledgeStore.logs) {
    if (keys.includes(l.date || toKey(new Date(l.createdAt)))) texts.push(`${l.content} ${l.gain}`)
  }
  const freq = wordFrequency(texts)
  return Object.entries(freq)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 30)
})

const wordcloudOption = computed(() => {
  const colors = ['#FF9A76', '#679B9B', '#C6A2E8', '#4ECDC4', '#FFD93D', '#FF8A80']
  return {
    series: [
      {
        type: 'wordCloud',
        shape: 'circle',
        sizeRange: [14, 40],
        gridSize: 6,
        textStyle: {
          color: () => colors[Math.floor(Math.random() * colors.length)],
        },
        data: wordcloudData.value,
      },
    ],
  }
})

// —— 成长年轮树 ——
const fruitCount = computed(() => diaryStore.entries.filter((e) => e.type === 'body' && e.bodyType === 'height').length)
const milestoneCount = computed(() => diaryStore.entries.filter((e) => e.type === 'milestone').length)

// —— 导出 ——
function buildSummary() {
  return {
    导出日期: toKey(),
    本周周报: { ...report.value },
    学科进度: [],
    联系人数量: contactsStore.contacts.length,
    点滴记录数: diaryStore.entries.length,
    知识条目数: knowledgeStore.items.length,
  }
}

function exportJSONHandler() {
  exportJSON(buildSummary(), `星屿周报_${toKey()}.json`)
}

function exportImageHandler() {
  if (reportEl.value) exportImage(reportEl.value, `星屿周报_${toKey()}.png`)
}

// —— 管理员模式 ——
function openAdmin() {
  showAdmin.value = true
  adminAuthed.value = false
  adminPwd.value = ''
  adminError.value = false
}

function closeAdmin() {
  showAdmin.value = false
  adminAuthed.value = false
}

function checkAdmin() {
  if (adminPwd.value === configStore.get('adminPassword')) {
    adminAuthed.value = true
    adminError.value = false
    const brother = contactsStore.contacts.find((c) => c.name === '哥哥')
    whisperText.value = brother?.whisper || ''
  } else {
    adminError.value = true
  }
}

async function saveWhisper() {
  const brother = contactsStore.contacts.find((c) => c.name === '哥哥')
  if (brother) {
    await contactsStore.updateContact(brother.id, { whisper: whisperText.value })
  }
  window.alert('悄悄话已保存 ✅')
}

async function addFact() {
  const list = [...(configStore.get('dailyFacts') || [])]
  list.push({ title: factTitle.value.trim(), content: factContent.value.trim() })
  await configStore.set('dailyFacts', list)
  factTitle.value = ''
  factContent.value = ''
  window.alert('冷知识已添加 ✅')
}
</script>

<style scoped>
.profile {
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

.report-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.rstat {
  text-align: center;
  background: var(--bg-warm);
  border-radius: var(--radius-sm);
  padding: 14px 0;
}

.rstat__num {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
}

.rstat__label {
  font-size: 12px;
  color: var(--text-secondary);
}

.export-actions {
  display: flex;
  gap: var(--space-sm);
}

.admin {
  max-height: 80vh;
  overflow-y: auto;
}

.admin-section {
  padding: var(--space-sm) 0;
  border-bottom: 1px solid #f0edea;
  margin-bottom: var(--space-sm);
}

.admin-section h3 {
  font-size: 15px;
  margin-bottom: var(--space-sm);
}

.admin-error {
  color: #ff6b6b;
  font-size: 13px;
  margin: var(--space-sm) 0;
}

.admin-summary {
  font-size: 14px;
  line-height: 1.8;
}

.empty {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  padding: var(--space-md) 0;
}
</style>
