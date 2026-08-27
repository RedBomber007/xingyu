import { defineStore } from 'pinia'
import { db } from '../db'
import { toKey } from '../utils/date'

export const useDiaryStore = defineStore('diary', {
  state: () => ({ entries: [], loaded: false }),

  getters: {
    // 按日期分组，entries 已按最新在前，Map 保持插入顺序
    grouped(state) {
      const map = new Map()
      for (const e of state.entries) {
        const key = e.date || toKey(new Date(e.createdAt))
        if (!map.has(key)) map.set(key, [])
        map.get(key).push(e)
      }
      return map
    },
  },

  actions: {
    async init() {
      this.entries = await db.diary.orderBy('createdAt').reverse().toArray()
      this.loaded = true
    },
    async addEntry({ type, content, date = toKey(), images = [] }) {
      const entry = { type, content, date, images, createdAt: new Date().toISOString() }
      const id = await db.diary.add(entry)
      entry.id = id
      this.entries.unshift(entry)
      return entry
    },
    async removeEntry(id) {
      await db.diary.delete(id)
      this.entries = this.entries.filter((e) => e.id !== id)
    },
  },
})
