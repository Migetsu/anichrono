export interface Toast {
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
}

const toasts = ref<Toast[]>([])

export const useToast = () => {
    function show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
        const id = Math.random().toString(36).substring(2, 9)
        toasts.value.push({ id, message, type })
        
        // Auto remove handled by component, but safety cleanup
        setTimeout(() => {
            remove(id)
        }, 3500)
    }

    function remove(id: string) {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index > -1) {
            toasts.value.splice(index, 1)
        }
    }

    return {
        toasts,
        show,
        remove
    }
}