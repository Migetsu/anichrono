
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

function normalizeRate(raw) {
  if (!raw || typeof raw !== 'object') return null

  const maybeId =
    raw.target_id ??
    raw.targetId ??
    (raw.target && (raw.target.id ?? raw.target?.anime?.id)) ??
    (raw.anime && raw.anime.id)

  const tid = Number(maybeId)
  if (!Number.isFinite(tid)) {
    return { ...raw, target_id: undefined }
  }

  return { ...raw, target_id: tid }
}

export const useListsStore = defineStore('lists', {
  state: () => ({
    rates:  ([]),
    ratesMap:  (new Map()),
    loading: false,
    error: null,
  }),

  getters: {
    rateFor: (s) => (id) => {
      const aid = Number(id)
      return s.ratesMap.get(aid) ?? null
    },

    grouped: (s) =>
      s.rates.reduce(
        (acc, r) => {
          const bucket = acc[r.status]
          if (bucket) bucket.push(r)
          return acc
        },
        {
          planned: [],
          watching: [],
          rewatching: [],
          completed: [],
          on_hold: [],
          dropped: [],
        }
      ),
  },

  actions: {
    _upsert(raw) {
      const rate = normalizeRate(raw)
      if (!rate) return
      const aid = rate.target_id
      const i = this.rates.findIndex(r =>
        Number(r.target_id ?? r.targetId ?? r.target?.id ?? r.anime?.id) === aid
      )
      if (i >= 0) {
        const merged = { ...this.rates[i], ...rate }
        this.rates.splice(i, 1, merged)
        this.ratesMap.set(aid, merged)
      } else {
        this.rates.push(rate)
        this.ratesMap.set(aid, rate)
      }
    },

    async fetchRates() {
      const auth = useAuthStore()
      if (!auth.token || !auth.user?.id) return
      this.loading = true
      this.error = null
      try {
        const all = []
        const LIMIT = 100
        let page = 1
        while (true) {
          const res = await fetch(
            `/api/user-rates?user_id=${auth.user.id}&target_type=Anime&page=${page}&limit=${LIMIT}`,
            { headers: { Authorization: `Bearer ${auth.token}` } }
          )
          if (!res.ok) throw new Error(`fetchRates ${res.status}`)
          const data = await res.json()
          if (!Array.isArray(data) || data.length === 0) break
          
          
          const enriched = data.map(rate => {
            if (rate.anime) {
              return rate
            }
            
            return {
              ...rate,
              anime: rate.target || { id: rate.target_id }
            }
          })
          
          all.push(...enriched)
          if (data.length < LIMIT) break
          page++
        }
        this.rates = all.map(normalizeRate).filter(Boolean)
        this.ratesMap = new Map(
          this.rates.map(r => [r.target_id, r])
        )
      } catch (e) {
        this.error = String(e?.message || e)
        this.rates = []
        this.ratesMap = new Map()
      } finally {
        this.loading = false
      }
    },

    async fetchRateForTarget(targetId) {
      const auth = useAuthStore()
      if (!auth.token || !auth.user?.id) return null
      const idNum = Number(targetId)

      try {
        const url = `/api/user-rates?user_id=${auth.user.id}&target_type=Anime&target_id=${idNum}&limit=1`
        const r = await fetch(url, { headers: { Authorization: `Bearer ${auth.token}` } })
        if (r.ok) {
          const data = await r.json()
          const rec0 = Array.isArray(data) && data[0] ? normalizeRate(data[0]) : null
          if (rec0 && rec0.target_id === idNum) {
            this._upsert(rec0)
            return rec0
          }
        }
      } catch (_) {
      }

      const LIMIT = 100
      let page = 1
      while (true) {
        const resp = await fetch(
          `/api/user-rates?user_id=${auth.user.id}&target_type=Anime&page=${page}&limit=${LIMIT}`,
          { headers: { Authorization: `Bearer ${auth.token}` } }
        )
        if (!resp.ok) throw new Error(`fetch user-rates page ${page}: ${resp.status}`)
        const arr = await resp.json()
        if (!Array.isArray(arr) || arr.length === 0) break

        const foundRaw = arr.find(r => {
          const tid = Number(
            r.target_id ?? r.targetId ?? r.target?.id ?? r.anime?.id
          )
          return tid === idNum
        })
        if (foundRaw) {
          const rec = normalizeRate(foundRaw)
          this._upsert(rec)
          return rec
        }

        if (arr.length < LIMIT) break
        page += 1
      }

      return null
    },

    async setStatus(anime, status) {
      const auth = useAuthStore()
      if (!auth.token || !auth.user?.id) return
      const aid = Number(typeof anime === 'object' ? anime.id : anime)
      const existing = this.rateFor(aid)
      try {
        if (existing) {
          const res = await fetch(`/api/user-rates?id=${existing.id}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${auth.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
          })
          if (!res.ok) throw new Error(`update ${res.status}`)
          const data = await res.json()
          this._upsert({ ...existing, ...data, target_id: aid })
        } else {
          const res = await fetch('/api/user-rates', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${auth.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: auth.user.id,
              target_id: aid,
              target_type: 'Anime',
              status,
            }),
          })
          if (!res.ok) throw new Error(`create ${res.status}`)
          const data = await res.json()
          const animeObj = typeof anime === 'object' ? anime : null
          this._upsert(animeObj ? { ...data, anime: animeObj, target_id: aid } : { ...data, target_id: aid })
        }
      } catch (e) {
        this.error = String(e?.message || e)
        console.error(e)
      }
    },

    async remove(animeId) {
      const auth = useAuthStore()
      if (!auth.token || !auth.user?.id) return
      const aid = Number(animeId)
      const existing = this.rateFor(aid)
      if (!existing) return
      try {
        const res = await fetch(`/api/user-rates?id=${existing.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        if (!res.ok) throw new Error(`delete ${res.status}`)
        this.rates = this.rates.filter(r => r.id !== existing.id)
        this.ratesMap.delete(existing.target_id)
      } catch (e) {
        this.error = String(e?.message || e)
        console.error(e)
      }
    },

    async ensureRates() {
      const auth = useAuthStore()
      if (!auth.token || !auth.user?.id) return
      if (this.loading) {
        while (this.loading) await new Promise(r => setTimeout(r, 40))
        return
      }
      if (this.rates.length) return
      await this.fetchRates()
    },
  },
})