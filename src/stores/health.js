import { defineStore } from 'pinia'
import { db } from '../db'
import { toKey } from '../utils/date'

export const useHealthStore = defineStore('health', {
  state: () => ({ records: [], loaded: false }),

  getters: {
    todayRecords(state) {
      const key = toKey()
      return state.records.filter((r) => r.date === key)
    },
  },

  actions: {
    async init() {
      this.records = await db.health.orderBy('createdAt').toArray()
      this.loaded = true
    },
    async addRecord({ type, value, date = toKey() }) {
      const record = { type, value, date, createdAt: new Date().toISOString() }
      const id = await db.health.add(record)
      record.id = id
      this.records.push(record)
      return record
    },
    async removeRecord(id) {
      await db.health.delete(id)
      this.records = this.records.filter((r) => r.id !== id)
    },
  },
})
