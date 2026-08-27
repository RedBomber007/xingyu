<template>
  <div class="contacts">
    <!-- 详情视图 -->
    <div v-if="selected" class="detail">
      <button class="back-btn" @click="selectedId = null">‹ 返回通讯录</button>

      <div class="detail__head">
        <span class="detail__avatar">{{ selected.avatar }}</span>
        <div>
          <div class="detail__name">{{ selected.name }}</div>
          <div class="detail__tag">{{ tagLabel(selected.tag) }}</div>
        </div>
      </div>

      <section class="card">
        <h2 class="section-title">个人信息</h2>
        <div v-if="selected.info" class="info-list">
          <div v-if="selected.info.birthday" class="info-item">
            <span class="info-item__label">生日</span>
            <span>{{ selected.info.birthday }} · {{ selected.info.zodiac }}</span>
          </div>
          <div v-if="selected.info.phone" class="info-item">
            <span class="info-item__label">电话</span>
            <span>{{ selected.info.phone }}</span>
          </div>
          <div v-if="selected.info.likes?.length" class="info-item">
            <span class="info-item__label">喜好</span>
            <span>{{ selected.info.likes.join('、') }}</span>
          </div>
          <div v-if="selected.info.catchphrase" class="info-item">
            <span class="info-item__label">口头禅</span>
            <span>{{ selected.info.catchphrase }}</span>
          </div>
        </div>
      </section>

      <section class="card">
        <h2 class="section-title">💚 健康观察</h2>
        <div v-for="(h, i) in selected.health" :key="i" class="note">{{ h.content }}</div>
        <div v-if="!selected.health?.length" class="empty">还没有记录</div>
      </section>

      <section class="card">
        <h2 class="section-title">😊 心情</h2>
        <div v-for="(m, i) in selected.mood" :key="i" class="note">
          {{ m.emoji }} {{ m.note }}
        </div>
        <div v-if="!selected.mood?.length" class="empty">还没有记录</div>
      </section>

      <section class="card">
        <h2 class="section-title">🎉 趣事</h2>
        <div v-for="(f, i) in selected.funStories" :key="i" class="note">{{ f.content }}</div>
        <div v-if="!selected.funStories?.length" class="empty">还没有记录</div>
      </section>

      <section v-if="selected.whisper" class="card whisper">
        <h2 class="section-title">💌 悄悄话</h2>
        <p class="whisper__text">{{ selected.whisper }}</p>
      </section>

      <div class="detail__actions">
        <button class="act-btn" @click="openInteract('health')">💚 记录健康</button>
        <button class="act-btn" @click="openInteract('mood')">😊 记录心情</button>
        <button class="act-btn" @click="openInteract('fun')">🎉 记录趣事</button>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-else class="list">
      <section class="card">
        <h2 class="section-title">🕸️ 关系网</h2>
        <RelationGraph :contacts="contactsStore.contacts" />
      </section>

      <div class="tag-tabs">
        <button
          v-for="t in tags"
          :key="t.key"
          class="tag-tabs__item"
          :class="{ active: activeTag === t.key }"
          @click="activeTag = t.key"
        >
          {{ t.label }}
        </button>
      </div>

      <section class="card">
        <div v-for="c in filteredContacts" :key="c.id" class="contact-item" @click="selectedId = c.id">
          <span class="contact-item__avatar">{{ c.avatar }}</span>
          <div class="contact-item__info">
            <div class="contact-item__name">{{ c.name }}</div>
            <div v-if="c.info?.catchphrase" class="contact-item__catchphrase">{{ c.info.catchphrase }}</div>
          </div>
        </div>
        <div v-if="!filteredContacts.length" class="empty">这个分组还没有联系人</div>
      </section>

      <button class="btn btn--primary add-btn" @click="showAdd = true">＋ 添加联系人</button>
    </div>

    <!-- 添加联系人弹层 -->
    <div v-if="showAdd" class="picker-mask" @click.self="showAdd = false">
      <div class="picker">
        <div class="picker__title">添加联系人</div>
        <div class="field">
          <label>姓名</label>
          <input v-model="newName" placeholder="输入姓名" />
        </div>
        <div class="field">
          <label>头像</label>
          <div class="avatar-grid">
            <button
              v-for="a in avatarOptions"
              :key="a"
              class="avatar-grid__item"
              :class="{ active: newAvatar === a }"
              @click="newAvatar = a"
            >
              {{ a }}
            </button>
          </div>
        </div>
        <div class="field">
          <label>分组</label>
          <select v-model="newTag">
            <option v-for="t in tags" :key="t.key" :value="t.key">{{ t.label }}</option>
          </select>
        </div>
        <div class="picker__actions">
          <button class="btn btn--ghost" @click="showAdd = false">取消</button>
          <button class="btn btn--primary" :disabled="!newName.trim()" @click="addContact">保存</button>
        </div>
      </div>
    </div>

    <!-- 互动记录弹层 -->
    <div v-if="interactType" class="picker-mask" @click.self="interactType = null">
      <div class="picker">
        <div class="picker__title">{{ interactTitle }}</div>

        <template v-if="interactType === 'mood'">
          <div class="mood-row">
            <button
              v-for="m in MOODS"
              :key="m.id"
              class="mood-row__item"
              :class="{ active: interactEmoji === m.emoji }"
              @click="interactEmoji = m.emoji"
            >
              {{ m.emoji }}
            </button>
          </div>
          <div class="field">
            <label>备注（可选）</label>
            <input v-model="interactNote" placeholder="说说为什么…" />
          </div>
        </template>

        <div v-else class="field">
          <label>{{ interactType === 'health' ? '观察到什么' : '发生了什么趣事' }}</label>
          <textarea v-model="interactContent" placeholder="写点什么…"></textarea>
        </div>

        <div class="picker__actions">
          <button class="btn btn--ghost" @click="interactType = null">取消</button>
          <button class="btn btn--primary" :disabled="!canSaveInteract" @click="saveInteract">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useContactsStore } from '../stores/contacts'
import { MOODS } from '../constants/moods'
import { toKey } from '../utils/date'
import RelationGraph from '../components/RelationGraph.vue'

const contactsStore = useContactsStore()

const selectedId = ref(null)
const activeTag = ref('family')
const showAdd = ref(false)
const newName = ref('')
const newAvatar = ref('👧')
const newTag = ref('friend')

const interactType = ref(null) // 'health' | 'mood' | 'fun'
const interactContent = ref('')
const interactEmoji = ref('😄')
const interactNote = ref('')

onMounted(async () => {
  await contactsStore.init()
})

const tags = [
  { key: 'family', label: '家人' },
  { key: 'relative', label: '亲戚' },
  { key: 'friend', label: '朋友' },
  { key: 'custom', label: '自定义' },
]

const avatarOptions = ['👧', '👦', '👩', '👨', '👵', '👴', '🧒', '🧑', '👱‍♀️', '👨‍🦱']

function tagLabel(key) {
  return tags.find((t) => t.key === key)?.label ?? key
}

const selected = computed(() => contactsStore.contacts.find((c) => c.id === selectedId.value) || null)
const filteredContacts = computed(() => contactsStore.contacts.filter((c) => c.tag === activeTag.value))

const interactTitle = computed(() => {
  if (interactType.value === 'health') return `记录 ${selected.value?.name} 的健康`
  if (interactType.value === 'mood') return `记录 ${selected.value?.name} 的心情`
  return `记录和 ${selected.value?.name} 的趣事`
})

const canSaveInteract = computed(() => {
  if (interactType.value === 'mood') return !!interactEmoji.value
  return !!interactContent.value.trim()
})

function openInteract(type) {
  interactType.value = type
  interactContent.value = ''
  interactNote.value = ''
}

async function addContact() {
  await contactsStore.addContact({
    name: newName.value.trim(),
    avatar: newAvatar.value,
    tag: newTag.value,
    info: { birthday: '', zodiac: '', phone: '', likes: [], catchphrase: '' },
    health: [],
    mood: [],
    funStories: [],
    whisper: '',
  })
  showAdd.value = false
  newName.value = ''
  activeTag.value = newTag.value
}

async function saveInteract() {
  const current = selected.value
  const date = toKey()
  if (interactType.value === 'health') {
    const arr = [...(current.health || []), { content: interactContent.value.trim(), date }]
    await contactsStore.updateContact(current.id, { health: arr })
  } else if (interactType.value === 'mood') {
    const arr = [...(current.mood || []), { emoji: interactEmoji.value, note: interactNote.value, date }]
    await contactsStore.updateContact(current.id, { mood: arr })
  } else {
    const arr = [...(current.funStories || []), { content: interactContent.value.trim(), date }]
    await contactsStore.updateContact(current.id, { funStories: arr })
  }
  interactType.value = null
}
</script>

<style scoped>
.contacts {
  padding: var(--space-md);
}

.detail,
.list {
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

.back-btn {
  align-self: flex-start;
  border: none;
  background: none;
  color: var(--color-primary);
  font-size: 15px;
  cursor: pointer;
  padding: 0;
}

.detail__head {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
}

.detail__avatar {
  font-size: 48px;
}

.detail__name {
  font-size: 20px;
  font-weight: 700;
}

.detail__tag {
  font-size: 12px;
  color: var(--text-secondary);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  font-size: 14px;
  display: flex;
  gap: var(--space-sm);
}

.info-item__label {
  color: var(--text-secondary);
  min-width: 52px;
}

.note {
  font-size: 14px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f2ee;
}

.note:last-child {
  border-bottom: none;
}

.whisper {
  background: #fff8ec;
  border: 1px solid #ffe6c7;
}

.whisper__text {
  font-size: 15px;
  line-height: 1.6;
}

.detail__actions {
  display: flex;
  gap: var(--space-sm);
  position: sticky;
  bottom: 0;
  padding: var(--space-sm) 0;
}

.act-btn {
  flex: 1;
  padding: 12px 0;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #fff;
  cursor: pointer;
  font-size: 14px;
}

.tag-tabs {
  display: flex;
  gap: var(--space-sm);
}

.tag-tabs__item {
  flex: 1;
  padding: 8px 0;
  border: none;
  border-radius: var(--radius-md);
  background: #fff;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
}

.tag-tabs__item.active {
  background: var(--color-primary);
  color: #fff;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 12px 0;
  border-bottom: 1px solid #f5f2ee;
  cursor: pointer;
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-item__avatar {
  font-size: 36px;
}

.contact-item__name {
  font-size: 16px;
  font-weight: 600;
}

.contact-item__catchphrase {
  font-size: 12px;
  color: var(--text-secondary);
}

.add-btn {
  width: 100%;
}

.avatar-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.avatar-grid__item {
  font-size: 26px;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  background: var(--bg-grey);
  cursor: pointer;
  padding: 4px 8px;
}

.avatar-grid__item.active {
  border-color: var(--color-primary);
}

.mood-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: var(--space-md);
}

.mood-row__item {
  font-size: 26px;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  background: var(--bg-grey);
  cursor: pointer;
  padding: 4px 8px;
}

.mood-row__item.active {
  border-color: var(--color-primary);
}

.empty {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  padding: var(--space-md) 0;
}
</style>
