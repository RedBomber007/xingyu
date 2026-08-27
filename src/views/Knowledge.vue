<template>
  <div class="knowledge">
    <!-- 三大分类 Tab -->
    <div class="cat-tabs">
      <button
        v-for="c in categories"
        :key="c.key"
        class="cat-tabs__item"
        :class="{ active: activeCat === c.key }"
        @click="activeCat = c.key"
      >
        {{ c.icon }} {{ c.label }}
      </button>
    </div>

    <!-- 学科学习 -->
    <div v-if="activeCat === 'study'" class="cat-panel">
      <section class="card">
        <h2 class="section-title">📊 学科掌握度</h2>
        <div v-for="s in subjectProgress" :key="s.name" class="subject-progress">
          <span class="subject-progress__name">{{ s.name }}</span>
          <div class="subject-progress__bar">
            <div class="subject-progress__fill" :style="{ width: s.percent + '%', background: s.color }"></div>
          </div>
          <span class="subject-progress__num">{{ s.lit }}/{{ s.total }}</span>
        </div>
      </section>

      <section class="card">
        <h2 class="section-title">🌳 知识树</h2>
        <div v-for="node in knowledgeTree" :key="node.subject + node.grade" class="tree-node">
          <div class="tree-node__subject">{{ node.subject }} · {{ node.grade }}</div>
          <div v-for="ch in node.chapters" :key="ch.name" class="tree-chapter">
            <div class="tree-chapter__name">{{ ch.name }}</div>
            <div v-for="p in ch.points" :key="p.id" class="tree-point">
              <button
                class="tree-point__star"
                :style="{ color: starLevel(mastery[p.id]).color }"
                :title="starLevel(mastery[p.id]).name + '（点击切换）'"
                @click="cycleStar(p.id)"
              >
                {{ starLevel(mastery[p.id]).emoji }}
              </button>
              <div class="tree-point__info">
                <div class="tree-point__name">{{ p.name }}</div>
                <div class="tree-point__tip">{{ p.tip }}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!knowledgeTree.length" class="empty">知识树还没录入，去「我的 → 管理员模式」添加吧～</div>
      </section>

      <section class="card">
        <h2 class="section-title">⏱️ 学习计时器</h2>
        <div class="timer">
          <div class="timer__display">{{ timerDisplay }}</div>
          <div class="timer__actions">
            <button v-if="!timerRunning" class="btn btn--primary" @click="startTimer">开始</button>
            <button v-else class="btn btn--ghost" @click="pauseTimer">暂停</button>
            <button class="btn btn--ghost" :disabled="timerSeconds === 0" @click="stopTimer">结束</button>
          </div>
        </div>
      </section>

      <section class="card">
        <h2 class="section-title">📚 学习日志</h2>
        <button class="btn btn--primary add-btn" @click="showLogForm = true">＋ 新增学习日志</button>
        <div v-for="l in studyLogs" :key="l.id" class="log-item">
          <div class="log-item__head">
            <span class="log-item__subject" :style="{ color: subjectColor(l.subject) }">{{ l.subject }}</span>
            <span class="log-item__duration">{{ l.duration }} 分钟</span>
          </div>
          <div v-if="l.content" class="log-item__content">{{ l.content }}</div>
          <div v-if="l.gain" class="log-item__gain">💡 {{ l.gain }}</div>
        </div>
        <div v-if="!studyLogs.length" class="empty">还没有学习日志，开始记一条吧～</div>
      </section>
    </div>

    <!-- 常识科普 -->
    <div v-else-if="activeCat === 'fact'" class="cat-panel">
      <section class="card">
        <h2 class="section-title">❄️ 冷知识收藏夹</h2>
        <div v-for="f in favorites" :key="f.id" class="fact-item">
          <div class="fact-item__title">{{ f.title }}</div>
          <div class="fact-item__content">{{ f.content }}</div>
        </div>
        <div v-if="!favorites.length" class="empty">还没有收藏的冷知识，去客厅收藏吧～</div>
      </section>
    </div>

    <!-- 技能学习 -->
    <div v-else class="cat-panel">
      <section class="card">
        <h2 class="section-title">🌟 技能清单</h2>
        <button class="btn btn--primary add-btn" @click="showSkillForm = true">＋ 新增技能</button>
        <div v-for="s in skills" :key="s.id" class="skill-item">
          <span class="skill-item__icon">🌟</span>
          <div>
            <div class="skill-item__name">{{ s.title }}</div>
            <div v-if="s.description" class="skill-item__desc">{{ s.description }}</div>
          </div>
        </div>
        <div v-if="!skills.length" class="empty">还没有记录技能，学会新本领就来记一条吧～</div>
      </section>
    </div>

    <!-- 学习日志表单（复用 StudyPicker） -->
    <StudyPicker
      v-if="showLogForm"
      :initial-duration="pendingDuration"
      @save="onStudySave"
      @close="showLogForm = false"
    />

    <!-- 技能表单 -->
    <div v-if="showSkillForm" class="picker-mask" @click.self="showSkillForm = false">
      <div class="picker">
        <div class="picker__title">新增技能</div>
        <div class="field">
          <label>技能名称</label>
          <input v-model="skillTitle" placeholder="比如：我会骑自行车了" />
        </div>
        <div class="field">
          <label>描述（可选）</label>
          <textarea v-model="skillDesc" placeholder="简单说说…"></textarea>
        </div>
        <div class="picker__actions">
          <button class="btn btn--ghost" @click="showSkillForm = false">取消</button>
          <button class="btn btn--primary" :disabled="!skillTitle.trim()" @click="saveSkill">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useKnowledgeStore } from '../stores/knowledge'
import { useDiaryStore } from '../stores/diary'
import { useConfigStore } from '../stores/config'
import { masteryProgress } from '../utils/stats'
import { toKey } from '../utils/date'
import { SUBJECTS, subjectColor } from '../constants/subjects'
import StudyPicker from '../components/pickers/StudyPicker.vue'

const knowledgeStore = useKnowledgeStore()
const diaryStore = useDiaryStore()
const configStore = useConfigStore()

const activeCat = ref('study')
const showLogForm = ref(false)
const showSkillForm = ref(false)
const mastery = ref({})
const pendingDuration = ref(30)
const skillTitle = ref('')
const skillDesc = ref('')

onMounted(async () => {
  await Promise.all([knowledgeStore.init(), diaryStore.init(), configStore.init()])
  mastery.value = { ...(configStore.get('mastery') || {}) }
})

const categories = [
  { key: 'study', icon: '📚', label: '学科学习' },
  { key: 'fact', icon: '❄️', label: '常识科普' },
  { key: 'skill', icon: '🌟', label: '技能学习' },
]

const knowledgeTree = computed(() => configStore.get('knowledgeTree') || [])

const starLevels = [
  { emoji: '⚪', name: '未知', color: '#c9c2b8' },
  { emoji: '🟡', name: '了解', color: '#FFD93D' },
  { emoji: '🟢', name: '掌握', color: '#4ECDC4' },
  { emoji: '🔵', name: '可教', color: '#81D4FA' },
]

function starLevel(level) {
  return starLevels[level] || starLevels[0]
}

function cycleStar(pointId) {
  const cur = mastery.value[pointId] || 0
  mastery.value[pointId] = (cur + 1) % 4
  configStore.set('mastery', { ...mastery.value })
}

const subjectProgress = computed(() => {
  const tree = knowledgeTree.value
  return SUBJECTS.map((s) => {
    const p = masteryProgress(tree, mastery.value, s.name)
    return { name: s.name, color: s.color, lit: p.lit, total: p.total, percent: p.percent }
  })
})

const studyLogs = computed(() => [...knowledgeStore.logs].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)))
const favorites = computed(() => knowledgeStore.favorites)

const skills = computed(() => {
  const fromDiary = diaryStore.entries
    .filter((e) => e.type === 'skill')
    .map((e) => ({ id: 'd' + e.id, title: e.content, description: '' }))
  const fromKnowledge = knowledgeStore.skills.map((s) => ({
    id: 'k' + s.id,
    title: s.title || s.content,
    description: s.description || '',
  }))
  return [...fromDiary, ...fromKnowledge]
})

// —— 计时器 ——
const timerSeconds = ref(0)
const timerRunning = ref(false)
let timerInterval = null

const timerDisplay = computed(() => {
  const h = Math.floor(timerSeconds.value / 3600)
  const m = Math.floor((timerSeconds.value % 3600) / 60)
  const s = timerSeconds.value % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
})

function startTimer() {
  timerRunning.value = true
  timerInterval = setInterval(() => {
    timerSeconds.value += 1
  }, 1000)
}

function pauseTimer() {
  timerRunning.value = false
  if (timerInterval) clearInterval(timerInterval)
}

function stopTimer() {
  pauseTimer()
  pendingDuration.value = Math.max(1, Math.round(timerSeconds.value / 60))
  timerSeconds.value = 0
  showLogForm.value = true
}

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval)
})

// —— 保存 ——
async function onStudySave({ subject, duration, content, gain }) {
  await knowledgeStore.addItem({ category: 'study', subject, duration, content, gain, date: toKey() })
  showLogForm.value = false
}

async function saveSkill() {
  await knowledgeStore.addItem({ category: 'skill', title: skillTitle.value.trim(), description: skillDesc.value.trim() })
  showSkillForm.value = false
  skillTitle.value = ''
  skillDesc.value = ''
}
</script>

<style scoped>
.knowledge {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.cat-tabs {
  display: flex;
  gap: var(--space-sm);
}

.cat-tabs__item {
  flex: 1;
  padding: 10px 0;
  border: none;
  border-radius: var(--radius-md);
  background: #fff;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
}

.cat-tabs__item.active {
  background: var(--color-primary);
  color: #fff;
}

.cat-panel {
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

.subject-progress {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.subject-progress__name {
  width: 36px;
  font-size: 14px;
}

.subject-progress__bar {
  flex: 1;
  height: 12px;
  background: var(--bg-grey);
  border-radius: 6px;
  overflow: hidden;
}

.subject-progress__fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s;
}

.subject-progress__num {
  font-size: 12px;
  color: var(--text-secondary);
}

.tree-node__subject {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: var(--space-sm);
}

.tree-chapter__name {
  font-size: 13px;
  color: var(--text-secondary);
  margin: var(--space-sm) 0;
}

.tree-point {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-warm);
  margin-bottom: 6px;
}

.tree-point__star {
  font-size: 20px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 2px;
  line-height: 1;
}

.tree-point__name {
  font-size: 14px;
  font-weight: 500;
}

.tree-point__tip {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.timer {
  text-align: center;
}

.timer__display {
  font-size: 40px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  margin-bottom: var(--space-md);
}

.timer__actions {
  display: flex;
  gap: var(--space-sm);
}

.add-btn {
  margin-bottom: var(--space-sm);
}

.log-item {
  padding: 10px 0;
  border-bottom: 1px solid #f5f2ee;
}

.log-item__head {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.log-item__subject {
  font-weight: 600;
  font-size: 14px;
}

.log-item__duration {
  font-size: 12px;
  color: var(--text-secondary);
}

.log-item__content {
  font-size: 14px;
  margin-top: 4px;
}

.log-item__gain {
  font-size: 13px;
  color: #f39c12;
  margin-top: 4px;
}

.fact-item {
  padding: 10px 0;
  border-bottom: 1px solid #f5f2ee;
}

.fact-item__title {
  font-weight: 600;
  font-size: 14px;
}

.fact-item__content {
  font-size: 14px;
  color: var(--text-primary);
  margin-top: 4px;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 10px 0;
  border-bottom: 1px solid #f5f2ee;
}

.skill-item__icon {
  font-size: 20px;
}

.skill-item__name {
  font-weight: 600;
  font-size: 14px;
}

.skill-item__desc {
  font-size: 13px;
  color: var(--text-secondary);
}

.empty {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  padding: var(--space-md) 0;
}
</style>
