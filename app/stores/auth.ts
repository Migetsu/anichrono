import { defineStore } from 'pinia'
import { useListsStore } from './lists'

interface UserImage {
    x160: string
    x148: string
    x80: string
    x64: string
    x48: string
    x32: string
    x16: string
}

interface User {
    id: number
    nickname: string
    avatar: string
    image: UserImage
    last_online_at: string
    url: string
}

export const useAuthStore = defineStore('auth', () => {
    // State
    // We only track IF a session exists, not the token itself (security)
    const sessionCookie = useCookie<string | null>('shiki_session', { readonly: false, default: () => null })
    const user = useState<User | null>('auth_user', () => null)
    const loading = useState<boolean>('auth_loading', () => false)
    const error = useState<string | null>('auth_error', () => null)

    // Getters
    const isLoggedIn = computed(() => !!sessionCookie.value && !!user.value)
    // Expose primitive state for other stores if they need to check "are we semi-authorized?"
    const isAuthorized = computed(() => !!sessionCookie.value)

    // Actions
    async function fetchMe() {
        if (!sessionCookie.value || loading.value) return
        loading.value = true
        error.value = null
        try {
            // /api/whoami uses the HttpOnly shiki_token/shiki_refresh cookies
            const data = await $fetch<User>('/api/whoami')
            user.value = data
            
            // Try to fetch users lists after successful login
            const listsStore = useListsStore()
            listsStore.fetchRates().catch(err => {
                console.warn('Post-login lists fetch failed', err)
            })
        } catch (e: any) {
            console.error('Fetch user error:', e)
            error.value = e.message || 'Failed to fetch user'
            
            // Only clear token if it's a 401 (meaning session is truly dead)
            // or if we explicitly failed refreshing on the server
            if (e.statusCode === 401 || e.status === 401) {
                clearToken()
            }
        } finally {
            loading.value = false
        }
    }

    function login(redirectTo: string | null = null) {
        if (typeof window === 'undefined') return
        
        let state = ''
        try {
            const target = redirectTo || window.location.pathname + window.location.search

            const b64 = btoa(encodeURIComponent(target).replace(/%([0-9A-F]{2})/g, (match, p1) => 
                String.fromCharCode(parseInt(p1, 16))
            ))

            state = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
        } catch (e) { console.error('SignState Error', e) }

        window.location.href = state ? `/api/auth/login?state=${state}` : '/api/auth/login'
    }

    function logout() {
        if (typeof window === 'undefined') return
        clearToken()
        window.location.href = '/api/auth/logout'
    }

    function clearToken() {
        sessionCookie.value = null
        user.value = null
        try {
            const listsStore = useListsStore()
            listsStore.$reset()
        } catch {}
    }

    // Initialize
    let initPromise: Promise<void> | null = null
    async function init() {
        if (user.value) return
        if (!sessionCookie.value) return
        
        if (!initPromise) {
            initPromise = fetchMe().finally(() => {
                initPromise = null
            })
        }
        return initPromise
    }

    return {
        isAuthorized,
        user,
        loading,
        error,
        isLoggedIn,
        login,
        logout,
        fetchMe,
        init
    }
})