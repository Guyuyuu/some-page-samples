<template>
  <div class="water-scene">
    <canvas ref="canvasRef" @click="handleClick" @mousemove="handleMouseMove"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let ctx = null
let animationId = null
let W = 0
let H = 0
let time = 0

// ============ 涟漪系统 ============
const ripples = []

class Ripple {
  constructor(x, y, type = 'auto', wavelength = 0) {
    const isBig = type === 'click'
    const isRain = type === 'rain'
    this.x = x
    this.y = y
    this.r = 0
    this.maxR = isBig ? 130 + Math.random() * 50
      : isRain ? 25 + Math.random() * 30
        : 10 + Math.random() * 20
    this.speed = isBig ? 1.0 + Math.random() * 0.3
      : isRain ? 0.6 + Math.random() * 0.5
        : 0.3 + Math.random() * 0.4
    this.opacity = isBig ? 0.6 + Math.random() * 0.1
      : isRain ? 0.5 + Math.random() * 0.5
        : 0.12 + Math.random() * 0.1
    this.type = type
    this.alive = true
    this.wavelength = wavelength || (isBig ? 9 + Math.random() * 3 : (isRain ? 6 + Math.random() * 2 : 3 + Math.random() * 1))
    this.amplitude = isBig ? 1.0 : (isRain ? 0.8 : 0.5)
  }

  update() {
    this.r += this.speed
    this.speed *= 0.998
    this.opacity *= 0.985
    if (this.opacity < 0.005 || this.r > this.maxR) this.alive = false
  }

  draw() {
    if (this.r <= 3) return

    const R = Math.floor(this.r)
    const step = Math.max(3, this.wavelength)

    // 中心暗区
    if (this.opacity > 0.04) {
      ctx.beginPath()
      ctx.arc(this.x, this.y, Math.max(R * 0.12, 2), 0, Math.PI * 2)
      ctx.fillStyle = `rgba(40, 55, 80, ${this.opacity * 0.2})`
      ctx.fill()
    }

    // 明暗交替环 — 步长=波长，每次画一对(亮+暗)
    for (let r = R; r >= step; r -= step) {
      const crest = r - step * 0.25   // 波峰半径
      const trough = r - step * 0.75  // 波谷半径
      const intensity = this.amplitude * this.opacity * (1 - r / this.maxR)
      if (intensity < 0.005) continue

      // 亮环（波峰）
      ctx.beginPath()
      ctx.arc(this.x, this.y, crest, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(200, 225, 250, ${intensity * 0.5})`
      ctx.lineWidth = Math.max(intensity * 1.5, 0.3)
      ctx.stroke()

      // 暗环（波谷）
      ctx.beginPath()
      ctx.arc(this.x, this.y, trough, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(50, 70, 100, ${intensity * 0.35})`
      ctx.lineWidth = Math.max(intensity * 1.0, 0.3)
      ctx.stroke()
    }
  }
}

// ============ 雨滴击水（全屏水面上的溅射点） ============
const rainImpacts = []
const RAIN_RATE = 4  // 每帧产生新雨滴数

class RainImpact {
  constructor() {
    this.x = Math.random() * W
    this.y = Math.random() * H
    this.life = 0
    this.maxLife = 20 + Math.random() * 30
    this.size = 1 + Math.random() * 2.5
    this.speed = 0.5 + Math.random() * 0.8
  }
  update() {
    this.life += this.speed
    this.y += 0.3  // 微微下坠
    if (this.life > this.maxLife || this.y > H + 5) return false
    return true
  }
  draw() {
    const progress = this.life / this.maxLife
    const alpha = (1 - progress) * 0.4
    const r = this.size * (1 - progress * 0.3)

    // 溅射小白点
    ctx.beginPath()
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(220, 235, 255, ${alpha})`
    ctx.fill()
  }
}

// ============ 水底焦散（Caustics）光照纹理 ============
const caustics = []
const CAUSTIC_COUNT = 25

class Caustic {
  constructor() {
    this.reset()
  }
  reset() {
    this.x = Math.random() * W
    this.y = Math.random() * H
    this.r = 40 + Math.random() * 120
    this.opacity = 0.03 + Math.random() * 0.04
    this.speedX = (Math.random() - 0.5) * 0.15
    this.speedY = (Math.random() - 0.5) * 0.1
    this.phase = Math.random() * Math.PI * 2
    this.freq = 0.005 + Math.random() * 0.01
  }
  update() {
    this.x += this.speedX
    this.y += this.speedY
    this.phase += this.freq
    if (this.x < -this.r) this.x = W + this.r
    if (this.x > W + this.r) this.x = -this.r
    if (this.y < -this.r) this.y = H + this.r
    if (this.y > H + this.r) this.y = -this.r
  }
  draw() {
    const pulse = 0.6 + 0.4 * Math.sin(this.phase)
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r)
    grad.addColorStop(0, `rgba(170, 200, 240, ${this.opacity * pulse})`)
    grad.addColorStop(0.4, `rgba(150, 185, 225, ${this.opacity * 0.5 * pulse})`)
    grad.addColorStop(1, 'rgba(150, 185, 225, 0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ============ 水面波光网格 ============
function drawWaterBase() {
  // 主体灰蓝色渐变（深到浅，模拟水体纵深）
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#1a1a2e')
  grad.addColorStop(0.2, '#1e1e36')
  grad.addColorStop(0.4, '#242440')
  grad.addColorStop(0.6, '#2a2a4a')
  grad.addColorStop(0.8, '#303055')
  grad.addColorStop(1, '#363660')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)
}

function drawWaterTexture() {
  // 水面波纹结构纹理 — 两大组不同方向的正弦波叠加，形成水面的"肌理"
  ctx.save()

  // 第一组：横向大波纹
  ctx.globalAlpha = 0.04
  for (let y = 0; y < H; y += 4) {
    const wave1 = Math.sin(y * 0.008 + time * 0.008) * 0.6
    const wave2 = Math.sin(y * 0.02 + time * 0.015) * 0.4
    const brightness = 0.5 + wave1 + wave2 * 0.5
    ctx.fillStyle = `rgba(140, 180, 220, ${brightness * 0.15})`
    ctx.fillRect(0, y, W, 1)
  }

  // 第二组：斜向微纹（增加细节）
  ctx.globalAlpha = 0.015
  for (let i = -H; i < W + H; i += 8) {
    const offset = (i + time * 0.5) % (W + H)
    const yPos = (i + H) % H
    ctx.fillStyle = 'rgba(160, 200, 240, 0.1)'
    ctx.fillRect(offset * 0.3, yPos, 1, 2)
  }

  ctx.restore()
}

function drawSurfaceGlow() {
  // 水面远处（上方）若有若无的雾气光辉
  const grad = ctx.createRadialGradient(W * 0.5, 0, 0, W * 0.5, 0, H * 0.5)
  grad.addColorStop(0, 'rgba(160, 190, 220, 0.04)')
  grad.addColorStop(0.3, 'rgba(140, 170, 200, 0.02)')
  grad.addColorStop(1, 'rgba(140, 170, 200, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)
}

// ============ 深渊光 ============
// 水下隐约的光晕，让水体更有深度
function drawDepthGlow() {
  const grad = ctx.createRadialGradient(W * 0.3, H * 0.7, 0, W * 0.3, H * 0.7, H * 0.6)
  grad.addColorStop(0, 'rgba(60, 100, 150, 0.02)')
  grad.addColorStop(0.5, 'rgba(40, 80, 130, 0.015)')
  grad.addColorStop(1, 'rgba(30, 60, 100, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)
}

// ============ 渲染循环 ============
function animate() {
  ctx.clearRect(0, 0, W, H)

  time += 1

  // 1. 水面底色
  drawWaterBase()

  // 2. 水体深度光晕
  drawDepthGlow()

  // 3. 水底焦散光纹
  caustics.forEach(c => { c.update(); c.draw() })

  // 4. 水面波纹纹理
  drawWaterTexture()

  // 5. 水面辉光
  drawSurfaceGlow()

  // 6. 涟漪（绘制在纹理之上）
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i]
    r.update()
    r.draw()
    if (!r.alive) ripples.splice(i, 1)
  }

  // 7. 雨滴溅射点（在涟漪之上）
  for (let i = rainImpacts.length - 1; i >= 0; i--) {
    const imp = rainImpacts[i]
    imp.draw()
    if (!imp.update()) rainImpacts.splice(i, 1)
  }

  // 产生新的雨滴溅射
  for (let i = 0; i < RAIN_RATE; i++) {
    if (Math.random() < 0.4) {
      const imp = new RainImpact()
      rainImpacts.push(imp)
      // 入水时产生涟漪
      if (Math.random() < 0.3) {
        ripples.push(new Ripple(imp.x, imp.y, 'rain'))
      }
    }
  }

  // 随机自然涟漪（全屏自然分布）
  if (ripples.filter(r => r.type === 'auto').length < 25 && ripples.length < 50 && Math.random() < 0.008) {
    ripples.push(new Ripple(
      Math.random() * W,
      Math.random() * H,
      'auto'
    ))
  }

  animationId = requestAnimationFrame(animate)
}

// ============ 交互 ============
function handleClick(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  // 点击涟漪
  ripples.push(new Ripple(x, y, 'click'))
}

function handleMouseMove(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  if (Math.random() < 0.05) {
    ripples.push(new Ripple(x, y, 'auto'))
  }
}

// ============ 初始化 ============
function init() {
  const canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  resize()
  for (let i = 0; i < CAUSTIC_COUNT; i++) caustics.push(new Caustic())
  // 预填充一些涟漪
  for (let i = 0; i < 4; i++) {
    ripples.push(new Ripple(Math.random() * W, Math.random() * H, 'auto'))
  }
}

function resize() {
  const canvas = canvasRef.value
  W = window.innerWidth
  H = window.innerHeight
  canvas.width = W
  canvas.height = H
}

onMounted(() => {
  init()
  window.addEventListener('resize', resize)
  animate()
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #1a1a2e;
}

#app {
  width: 100%;
  height: 100%;
}

.water-scene {
  width: 100vw;
  height: 100vh;
  position: relative;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
</style>
