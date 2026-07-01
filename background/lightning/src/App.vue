<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const canvasRef = ref(null)
let animId = null
let activeBolts = []
let skyFlash = 0        // 瞬时闪白（快亮快灭）
let ambientGlow = 0     // 环境余晖（云幕照明，缓慢衰减）
let cloudCurtain = null

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
    maxLife: 36 + Math.random() * 24, // 闪电持续时间
    flashStrength: 0.2 + Math.random() * 0.8 // 闪电亮度，范围0.2-1.0
  }
}

// ─── 绘制单帧闪电 ───

function drawBolt(ctx, bolt) {
  const { startX, startY, points, life, maxLife, flashStrength } = bolt
  const t = Math.min(life / maxLife, 1)

  const opacity = t < 0.12
    ? Math.pow(t / 0.12, 1.5)
    : Math.pow(Math.max(0, 1 - (t - 0.12) / 0.88), 2.0)

  if (opacity < 0.005) return

  const alpha = opacity * flashStrength

  ctx.save()
  ctx.globalAlpha = alpha * 0.3
  ctx.shadowColor = '#8aaaff'
  ctx.shadowBlur = 40
  ctx.strokeStyle = '#b8c8ff'
  ctx.lineWidth = 12
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  points.forEach(p => ctx.lineTo(p.x, p.y))
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.shadowColor = '#ffffff'
  ctx.shadowBlur = 10
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

// ─── 生成厚重云幕纹理 ───

function buildCloudCurtain(w, h) {
  const temp = document.createElement('canvas')
  temp.width = w
  temp.height = h
  const tc = temp.getContext('2d')

  tc.fillStyle = '#040208'
  tc.fillRect(0, 0, w, h)

  for (let i = 0; i < 80; i++) {
    const y = (i / 80) * h * 0.9 + (Math.random() - 0.5) * h * 0.06
    const bandH = h * (0.04 + Math.random() * 0.08)
    const alpha = 0.015 + Math.random() * 0.04
    const palette = ['#12082a', '#0e0620', '#1a0e30', '#0c0a20', '#160c2e']
    const color = palette[i % palette.length]

    tc.save()
    tc.globalAlpha = alpha
    tc.fillStyle = color

    const topY = y - bandH / 2
    const botY = y + bandH / 2
    tc.beginPath()
    for (let x = 0; x <= w; x += 3) {
      const wave = Math.sin(x * 0.008 + i * 1.3) * 4 + Math.sin(x * 0.025 + i * 0.7) * 2
      if (x === 0) tc.moveTo(x, topY + wave)
      else tc.lineTo(x, topY + wave)
    }
    for (let x = w; x >= 0; x -= 3) {
      const wave = Math.sin(x * 0.008 + i * 1.3 + 2) * 4 + Math.sin(x * 0.025 + i * 0.7 + 1) * 2
      tc.lineTo(x, botY + wave)
    }
    tc.closePath()
    tc.fill()
    tc.restore()
  }

  for (let i = 0; i < 150; i++) {
    const y = Math.random() * h * 0.8
    const startX = Math.random() * w * 0.15
    const len = w * (0.4 + Math.random() * 0.6)
    const alpha = 0.008 + Math.random() * 0.025

    tc.save()
    tc.globalAlpha = alpha
    tc.strokeStyle = '#1a0e30'
    tc.lineWidth = 2 + Math.random() * 5
    tc.lineCap = 'round'

    const segs = 8 + Math.floor(Math.random() * 12)
    const segLen = len / segs
    let cx = startX, cy = y
    tc.beginPath()
    tc.moveTo(cx, cy)
    for (let s = 0; s < segs; s++) {
      cx += segLen
      cy += (Math.random() - 0.5) * 1.2
      tc.lineTo(cx, cy)
    }
    tc.stroke()
    tc.restore()
  }

  tc.save()
  tc.fillStyle = '#06020e'
  const baseY = h * 0.72
  tc.beginPath()
  tc.moveTo(0, h)
  for (let x = 0; x <= w; x += 3) {
    const wave = Math.sin(x * 0.012 + 1) * 12
               + Math.sin(x * 0.035 + 3) * 5
               + Math.sin(x * 0.006 + 7) * 18
    tc.lineTo(x, baseY + wave)
  }
  tc.lineTo(w, h)
  tc.closePath()
  tc.fill()
  tc.restore()

  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  const oc = off.getContext('2d')
  oc.filter = 'blur(18px)'
  oc.drawImage(temp, 0, 0)
  oc.filter = 'none'

  return off
}

// ─── 绘制背景 ───

function drawSky(ctx, width, height) {
  // 垂直线性渐变基底
  const grad = ctx.createLinearGradient(0, 0, 0, height)
  grad.addColorStop(0,    '#080216')
  grad.addColorStop(0.10, '#0e0622')
  grad.addColorStop(0.25, '#1a0e32')
  grad.addColorStop(0.40, '#281a3e')
  grad.addColorStop(0.55, '#221838')
  grad.addColorStop(0.70, '#14102a')
  grad.addColorStop(0.85, '#0a0818')
  grad.addColorStop(1,    '#040208')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  // ── 云幕纹理（由 ambientGlow 驱动，缓慢渐入渐出） ──
  if (cloudCurtain) {
    // ambientGlow 缓慢攀升和回落，产生渐变照明感
    const baseAlpha = 0.03
    const glowAlpha = Math.min(ambientGlow * 0.45, 0.55)
    const alpha = baseAlpha + glowAlpha

    ctx.save()
    ctx.globalAlpha = alpha
    ctx.drawImage(cloudCurtain, 0, 0)
    ctx.restore()
  }

  // ── 闪白（由 skyFlash 驱动，快速亮起+逐渐消退） ──
  if (skyFlash > 0.001) {
    ctx.save()
    ctx.fillStyle = `rgba(160, 175, 255, ${skyFlash * 0.5})` // 闪白颜色，透明度
    ctx.fillRect(0, 0, width, height)
    ctx.restore()
  // 余晖 （由 ambientGlow 驱动，缓慢渐入渐出）
    ctx.save()
    ctx.fillStyle = `rgba(200, 210, 255, ${skyFlash * 0.1 + ambientGlow * 0.15})` // 闪白颜色，透明度
    ctx.fillRect(0, 0, width, height)
    ctx.restore()
  }

  // ── 更新衰减 ──
  // 闪白快衰减（~0.3 秒消失）
  skyFlash *= 0.78
  // 余晖慢衰减（~1.5~2 秒渐回暗色）
  ambientGlow *= 0.94
}

// ─── 动画循环 ───

function animate() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  drawSky(ctx, w, h)

  activeBolts = activeBolts.filter(b => {
    b.life++
    if (b.life > b.maxLife) return false
    drawBolt(ctx, b)
    return true
  })

  animId = requestAnimationFrame(animate)
}

// ─── 闪电调度 ───

function spawnBolt(triggerFlash = true) {
  const canvas = canvasRef.value
  if (!canvas) return
  const b = createBolt(canvas.width, canvas.height)
  activeBolts.push(b)
  if (triggerFlash) {
    skyFlash = b.flashStrength
    ambientGlow = Math.min(ambientGlow + b.flashStrength * 0.7, 1.0) 
  }
}

let spawnTimer = null

function schedule() {
  const delay = 1000 + Math.random() * 2000 // 闪电间隔随机化
  spawnTimer = setTimeout(() => {
    if (!canvasRef.value) return

    const count = Math.random() < 0.25 ? 2 + Math.floor(Math.random() * 2) : 1
    spawnBolt(true)
    for (let i = 1; i < count; i++) {
      setTimeout(() => spawnBolt(false), i * (60 + Math.random() * 80))
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

  cloudCurtain = buildCloudCurtain(canvas.width, canvas.height)
  animId = requestAnimationFrame(animate)
  schedule()
  setTimeout(() => spawnBolt(true), 400)

  const onResize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    cloudCurtain = buildCloudCurtain(canvas.width, canvas.height)
  }
  window.addEventListener('resize', onResize)

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
    if (animId) cancelAnimationFrame(animId)
    if (spawnTimer) clearTimeout(spawnTimer)
    activeBolts = []
    cloudCurtain = null
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
  background: #040208;
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
