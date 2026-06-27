<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import CardList from './components/CardList.vue'

const isDark = ref(localStorage.getItem('theme') === 'dark')

watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
})

function toggleDark() {
  isDark.value = !isDark.value
}
</script>

<template>
  <CardList />

  <!-- 暗色模式切换按钮 -->
  <button
    @click="toggleDark"
    class="fixed bottom-6 right-6 z-50 rounded-full bg-white p-3 shadow-lg ring-1 ring-gray-200 transition-all duration-300 hover:scale-110 hover:shadow-xl dark:bg-gray-800 dark:ring-gray-700"
    :title="isDark ? '切换到亮色模式' : '切换到暗色模式'"
  >
    <!-- 太阳图标（暗色模式下显示） -->
    <svg
      v-if="isDark"
      class="h-6 w-6 text-amber-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
    <!-- 月亮图标（亮色模式下显示） -->
    <svg
      v-else
      class="h-6 w-6 text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  </button>
</template>