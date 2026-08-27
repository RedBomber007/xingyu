import { defineStore } from 'pinia'
import { db } from '../db'
import { toKey } from '../utils/date'

export const useMoodStore = defineStore('mood', {
  state: () => ({ moods: [], loaded: false }),

  getters: {
    todayMood(state) {
      const key = toKey()
      return state.moods.find((m) => m.date === key) || null
    },
    recordDates(state) {
      return state.moods.map((m) => m.date)
    },
  },

  actions: {
    async init() {
      this.moods = await db.moods.orderBy('createdAt').toArray()
      this.loaded = true
    },
    async addMood({ moodId, score, date = toKey() }) {
      const record = { moodId, score, date, createdAt: new Date().toISOString() }
      const id = await db.moods.add(record)
      record.id = id
      this.moods.push(record)
      return record
    },
    async removeMood(id) {
      await db.moods.delete(id)
      this.moods = this.moods.filter((m) => m.id !== id)
    },
  },
})
