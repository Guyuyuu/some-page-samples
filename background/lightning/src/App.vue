<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let animationId = null
let bolts = []
let flashOpacity = 0

// 递归生成闪电路径（分形效果）
function generateBolt(x1, y1, x2, y2, detail = 0) {
  const points = []
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx * dx + dy * dy)
  const segments = Math.max(6, Math.floor(dist / 20))

  points.push({ x: x1, y: y1 })
  for (let i = 1; i < segments; i++) {
    const t = i / segments
    const baseX = x1 + dx * t
    const baseY = y1 + dy * t
    const offset = (dist / 12) * (1 - t * 0.6) * (Math.random() - 0.5) * 2
    const perpX = -dy / dist
    const perpY = dx / dist
    points.push({
      x: baseX + perpX * offset + (Math.random() - 0.5) * 8,
      y: baseY + perpY * offset * 0.3 + (Math.random() - 0.5) * 6
    })
  }
  points.push({ x: x2, y: y2 })

  // 生成分支
  const branches = []
  if (detail < 3 && Math.random() < 0.6) {
    const branchIdx = Math.floor(Math.random() * (points.length - 4)) + 2
    const bp = points[branchIdx]
    const branchLen = dist * (0.15 + Math.random() * 0.3)
    const angle = (Math.random() - 0.5) * Math.PI * 0.8
    const endX = bp.x + Math.cos(angle) * branchLen * (Math.random() > 0.5 ? 1 : -1)
    const endY = bp.y + Math.abs(Math.sin(angle)) * branchLen * 0.6 + branchLen * 0.3
    branches.push({
      data: generateBolt(bp.x, bp.y, endX, endY, detail + 1), // 与主bolt结构一致
      delay: Math.random() * 30
    })
  }

  return { trunk: points, branches }
}

function drawBolt(ctx, boltData, life, maxLife) {
  const progress = life / maxLife
  // 快速亮起（前15%），然后指数衰减缓慢熄灭
  const opacity = progress < 0.15
    ? Math.pow(progress / 0.15, 1.5)
    : Math.pow(1 - (progress - 0.15) / 0.85, 0.6)
  if (opacity <= 0.01) return

  const { trunk, branches } = boltData

  // 外层辉光
  ctx.save()
  ctx.globalAlpha = opacity * 0.4
  ctx.strokeStyle = '#b8c0ff'
  ctx.lineWidth = 18
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.shadowColor = '#8888ff'
  ctx.shadowBlur = 40
  ctx.beginPath()
  ctx.moveTo(trunk[0].x, trunk[0].y)
  for (let i = 1; i < trunk.length; i++) {
    ctx.lineTo(trunk[i].x, trunk[i].y)
  }
  ctx.stroke()
  ctx.restore()

  // 内层辉光
  ctx.save()
  ctx.globalAlpha = opacity * 0.6
  ctx.strokeStyle = '#d0d8ff'
  ctx.lineWidth = 8
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.shadowColor = '#aaaaff'
  ctx.shadowBlur = 20
  ctx.beginPath()
  ctx.moveTo(trunk[0].x, trunk[0].y)
  for (let i = 1; i < trunk.length; i++) {
    ctx.lineTo(trunk[i].x, trunk[i].y)
  }
  ctx.stroke()
  ctx.restore()

  // 核心亮白
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.shadowColor = '#ffffff'
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.moveTo(trunk[0].x, trunk[0].y)
  for (let i = 1; i < trunk.length; i++) {
    ctx.lineTo(trunk[i].x, trunk[i].y)
  }
  ctx.stroke()
  ctx.restore()

  // 绘制分支
  for (const branch of branches) {
    const branchLife = life - branch.delay
    if (branchLife > 0) {
      drawBolt(ctx, branch.data, branchLife, maxLife * 0.7)
    }
  }
}

function drawSky(ctx, w, h) {
  // 主渐变：淡紫色到深蓝
  const gradient = ctx.createLinearGradient(0, 0, 0, h)
  gradient.addColorStop(0, '#d8b4fe')   // 淡紫
  gradient.addColorStop(0.15, '#c084fc') // 紫
  gradient.addColorStop(0.35, '#7c3aed') // 紫罗兰
  gradient.addColorStop(0.55, '#4338ca') // 靛蓝
  gradient.addColorStop(0.75, '#1e3a8a') // 深蓝
  gradient.addColorStop(1, '#0f172a')    // 深蓝黑
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)
}

function drawStars(ctx, w, h) {
  // 在天空上半部分绘制星星
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  for (let i = 0; i < 50; i++) {
    // 使用确定性的星星位置（根据坐标 seed 保持静止）
    const seed = i * 137.508
    const sx = ((seed * 1.1) % w + w) % w
    const sy = ((seed * 0.7) % (h * 0.4)) + (h * 0.02)
    const size = 0.5 + (i % 3) * 0.5
    const twinkle = 0.5 + 0.5 * Math.sin(Date.now() / 2000 + i * 2.7)

    ctx.save()
    ctx.globalAlpha = 0.3 * twinkle
    ctx.beginPath()
    ctx.arc(sx, sy, size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

function drawCloud(ctx, w, h) {
  // 在顶部绘制一些隐约的云层
  ctx.save()
  for (let layer = 0; layer < 3; layer++) {
    const alpha = 0.04 + layer * 0.03
    ctx.fillStyle = `rgba(100, 80, 120, ${alpha})`
    const yBase = 0 + layer * 30
    ctx.beginPath()
    ctx.moveTo(0, yBase + 40)
    for (let x = 0; x <= w; x += 20) {
      const y = yBase + 20 + Math.sin(x * 0.008 + layer * 2) * 15
                 + Math.sin(x * 0.02 + layer * 3) * 8
      ctx.lineTo(x, y)
    }
    ctx.lineTo(w, h)
    ctx.lineTo(0, h)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

function animate() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  // 绘制天空
  drawSky(ctx, w, h)

  // 绘制云层
  drawCloud(ctx, w, h)

  // 绘制星星
  drawStars(ctx, w, h)

  // 天空闪烁效果（闪电照亮天空）
  if (flashOpacity > 0.01) {
    ctx.save()
    ctx.fillStyle = `rgba(180, 190, 255, ${flashOpacity * 0.15})`
    ctx.fillRect(0, 0, w, h)
    ctx.restore()
    flashOpacity *= 0.88
  }

  // 绘制并更新闪电
  bolts = bolts.filter(bolt => {
    bolt.life++
    if (bolt.life > bolt.maxLife) return false
    try {
      drawBolt(ctx, bolt.data, bolt.life, bolt.maxLife)
    } catch (e) {
      // 防止绘制异常导致动画循环中断
      return false
    }
    return true
  })

  animationId = requestAnimationFrame(animate)
}

let spawnTimerId = null

function spawnBolt() {
  const canvas = canvasRef.value
  if (!canvas) return
  const w = canvas.width
  const h = canvas.height

  const startX = 50 + Math.random() * (w - 100)
  const startY = 0
  const endX = startX + (Math.random() - 0.5) * 150
  const endY = h * (0.35 + Math.random() * 0.35)

  const boltData = generateBolt(startX, startY, endX, endY)

  bolts.push({
    data: boltData,
    life: 0,
    maxLife: 60 + Math.random() * 40  // 1~1.7秒持续，更长的消散时间
  })

  // 触发天空闪烁
  flashOpacity = 0.6 + Math.random() * 0.4
}

function scheduleNextBolt() {
  // 随机间隔 1~6 秒
  const delay = 1000 + Math.random() * 5000
  spawnTimerId = setTimeout(() => {
    if (!canvasRef.value) return

    // 有时一次出现多道闪电
    const count = Math.random() < 0.3 ? 2 + Math.floor(Math.random() * 2) : 1
    for (let i = 0; i < count; i++) {
      setTimeout(() => spawnBolt(), i * (80 + Math.random() * 120))
    }

    scheduleNextBolt()
  }, delay)
}

function initCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

function resizeHandler() {
  initCanvas()
}

onMounted(() => {
  initCanvas()
  window.addEventListener('resize', resizeHandler)
  animate()
  // 页面加载后立即触发第一道闪电
  setTimeout(() => spawnBolt(), 300)
  scheduleNextBolt()
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeHandler)
  if (animationId) cancelAnimationFrame(animationId)
  if (spawnTimerId) clearTimeout(spawnTimerId)
  bolts = []
})
</script>

<template>
  <canvas ref="canvasRef" class="sky-canvas" />
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
  background: #0f172a;
}

#app {
  width: 100%;
  height: 100%;
}

.sky-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
