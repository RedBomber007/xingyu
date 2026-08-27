import { defineStore } from 'pinia'
import { db } from '../db'

export const useKnowledgeStore = defineStore('knowledge', {
  state: () => ({ items: [], loaded: false }),

  getters: {
    logs: (state) => state.items.filter((i) => i.category === 'study'),
    favorites: (state) => state.items.filter((i) => i.category === 'fact'),
    skills: (state) => state.items.filter((i) => i.category === 'skill'),
  },

  actions: {
    async init() {
      this.items = await db.knowledge.orderBy('createdAt').toArray()
      this.loaded = true
    },
    async addItem(item) {
      const record = { ...item, createdAt: new Date().toISOString() }
      const id = await db.knowledge.add(record)
      record.id = id
      this.items.push(record)
      return record
    },
    async updateItem(id, patch) {
      await db.knowledge.update(id, patch)
      const idx = this.items.findIndex((i) => i.id === id)
      if (idx >= 0) this.items[idx] = { ...this.items[idx], ...patch }
    },
    async removeItem(id) {
      await db.knowledge.delete(id)
      this.items = this.items.filter((i) => i.id !== id)
    },
  },
})
