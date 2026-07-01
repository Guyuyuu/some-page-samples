<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const canvasRef = ref(null)
let animId = null
let activeBolts = []
let skyFlash = 0

// ─── 分形闪电：中点位移算法 ───

function generatePoints(x1, y1, x2, y2, displace, branchChance) {
  const pts = []
  if (displace < 2) {
    pts.push({ x: x2, y: y2 })
    return pts
  }

  const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displace
  const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displace

  pts.push(...generatePoints(x1, y1, midX, midY, displace * 0.6, branchChance))
  pts.push(...generatePoints(midX, midY, x2, y2, displace * 0.6, branchChance))

  if (Math.random() < branchChance && displace > 10) {
    const bx = midX + (Math.random() - 0.5) * displace * 1.5
    const by = midY + (Math.random() + 0.5) * displace * 1.5
    pts.push(...generatePoints(midX, midY, bx, by, displace * 0.5, branchChance * 0.6))
  }

  return pts
}

function createBolt(width, height) {
  const startX = width * (0.15 + Math.random() * 0.7)
  const startY = height * (0.03 + Math.random() * 0.08)
  const endX = width * (0.2 + Math.random() * 0.6)
  const endY = height * (0.6 + Math.random() * 0.25)

  const points = generatePoints(startX, startY, endX, endY, 80, 0.35)

  return {
    startX, startY,
    points,
    life: 0,
    maxLife: 50 + Math.random() * 6,      // 12~18 帧 ≈ 0.2~0.3 秒
    flashStrength: 0.5 + Math.random() * 0.5
  }
}

// ─── 绘制单帧闪电 ───

function drawBolt(ctx, bolt) {
  const { startX, startY, points, life, maxLife, flashStrength } = bolt
  const t = life / maxLife            // 0→1

  // 极快亮起，指数衰减
  const opacity = t < 0.1
    ? t / 0.1
    : Math.pow(1 - (t - 0.1) / 0.85, 1.8)

  if (opacity < 0.01) return

 // 辉光层
  ctx.save()
  ctx.globalAlpha = opacity * 0.35 * flashStrength // 辉光层透明度
  ctx.shadowColor = '#8aaaff'
  ctx.shadowBlur = 5 // 辉光层模糊度
  ctx.strokeStyle = '#b8c8ff'
  ctx.lineWidth = 5 // 辉光层线宽
  ctx.lineCap = 'round'   
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  points.forEach(p => ctx.lineTo(p.x, p.y))
  ctx.stroke()
  ctx.restore()

  // 核心亮白层
  ctx.save()
  ctx.globalAlpha = opacity * flashStrength
  ctx.shadowColor = '#ffffff'
  ctx.shadowBlur = 12
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  points.forEach(p => ctx.lineTo(p.x, p.y))
  ctx.stroke()
  ctx.restore()
}

// ─── 绘制背景（渐变天空 + 星星） ───

const stars = []

function initStars(width, height) {
  stars.length = 0
  for (let i = 0; i < 60; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height * 0.45,
      size: 0.5 + Math.random() * 1,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.2 + Math.random() * 0.5
    })
  }
}

function drawSky(ctx, width, height, now) {
  // 紫色到深蓝色渐变（暗化）
  const grad = ctx.createLinearGradient(0, 0, 0, height)
  grad.addColorStop(0,    '#1a0a2e')
  grad.addColorStop(0.25, '#2d1b4e')
  grad.addColorStop(0.45, '#3d2a6b')
  grad.addColorStop(0.60, '#2a1f5c')
  grad.addColorStop(0.80, '#151040')
  grad.addColorStop(1,    '#0c0720')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  // 星星
  for (const s of stars) {
    const twinkle = 0.4 + 0.6 * Math.sin(now / 2000 + s.phase)
    ctx.save()
    ctx.globalAlpha = s.alpha * twinkle
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // 天空泛白闪烁（闪电照亮夜空）
  if (skyFlash > 0.01) {
    ctx.save()
    ctx.fillStyle = `rgba(160, 175, 255, ${skyFlash * 0.12})`
    ctx.fillRect(0, 0, width, height)
    ctx.restore()
    skyFlash *= 0.82
  }
}

// ─── 动画循环 ───

function animate(now) {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  drawSky(ctx, w, h, now)

  // 更新 & 绘制闪电
  activeBolts = activeBolts.filter(b => {
    b.life++
    if (b.life > b.maxLife) return false
    drawBolt(ctx, b)
    return true
  })

  animId = requestAnimationFrame(animate)
}

// ─── 闪电调度 ───

function spawnBolt() {
  const canvas = canvasRef.value
  if (!canvas) return
  const b = createBolt(canvas.width, canvas.height)
  activeBolts.push(b)
  skyFlash = b.flashStrength            // 触发天空闪烁
}

let spawnTimer = null

function schedule() {
  const delay = 2000 + Math.random() * 5000    // 2~7 秒
  spawnTimer = setTimeout(() => {
    if (!canvasRef.value) return
    // 偶尔一次多道闪电
    const count = Math.random() < 0.25 ? 2 + Math.floor(Math.random() * 2) : 1
    for (let i = 0; i < count; i++) {
      setTimeout(spawnBolt, i * (60 + Math.random() * 80))
    }
    schedule()
  }, delay)
}

// ─── 生命周期 ───

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  initStars(canvas.width, canvas.height)
  animId = requestAnimationFrame(animate)
  schedule()

  // 首道闪电快速出场
  setTimeout(spawnBolt, 400)

  const onResize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    initStars(canvas.width, canvas.height)
  }
  window.addEventListener('resize', onResize)

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
    if (animId) cancelAnimationFrame(animId)
    if (spawnTimer) clearTimeout(spawnTimer)
    activeBolts = []
  })
})
</script>

<template>
  <canvas ref="canvasRef" class="storm-canvas" />
</template>

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
  background: #0c0720;
}

#app {
  width: 100%;
  height: 100%;
}

.storm-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
