import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useListsStore = defineStore('lists', {
  state: () => ({
    rates: [],
    loading: false,
    error: null
  }),
  getters: {
    rateFor: s => id => s.rates.find(r => r.target_id === id),
    grouped: s =>
      s.rates.reduce((acc, r) => {
        (acc[r.status] = acc[r.status] || []).push(r)
        return acc
      }, {})
  },
  actions: {
    async fetchRates() {
      const auth = useAuthStore()
      if (!auth.token || !auth.user) return
      this.loading = true
      this.error = null
      try {
        const all = []
        const LIMIT = 50
        let page = 1
        while (true) {
          const r = await fetch(`/api/user-rates?user_id=${auth.user.id}&page=${page}&limit=${LIMIT}`, {
            headers: { Authorization: `Bearer ${auth.token}` }
          })
          if (!r.ok) throw new Error(`rates ${r.status}`)
          const data = await r.json()
          all.push(...data)
          if (data.length < LIMIT) break
          page++
        }
        this.rates = all
      } catch (e) {
        this.error = String(e.message || e)
        this.rates = []
      } finally {
        this.loading = false
      }
    },
    async setStatus(anime, status) {
      const auth = useAuthStore()
      if (!auth.token || !auth.user) return
      const animeId = typeof anime === 'object' ? anime.id : anime
      const existing = this.rates.find(r => r.target_id === animeId)
      try {
        if (existing) {
          const r = await fetch(`/api/user-rates?id=${existing.id}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${auth.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
          })
          if (!r.ok) throw new Error(`update ${r.status}`)
          const data = await r.json()
          existing.status = data.status
        } else {
          const r = await fetch('/api/user-rates', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${auth.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_id: auth.user.id,
              target_id: animeId,
              target_type: 'Anime',
              status
            })
          })
          if (!r.ok) throw new Error(`create ${r.status}`)
          const data = await r.json()
          const animeObj = typeof anime === 'object' ? anime : null
          this.rates.push(animeObj ? { ...data, anime: animeObj } : data)
        }
      } catch (e) {
        console.error(e)
      }
    },
    async remove(animeId) {
      const auth = useAuthStore()
      if (!auth.token || !auth.user) return
      const existing = this.rates.find(r => r.target_id === animeId)
      if (!existing) return
      try {
        const r = await fetch(`/api/user-rates?id=${existing.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${auth.token}` }
        })
        if (!r.ok) throw new Error(`delete ${r.status}`)
        this.rates = this.rates.filter(r => r.id !== existing.id)
      } catch (e) {
        console.error(e)
      }
    }
  }
})

