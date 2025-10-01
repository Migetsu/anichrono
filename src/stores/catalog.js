import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { ref } from 'vue'

export const useCatalogStore = defineStore('catalog', () => {
    const items: Ref<any[]> = ref([])
    const page = ref(1)
    const total = ref(0)
    const loading = ref(false)

    function setItems(data: any[]) { items.value = data }
    function setLoading(v: boolean) { loading.value = v }

    return { items, page, total, loading, setItems, setLoading }
})