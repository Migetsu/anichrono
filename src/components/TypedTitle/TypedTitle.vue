<template>
    <h1 class="typed-title orbitron" :aria-live="ariaLive">
        <span class="typed-text">{{ displayText }}</span>
        <span class="typed-caret" :class="{ visible: showCaret, blink: showCaret && !isPaused }">|</span>
    </h1>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const strings = [
    'AniChrono',
    'Мир аниме'
]

const typeSpeed = 80
const deleteSpeed = 40
const holdAfterTyped = 3000
const holdAfterDeleted = 1000
const loop = true

const displayText = ref('')
const isPaused = ref(false)
const showCaret = ref(true)
const ariaLive = 'polite'

let stopped = false
let timeoutId = null
let blinkInterval = null

function clearTimers() {
    if (timeoutId) { clearTimeout(timeoutId); timeoutId = null }
    if (blinkInterval) { clearInterval(blinkInterval); blinkInterval = null }
}

function sleep(ms) {
    return new Promise(resolve => {
        timeoutId = setTimeout(resolve, ms)
    })
}

async function runTyped() {
    await sleep(1000)
    let index = 0
    while (!stopped) {
        const full = strings[index % strings.length]

        if (index > 0) {
            showCaret.value = true
        }

        for (let i = 1; i <= full.length; i++) {
            if (stopped) return
            displayText.value = full.slice(0, i)
            await sleep(typeSpeed)
        }

        showCaret.value = false
        await sleep(holdAfterTyped)

        showCaret.value = true

        for (let i = full.length; i >= 0; i--) {
            if (stopped) return
            displayText.value = full.slice(0, i)
            await sleep(deleteSpeed)
        }

        await sleep(holdAfterDeleted)

        index++
        if (!loop && index >= strings.length) break
    }
}

const pauseAnimation = () => {
    isPaused.value = true
    showCaret.value = false
}

const resumeAnimation = () => {
    isPaused.value = false
    showCaret.value = true
}

defineExpose({
    pauseAnimation,
    resumeAnimation
})

onMounted(() => {
    stopped = false
    showCaret.value = true
    runTyped().catch(() => { })

    onBeforeUnmount(() => {
        stopped = true
        clearTimers()
    })
})
</script>

<style scoped lang="scss">
@import "@/components/TypedTitle/TypedTitle.scss"
</style>