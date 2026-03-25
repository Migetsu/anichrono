import { ref, computed } from 'vue'

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

export function useAuth() {
    const sessionCookie = useCookie<string | null>('shiki_session', { readonly: false, default: () => null })
    const user = ref<User | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const isLoggedIn = computed(() => !!sessionCookie.value && !!user.value)
    const isAuthorized = computed(() => !!sessionCookie.value)

    async function fetchMe() {
        if (!sessionCookie.value) return
        loading.value = true
        error.value = null
        try {
            const data = await $fetch<User>('/api/whoami')
            user.value = data
        } catch (e: any) {
            console.error('Fetch user error', e)
            error.value = e.message || 'Failed to fetch user'
            sessionCookie.value = null
            user.value = null
        } finally {
            loading.value = false
        }
    }

    function login(redirectTo: string | null = null) {
        let state = ''
        try {
            const target = (typeof redirectTo === 'string' && redirectTo)
                ? redirectTo
                : (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/')

            const b64 = (typeof btoa === 'function')
                ? btoa(encodeURIComponent(target).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16))))
                : Buffer.from(target).toString('base64')

            state = b64 ? b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '') : ''
        } catch (e) { console.error('SignState Error', e) }

        const url = state ? `/api/auth/login?state=${state}` : '/api/auth/login'
        if (typeof window !== 'undefined') {
            window.location.href = url
        }
    }

    function logout() {
        sessionCookie.value = null
        user.value = null
        if (typeof window !== 'undefined') {
            window.location.href = '/api/auth/logout'
        }
    }

    async function init() {
        if (sessionCookie.value && !user.value) {
            await fetchMe()
        }
    }

    return {
        isAuthorized,
        isLoggedIn,
        user,
        loading,
        error,
        login,
        logout,
        fetchMe,
        init
    }
}