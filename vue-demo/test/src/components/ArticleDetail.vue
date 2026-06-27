<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

interface CardItem {
  id: number
  title: string
  description: string
  category: string
  tags: string[]
  image: string
  date: string
}

const props = defineProps<{
  card: CardItem
}>()

const emit = defineEmits<{
  close: []
}>()

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <!-- 遮罩层 -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    @click="handleOverlayClick"
  >
    <!-- 弹窗卡片 -->
    <div
      class="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-[fadeIn_0.2s_ease-out]"
    >
      <!-- 关闭按钮 -->
      <button
        @click="emit('close')"
        class="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-gray-500 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-gray-800"
        aria-label="关闭"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- 图片 -->
      <div class="relative h-56 overflow-hidden bg-gray-100 sm:h-64">
        <img
          :src="card.image"
          :alt="card.title"
          class="h-full w-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <span
          class="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm"
        >
          {{ card.category }}
        </span>
      </div>

      <!-- 内容区 -->
      <div class="px-6 py-6 sm:px-8 sm:py-8">
        <!-- 标题 -->
        <h2 class="text-2xl font-bold leading-tight text-gray-900">
          {{ card.title }}
        </h2>

        <!-- 日期 -->
        <p class="mt-2 text-sm text-gray-400">发布于 {{ card.date }}</p>

        <!-- 标签 -->
        <div class="mt-4 flex flex-wrap gap-2">
          <span
            v-for="tag in card.tags"
            :key="tag"
            class="inline-flex items-center rounded-lg bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 ring-1 ring-indigo-700/10"
          >
            #{{ tag }}
          </span>
        </div>

        <!-- 分割线 -->
        <hr class="my-6 border-gray-100" />

        <!-- 描述 -->
        <p class="text-base leading-relaxed text-gray-600">
          {{ card.description }}
        </p>

        <!-- 底部按钮 -->
        <div class="mt-8 flex items-center justify-end gap-3">
          <button
            @click="emit('close')"
            class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            关闭
          </button>
          <button
            class="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700"
          >
            阅读全文
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>