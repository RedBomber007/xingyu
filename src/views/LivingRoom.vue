<template>
  <div class="living-room">
    <!-- 第一屏：今日状态卡片 -->
    <section class="card overview">
      <div class="overview__greeting">{{ greeting }}，{{ todayMood ? todayMoodMeta?.emoji : '🌱' }}</div>
      <p class="overview__summary">{{ summary }}</p>
      <div class="overview__stats">
        <div class="stat">
          <span class="stat__num">{{ todayMood ? todayMood.score : '—' }}</span>
          <span class="stat__label">心情值</span>
        </div>
        <div class="stat">
          <span class="stat__num">{{ healthScoreToday }}%</span>
          <span class="stat__label">健康完成</span>
        </div>
        <div class="stat">
          <span class="stat__num">{{ studyHours }}</span>
          <span class="stat__label">学习(h)</span>
        </div>
      </div>
      <div class="overview__streak">🔥 已连续记录 {{ streak }} 天</div>
    </section>

    <!-- 情绪分析 -->
    <section class="card">
      <h2 class="section-title">🌈 情绪彩虹月历</h2>
      <MoodCalendar :moods="moodStore.moods" @pick="onPickDay" />
      <TrendChart
        type="line"
        :x-data="weekMoodTrend.xData"
        :series="[{ name: '心情', data: weekMoodTrend.data, color: '#FF9A76' }]"
        y-name="心情值"
      />
    </section>

    <!-- 健康分析 -->
    <section class="card">
      <h2 class="section-title">🍀 四叶草健康环</h2>
      <CloverHealth :breakdown="cloverBreakdown" />
    </section>

    <!-- 学习分析 -->
    <section class="card">
      <h2 class="section-title">📚 学习分析</h2>
      <SubjectBubbles :subjects="subjectBubbles" />
      <TrendChart
        type="bar"
        :x-data="weekStudyTrend.xData"
        :series="weekStudyTrend.series"
        y-name="小时"
        height="220px"
      />
    </section>

    <!-- 每日一问 & 冷知识 -->
    <section class="card">
      <h2 class="section-title">✨ 今日推荐</h2>
      <div class="daily daily--question" @click="answerQuestion">
        <span class="daily__tag">每日一问</span>
        <p class="daily__text">{{ dailyQuestion }}</p>
        <span class="daily__hint">点击回答</span>
      </div>
      <div class="daily">
        <span class="daily__tag">冷知识</span>
        <p class="daily__title">{{ dailyFact ? dailyFact.title : '暂无' }}</p>
        <p class="daily__text">{{ dailyFact ? dailyFact.content : '' }}</p>
        <button v-if="dailyFact" class="btn btn--primary daily__btn" @click="collectFact">收藏 ⭐</button>
      </div>
    </section>

    <!-- 最近动态 -->
    <section class="card">
      <h2 class="section-title">📌 最近动态</h2>
      <ul class="activity">
        <li v-for="(a, i) in recentActivity" :key="i" class="activity__item">
          <span class="activity__icon">{{ a.icon }}</span>
          <span class="activity__text">{{ a.text }}</span>
          <span class="activity__time">{{ a.timeText }}</span>
        </li>
        <li v-if="!recentActivity.length" class="activity__empty">还没有记录，从下面的快捷打卡开始吧～</li>
      </ul>
    </section>

    <!-- 快捷打卡入口（悬浮） -->
    <QuickActions
      @mood="activePicker = 'mood'"
      @meal="activePicker = 'meal'"
      @water="onWater"
      @sleep="activePicker = 'sleep'"
      @play="activePicker = 'play'"
      @study="activePicker = 'study'"
    />

    <!-- 打卡弹层 -->
    <MoodPicker v-if="activePicker === 'mood'" @save="onMoodSave" @close="activePicker = null" />
    <MealPicker v-if="activePicker === 'meal'" @save="onMealSave" @close="activePicker = null" />
    <SleepPicker v-if="activePicker === 'sleep'" @save="onSleepSave" @close="activePicker = null" />
    <PlayPicker v-if="activePicker === 'play'" @save="onPlaySave" @close="activePicker = null" />
    <StudyPicker v-if="activePicker === 'study'" @save="onStudySave" @close="activePicker = null" />
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
import { toKey, getWeekDates, dayOfYear } from '../utils/date'
import { calcStreak, avgMood, healthBreakdown, healthScore, studyDuration } from '../utils/stats'
import { moodById } from '../constants/moods'
import { SUBJECTS } from '../constants/subjects'
import MoodCalendar from '../components/MoodCalendar.vue'
import TrendChart from '../components/TrendChart.vue'
import CloverHealth from '../components/CloverHealth.vue'
import SubjectBubbles from '../components/SubjectBubbles.vue'
import QuickActions from '../components/QuickActions.vue'
import MoodPicker from '../components/pickers/MoodPicker.vue'
import MealPicker from '../components/pickers/MealPicker.vue'
import SleepPicker from '../components/pickers/SleepPicker.vue'
import PlayPicker from '../components/pickers/PlayPicker.vue'
import StudyPicker from '../components/pickers/StudyPicker.vue'

const moodStore = useMoodStore()
const healthStore = useHealthStore()
const knowledgeStore = useKnowledgeStore()
const diaryStore = useDiaryStore()
const contactsStore = useContactsStore()
const configStore = useConfigStore()

const activePicker = ref(null)

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

// —— 今日状态 ——
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const todayMood = computed(() => moodStore.todayMood)
const todayMoodMeta = computed(() => (todayMood.value ? moodById(todayMood.value.moodId) : null))
const streak = computed(() => calcStreak(moodStore.recordDates))

const healthScoreToday = computed(() => {
  const key = toKey()
  const recs = healthStore.records.filter((r) => r.date === key)
  return Math.round(healthScore(recs) * 100)
})

const studyToday = computed(() => {
  const key = toKey()
  const logs = knowledgeStore.logs.filter((l) => (l.date || toKey(new Date(l.createdAt))) === key)
  return studyDuration(logs)
})

const studyHours = computed(() => (studyToday.value / 60).toFixed(1))

const summary = computed(() => {
  if (!todayMood.value) return '今天还没记心情，点下面记一个吧～'
  const parts = [`今天心情「${todayMoodMeta.value?.name}」${todayMoodMeta.value?.emoji}`]
  if (healthScoreToday.value >= 60) parts.push('健康完成度不错 💧')
  if (studyToday.value > 0) parts.push(`学了 ${studyHours.value} 小时 📚`)
  return parts.join('，') + '。'
})

// —— 情绪 ——
const weekMoodTrend = computed(() => {
  const week = getWeekDates()
  const byDay = {}
  for (const m of moodStore.moods) {
    if (!byDay[m.date]) byDay[m.date] = []
    byDay[m.date].push(m.score)
  }
  const xData = week.map((d) => '周' + '日一二三四五六'[d.getDay()])
  const data = week.map((d) => {
    const scores = byDay[toKey(d)] || []
    return scores.length ? Math.round(avgMood(scores.map((s) => ({ score: s }))) * 10) / 10 : 0
  })
  return { xData, data }
})

// —— 健康 ——
const cloverBreakdown = computed(() => {
  const keys = getWeekDates().map(toKey)
  const recs = healthStore.records.filter((r) => keys.includes(r.date))
  return healthBreakdown(recs)
})

// —— 学习 ——
const subjectBubbles = computed(() =>
  SUBJECTS.map((s) => ({
    name: s.name,
    color: s.color,
    duration: studyDuration(knowledgeStore.logs.filter((l) => l.subject === s.name)),
  })),
)

const weekStudyTrend = computed(() => {
  const week = getWeekDates()
  const xData = week.map((d) => '周' + '日一二三四五六'[d.getDay()])
  const series = SUBJECTS.map((s) => {
    const data = week.map((d) => {
      const key = toKey(d)
      const logs = knowledgeStore.logs.filter(
        (l) => l.subject === s.name && (l.date || toKey(new Date(l.createdAt))) === key,
      )
      return Math.round((studyDuration(logs) / 60) * 10) / 10
    })
    return { name: s.name, data, color: s.color, stack: true }
  })
  return { xData, series }
})

// —— 每日一问 & 冷知识 ——
const dailyQuestion = computed(() => {
  const list = configStore.get('dailyQuestions') || []
  return list.length ? list[dayOfYear() % list.length] : ''
})

const dailyFact = computed(() => {
  const list = configStore.get('dailyFacts') || []
  return list.length ? list[dayOfYear() % list.length] : null
})

// —— 最近动态 ——
const HEALTH_META = {
  water: { icon: '💧', label: '喝水' },
  sleep: { icon: '😴', label: '睡眠' },
  meal: { icon: '🍽️', label: '吃饭' },
  play: { icon: '🎮', label: '玩耍' },
}

const recentActivity = computed(() => {
  const items = []
  for (const m of moodStore.moods) {
    items.push({ icon: '😊', text: `心情 ${moodById(m.moodId)?.emoji ?? '🙂'} ${m.score} 分`, time: m.createdAt })
  }
  for (const r of healthStore.records) {
    const meta = HEALTH_META[r.type] || { icon: '💚', label: r.type }
    items.push({ icon: meta.icon, text: `${meta.label} ${r.value}`, time: r.createdAt })
  }
  for (const e of diaryStore.entries) {
    items.push({ icon: '📝', text: `点滴：${e.content}`, time: e.createdAt })
  }
  for (const k of knowledgeStore.logs) {
    items.push({ icon: '📚', text: `学习 ${k.subject} ${k.duration} 分钟`, time: k.createdAt })
  }
  return items
    .sort((a, b) => (a.time < b.time ? 1 : -1))
    .slice(0, 5)
    .map((a) => ({ ...a, timeText: (a.time || '').slice(5, 10) }))
})

// —— 打卡保存 ——
async function onMoodSave({ moodId, score }) {
  await moodStore.addMood({ moodId, score })
  activePicker.value = null
}

async function onMealSave({ meals }) {
  for (const m of meals) await healthStore.addRecord({ type: 'meal', value: 1 })
  activePicker.value = null
}

async function onWater() {
  await healthStore.addRecord({ type: 'water', value: 1 })
}

async function onSleepSave({ hours }) {
  await healthStore.addRecord({ type: 'sleep', value: hours })
  activePicker.value = null
}

async function onPlaySave({ minutes }) {
  await healthStore.addRecord({ type: 'play', value: minutes })
  activePicker.value = null
}

async function onStudySave({ subject, duration, content, gain }) {
  await knowledgeStore.addItem({ category: 'study', subject, duration, content, gain, date: toKey() })
  activePicker.value = null
}

function onPickDay(cell) {
  if (cell.mood) {
    window.alert(`${cell.key}\n心情：${cell.mood.emoji} ${cell.mood.score} 分`)
  }
}

function answerQuestion() {
  const answer = window.prompt(dailyQuestion.value || '今天有什么想记的吗？', '')
  if (answer && answer.trim()) {
    diaryStore.addEntry({ type: 'insight', content: `每日一问：${answer.trim()}` })
  }
}

function collectFact() {
  if (dailyFact.value) {
    knowledgeStore.addItem({ category: 'fact', title: dailyFact.value.title, content: dailyFact.value.content })
  }
}
</script>

<style scoped>
.living-room {
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

.overview__greeting {
  font-size: 15px;
  color: var(--text-secondary);
}

.overview__summary {
  font-size: 18px;
  font-weight: 600;
  margin: 6px 0 var(--space-md);
  line-height: 1.4;
}

.overview__stats {
  display: flex;
  gap: var(--space-md);
}

.stat {
  flex: 1;
  text-align: center;
  background: var(--bg-warm);
  border-radius: var(--radius-sm);
  padding: 12px 0;
}

.stat__num {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-primary);
}

.stat__label {
  font-size: 12px;
  color: var(--text-secondary);
}

.overview__streak {
  margin-top: var(--space-md);
  font-size: 13px;
  color: #f39c12;
}

.daily {
  border: 1px solid #f0edea;
  border-radius: var(--radius-sm);
  padding: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.daily--question {
  cursor: pointer;
}

.daily__tag {
  display: inline-block;
  font-size: 11px;
  background: var(--bg-warm);
  color: var(--color-primary);
  border-radius: 6px;
  padding: 2px 8px;
  margin-bottom: 6px;
}

.daily__title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.daily__text {
  font-size: 14px;
  color: var(--text-primary);
}

.daily__hint {
  font-size: 12px;
  color: var(--text-secondary);
}

.daily__btn {
  margin-top: var(--space-sm);
}

.activity {
  list-style: none;
}

.activity__item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 8px 0;
  border-bottom: 1px solid #f5f2ee;
  font-size: 14px;
}

.activity__item:last-child {
  border-bottom: none;
}

.activity__text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity__time {
  font-size: 12px;
  color: var(--text-secondary);
}

.activity__empty {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  padding: var(--space-md) 0;
}
</style>
