import { defineStore } from 'pinia'
import { db } from '../db'

export const useContactsStore = defineStore('contacts', {
  state: () => ({ contacts: [], loaded: false }),

  actions: {
    async init() {
      this.contacts = await db.contacts.orderBy('name').toArray()
      this.loaded = true
    },
    async addContact(contact) {
      const record = { ...contact, createdAt: new Date().toISOString() }
      const id = await db.contacts.add(record)
      record.id = id
      this.contacts.push(record)
      return record
    },
    async updateContact(id, patch) {
      await db.contacts.update(id, patch)
      const idx = this.contacts.findIndex((c) => c.id === id)
      if (idx >= 0) this.contacts[idx] = { ...this.contacts[idx], ...patch }
    },
    async removeContact(id) {
      await db.contacts.delete(id)
      this.contacts = this.contacts.filter((c) => c.id !== id)
    },
  },
})
