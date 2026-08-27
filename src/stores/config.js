import { defineStore } from 'pinia'
import { db } from '../db'

export const useConfigStore = defineStore('config', {
  state: () => ({ config: {}, loaded: false }),

  actions: {
    async init() {
      const all = await db.config.toArray()
      this.config = Object.fromEntries(all.map((c) => [c.key, c.value]))
      this.loaded = true
    },
    get(key) {
      return this.config[key]
    },
    async set(key, value) {
      this.config[key] = value
      await db.config.put({ key, value })
    },
  },
})
