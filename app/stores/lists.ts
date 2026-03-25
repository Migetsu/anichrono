import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useToast } from '@/composables/useToast'

export interface AnimeRate {
    id: number
    score: number
    status: 'planned' | 'watching' | 'rewatching' | 'completed' | 'on_hold' | 'dropped'
    text: string
    episodes: number
    chapters: number | null
    volumes: number | null
    text_html: string
    rewatches: number
    created_at: string
    updated_at: string
    user_id: number
    target_id: number
    target_type: 'Anime'
    anime?: any // We can refine this type if we have a shared Anime interface, for now any is safer during migration without full types file
    target?: any
}

function normalizeRate(raw: any): AnimeRate | null {
    if (!raw || typeof raw !== 'object') return null

    const maybeId =
        raw.target_id ??
        raw.targetId ??
        (raw.target && (raw.target.id ?? raw.target?.anime?.id)) ??
        (raw.anime && raw.anime.id)

    const tid = Number(maybeId)
    if (!Number.isFinite(tid)) {
        // If we can't determine the target_id, we might still return the raw object but stripped of target_id?
        // Original logic: return { ...raw, target_id: undefined }
        // But for TS we want to be stricter. Let's return null if we can't find a target ID for mapping.
        // Or we keep it as is but warn.
        return { ...raw, target_id: tid }
    }

    return { ...raw, target_id: tid }
}

export const useListsStore = defineStore('lists', () => {
    // State
    const rates = ref<AnimeRate[]>([])
    const ratesMap = ref(new Map<number, AnimeRate>())
    const loading = ref(false)
    const error = ref<string | null>(null)
    const lastFetchedAt = ref(0)
    const TTL = 1000 * 60 // 1 minute
    let _fetchingPromise: Promise<void> | null = null  // concurrent-call guard

    // Getters
    const rateFor = computed(() => (id: number | string) => {
        const aid = Number(id)
        return ratesMap.value.get(aid) ?? null
    })

    const grouped = computed(() => {
        return rates.value.reduce((acc, r) => {
            const bucket = acc[r.status]
            if (bucket) bucket.push(r)
            return acc
        }, {
            planned: [] as AnimeRate[],
            watching: [] as AnimeRate[],
            rewatching: [] as AnimeRate[],
            completed: [] as AnimeRate[],
            on_hold: [] as AnimeRate[],
            dropped: [] as AnimeRate[],
        })
    })

    // Actions
    function _upsert(raw: any) {
        const rate = normalizeRate(raw)
        if (!rate) return
        const aid = rate.target_id

        // Find existing index
        const i = rates.value.findIndex(r => r.target_id === aid)

        if (i >= 0) {
            const merged = { ...rates.value[i], ...rate }
            rates.value.splice(i, 1, merged)
            ratesMap.value.set(aid, merged)
        } else {
            rates.value.push(rate)
            ratesMap.value.set(aid, rate)
        }
    }

    async function fetchRates(force = false) {
        const auth = useAuthStore()
        if (!auth.isAuthorized || !auth.user?.id) return

        // Reuse any in-flight fetch instead of starting a second parallel one
        if (_fetchingPromise) return _fetchingPromise

        // TTL cache check
        const now = Date.now()
        if (!force && rates.value.length > 0 && (now - lastFetchedAt.value < TTL)) return

        _fetchingPromise = (async () => {
            loading.value = true
            error.value = null

            try {
                const all: AnimeRate[] = []
                const LIMIT = 1000 // v2 API supports up to 1000 per page
                let page = 1

                while (true) {
                    if (page > 1) {
                        // Respect Shikimori 5rps limit
                        await new Promise(r => setTimeout(r, 350))
                    }

                    const data = await $fetch<any[]>('/api/user/rates', {
                        query: {
                            user_id: auth.user!.id,
                            target_type: 'Anime',
                            page,
                            limit: LIMIT,
                        }
                    })

                    if (!Array.isArray(data) || data.length === 0) break
                    all.push(...data)
                    if (data.length < LIMIT) break
                    page++
                }

                rates.value = all.map(normalizeRate).filter((r): r is AnimeRate => r !== null)
                ratesMap.value = new Map(rates.value.map(r => [r.target_id, r]))
                lastFetchedAt.value = Date.now()

            } catch (e: any) {
                error.value = e.message || String(e)
                console.error('[lists] fetchRates failed:', e)
            } finally {
                loading.value = false
                _fetchingPromise = null
            }
        })()

        return _fetchingPromise
    }

    async function fetchRateForTarget(targetId: number | string): Promise<AnimeRate | null> {
        const auth = useAuthStore()
        if (!auth.isAuthorized || !auth.user?.id) return null
        const idNum = Number(targetId)

        try {
            const data = await $fetch<any[]>('/api/user/rates', {
                query: {
                    user_id: auth.user.id,
                    target_type: 'Anime',
                    target_id: idNum,
                    limit: 1
                }
            })

            const rec0 = Array.isArray(data) && data[0] ? normalizeRate(data[0]) : null
            if (rec0 && rec0.target_id === idNum) {
                _upsert(rec0)
                return rec0
            }
        } catch (e) {
            // ignore
        }

        // Fallback or full fetch handled elsewhere or omitted for brevity if primary fetch is robust
        return null
    }

    async function setStatus(anime: any | number, status: string) {
        const auth = useAuthStore()
        const { show } = useToast()

        if (!auth.isAuthorized || !auth.user?.id) return
        const aid = Number(typeof anime === 'object' ? anime.id : anime)
        const existing = rateFor.value(aid)

        try {
            let resultRate: AnimeRate
            if (existing) {
                const data = await $fetch<any>(`/api/user/rates`, {
                    method: 'PUT',
                    query: { id: existing.id },
                    body: { status }
                })
                resultRate = { ...existing, ...data, target_id: aid }
                _upsert(resultRate)
            } else {
                const data = await $fetch<any>('/api/user/rates', {
                    method: 'POST',
                    body: {
                        user_id: auth.user.id,
                        target_id: aid,
                        target_type: 'Anime',
                        status
                    }
                })
                const animeObj = typeof anime === 'object' ? anime : null
                resultRate = animeObj ? { ...data, anime: animeObj, target_id: aid } : { ...data, target_id: aid }
                _upsert(resultRate)
            }
            const statusLabels: Record<string, string> = {
                planned: 'В планах',
                watching: 'Смотрю',
                rewatching: 'Пересматриваю',
                completed: 'Просмотрено',
                on_hold: 'Отложено',
                dropped: 'Брошено'
            }
            const label = statusLabels[status] || status
            show(`Список обновлен: ${label}`, 'success')
        } catch (e: any) {
            // Revert optimistic update if needed, or just show error
            // ideally we should restore previous state, but for now simple error
            error.value = e.message || String(e)
            console.error(e)
            show('Ошибка при обновлении списка', 'error')
            // refetch to ensure consistency
            fetchRates(true)
        }
    }

    async function remove(animeId: number | string) {
        const auth = useAuthStore()
        if (!auth.isAuthorized || !auth.user?.id) return
        const aid = Number(animeId)
        const existing = rateFor.value(aid)
        if (!existing) return

        try {
            await $fetch(`/api/user/rates`, {
                method: 'DELETE',
                query: { id: existing.id }
            })

            rates.value = rates.value.filter(r => r.id !== existing.id)
            ratesMap.value.delete(existing.target_id)

            const { show } = useToast()
            show('Тайтл удален из списка', 'info')
        } catch (e: any) {
            error.value = e.message || String(e)
            console.error(e)
            const { show } = useToast()
            show('Ошибка при удалении', 'error')
        }
    }

    async function updateEpisodes(animeId: number, episodes: number) {
        const auth = useAuthStore()
        if (!auth.isAuthorized || !auth.user?.id) return

        const existing = rateFor.value(animeId)
        if (!existing) return // Can only update if already in list

        // Don't update if already same or lower (unless rewatching, but simple logic for now)
        if (existing.episodes >= episodes) return

        try {
            const data = await $fetch<any>(`/api/user/rates`, {
                method: 'PUT',
                query: { id: existing.id },
                body: { episodes }
            })

            const resultRate = { ...existing, ...data, target_id: animeId }
            _upsert(resultRate)

            // Optional: minimal toast or silent update
            // const { show } = useToast()
            // show(`Прогресс обновлен: ${episodes} эп.`, 'success')
        } catch (e) {
            console.error('Failed to auto-update progress', e)
        }
    }

    async function ensureRates() {
        const auth = useAuthStore()
        if (!auth.isAuthorized || !auth.user?.id) return
        if (loading.value) {
            while (loading.value) await new Promise(r => setTimeout(r, 40))
            return
        }
        if (rates.value.length) return
        await fetchRates()
    }

    function $reset() {
        rates.value = []
        ratesMap.value = new Map()
        lastFetchedAt.value = 0
        loading.value = false
        error.value = null
    }

    return {
        rates,
        ratesMap,
        loading,
        error,
        rateFor,
        grouped,
        fetchRates,
        fetchRateForTarget,
        setStatus,
        remove,
        updateEpisodes,
        ensureRates,
        $reset,
        _upsert
    }
})