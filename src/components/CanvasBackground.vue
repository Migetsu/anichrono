<template>
    <canvas ref="canvas" class="canvas-bg" />
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref } from 'vue'

type Particle = {
    x: number
    y: number
    vx: number
    vy: number
    size: number
    color: string // hex like '#ff6b6b'
}

export default defineComponent({
    name: 'CanvasBackground',
    props: {
        amount: { type: Number, default: 100 },       // base amount on desktop
        maxDistance: { type: Number, default: 100 },  // connection distance
        disableOnMobile: { type: Boolean, default: true }
    },
    setup(props) {
        const canvas = ref<HTMLCanvasElement | null>(null)
        let ctx: CanvasRenderingContext2D | null = null
        let rafId = 0
        let particles: Particle[] = []
        let dpr = 1

        const COLORS = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#00ffff', '#ff00ff']

        function isMobile() {
            return window.matchMedia('(max-width: 768px)').matches
        }

        function hexToRgba(hex: string, alpha: number) {
            // hex can be #rrggbb or #rgb
            const h = hex.replace('#', '')
            const bigint =
                h.length === 3
                    ? parseInt(h.split('').map(c => c + c).join(''), 16)
                    : parseInt(h, 16)
            const r = (bigint >> 16) & 255
            const g = (bigint >> 8) & 255
            const b = bigint & 255
            return `rgba(${r}, ${g}, ${b}, ${alpha})`
        }

        function resizeCanvas() {
            if (!canvas.value || !ctx) return
            dpr = window.devicePixelRatio || 1
            const w = canvas.value.clientWidth
            const h = canvas.value.clientHeight
            canvas.value.width = Math.round(w * dpr)
            canvas.value.height = Math.round(h * dpr)
            // scale the drawing context so we can use CSS px coordinates
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }

        function createParticles() {
            if (!canvas.value) return
            particles = []
            // adapt amount for mobile
            const actualAmount = props.disableOnMobile && isMobile() ? Math.round(props.amount * 0.4) : props.amount
            const w = canvas.value.clientWidth
            const h = canvas.value.clientHeight
            for (let i = 0; i < actualAmount; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 1.2, // speed tuning
                    vy: (Math.random() - 0.5) * 1.2,
                    size: 1 + Math.random() * 3,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)]
                })
            }
        }

        function drawFrame() {
            if (!canvas.value || !ctx) return
            const w = canvas.value.clientWidth
            const h = canvas.value.clientHeight

            // clear with slight alpha -> trailing effect; use rgba background close to page
            ctx.fillStyle = 'rgba(10,10,10,0.25)'
            ctx.fillRect(0, 0, w, h)

            // update & draw particles
            for (const p of particles) {
                p.x += p.vx
                p.y += p.vy

                // wrap-around
                if (p.x < -10) p.x = w + 10
                if (p.x > w + 10) p.x = -10
                if (p.y < -10) p.y = h + 10
                if (p.y > h + 10) p.y = -10

                // draw particle (slightly transparent)
                ctx.beginPath()
                ctx.fillStyle = hexToRgba(p.color, 0.25) // original used hex+'40' -> alpha ~ 0.25
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fill()
            }

            // lines between close particles (O(n^2) — fine for ~100)
            const maxD = props.maxDistance
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i]
                    const b = particles[j]
                    const dx = a.x - b.x
                    const dy = a.y - b.y
                    const dist = Math.hypot(dx, dy)
                    if (dist < maxD) {
                        // alpha based on distance
                        const alpha = 1 - dist / maxD
                        // choose stroke color (blend of two particle colors — but simpler: use first with reduced alpha)
                        ctx.strokeStyle = hexToRgba(a.color, Math.max(0.06, alpha * 0.18))
                        ctx.lineWidth = 0.8
                        ctx.beginPath()
                        ctx.moveTo(a.x, a.y)
                        ctx.lineTo(b.x, b.y)
                        ctx.stroke()
                    }
                }
            }

            rafId = requestAnimationFrame(drawFrame)
        }

        function handleResize() {
            resizeCanvas()
            createParticles()
        }

        onMounted(() => {
            if (!canvas.value) return
            if (props.disableOnMobile && isMobile()) {
                // keep canvas but with fewer particles (createParticles handles)
            }

            ctx = canvas.value.getContext('2d')
            if (!ctx) return
            // ensure CSS makes canvas cover viewport (see styles below)
            resizeCanvas()
            createParticles()
            window.addEventListener('resize', handleResize)
            rafId = requestAnimationFrame(drawFrame)
        })

        onBeforeUnmount(() => {
            window.removeEventListener('resize', handleResize)
            cancelAnimationFrame(rafId)
            particles = []
        })

        return { canvas }
    }
})
</script>

<style scoped>
.canvas-bg {
    position: fixed;
    inset: 0;
    /* top:0; right:0; bottom:0; left:0 */
    width: 100%;
    height: 100%;
    z-index: -1;
    display: block;
    pointer-events: none;
    /* not interfere with UI */
}
</style>