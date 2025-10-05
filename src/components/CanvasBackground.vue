<template>
  <canvas ref="canvasRef" class="canvas-bg"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  particleCount: {
    type: Number,
    default: 60
  },
  particleSpeed: {
    type: Number,
    default: 0.5
  },
  lineDistance: {
    type: Number,
    default: 150
  },
  particleColor: {
    type: String,
    default: '#ff6b6b'
  }
})

const canvasRef = ref(null)
let ctx = null
let particles = []
let animationId = null
let isVisible = true

class Particle {
  constructor(canvas) {
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.vx = (Math.random() - 0.5) * props.particleSpeed
    this.vy = (Math.random() - 0.5) * props.particleSpeed
    this.radius = Math.random() * 2 + 1
  }

  update(canvas) {
    this.x += this.vx
    this.y += this.vy

    
    if (this.x < 0 || this.x > canvas.width) {
      this.vx = -this.vx
    }
    if (this.y < 0 || this.y > canvas.height) {
      this.vy = -this.vy
    }

    
    this.x = Math.max(0, Math.min(canvas.width, this.x))
    this.y = Math.max(0, Math.min(canvas.height, this.y))
  }

  draw(context) {
    context.beginPath()
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    context.fillStyle = props.particleColor
    context.fill()
  }
}

function initParticles() {
  particles = []
  const canvas = canvasRef.value
  if (!canvas) return

  const count = window.innerWidth < 768 ? Math.floor(props.particleCount * 0.5) : props.particleCount
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(canvas))
  }
}

function drawLines() {
  const canvas = canvasRef.value
  if (!canvas) return

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < props.lineDistance) {
        const opacity = 1 - distance / props.lineDistance
        ctx.beginPath()
        ctx.strokeStyle = `rgba(255, 107, 107, ${opacity * 0.3})`
        ctx.lineWidth = 1
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.stroke()
      }
    }
  }
}

function animate() {
  if (!canvasRef.value || !ctx || !isVisible) {
    animationId = requestAnimationFrame(animate)
    return
  }

  const canvas = canvasRef.value
  
  
  ctx.fillStyle = 'rgba(10, 10, 20, 0.1)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  
  particles.forEach(particle => {
    particle.update(canvas)
    particle.draw(ctx)
  })

  
  drawLines()

  animationId = requestAnimationFrame(animate)
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  initParticles()
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  ctx = canvas.getContext('2d')
  if (!ctx) return

  resizeCanvas()

  
  const observer = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0].isIntersecting
    },
    { threshold: 0.1 }
  )
  observer.observe(canvas)

  
  window.addEventListener('resize', resizeCanvas)

  
  animate()

  onBeforeUnmount(() => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
    window.removeEventListener('resize', resizeCanvas)
    observer.disconnect()
    particles = []
  })
})
</script>

<style scoped>
.canvas-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: linear-gradient(135deg, #0a0a14 0%, #1a1a2e 100%);
  pointer-events: none;
}
</style>
