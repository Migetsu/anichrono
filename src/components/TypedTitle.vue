<template>
    <h1 class="typed-title orbitron" :aria-live="ariaLive">
        <span class="typed-text">{{ displayText }}</span>
        <span class="typed-caret" :class="{ blink: blinkCaret }">|</span>
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
const holdAfterDeleted = 500 
const loop = true

const displayText = ref('')
const blinkCaret = ref(true)
const ariaLive = 'polite'

let stopped = false
let timeoutId = null

function clearTimers() {
    if (timeoutId) { clearTimeout(timeoutId); timeoutId = null }
}

function sleep(ms) {
    return new Promise(resolve => {
        timeoutId = setTimeout(resolve, ms)
    })
}

async function runTyped() {
    await sleep(300)
    let index = 0
    while (!stopped) {
        const full = strings[index % strings.length]
        for (let i = 1; i <= full.length; i++) {
            if (stopped) return
            displayText.value = full.slice(0, i)
            await sleep(typeSpeed)
        }
        await sleep(holdAfterTyped)
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

onMounted(() => {
    stopped = false
    runTyped().catch(() => { })
    const blinkInterval = setInterval(() => {
        blinkCaret.value = !blinkCaret.value
    }, 3000)
    timeoutId = timeoutId 
    onBeforeUnmount(() => {
        stopped = true
        clearInterval(blinkInterval)
        clearTimers()
    })
})
</script>

<style scoped lang="scss">
@import '@/styles/_variables.scss';

.typed-title {
    font-family: 'Orbitron', sans-serif;
    font-weight: 900;
    font-size: 64px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(45deg, $accent-coral, $accent-turquoise, $accent-gold);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.typed-text {
    display: inline-block;
    white-space: nowrap;
    max-width: 100%;
    overflow: hidden;
}

.typed-caret {
    color: $text-primary;
    opacity: 1;
    transition: opacity 120ms linear, transform 120ms ease;

    &.blink {
        opacity: 0.14;
    }

}

@media (max-width: 768px) {
    .typed-title {
        font-size: 40px;
    }
}
</style>