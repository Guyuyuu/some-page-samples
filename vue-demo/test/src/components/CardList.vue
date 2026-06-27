<script setup lang="ts">
import { ref, computed, watch } from 'vue'

/* ============================================
 * 类型定义
 * ============================================ */
interface CardItem {
  id: number
  title: string
  description: string
  category: string
  tags: string[]
  image: string
  date: string
}

/* ============================================
 * 模拟数据
 * ============================================ */
const allCards = ref<CardItem[]>([
  {
    id: 1,
    title: 'Vue 3 组合式 API 指南',
    description: '深入理解 Vue 3 的 Composition API，包括 ref、reactive、computed 和 watch 等核心 API 的使用技巧与最佳实践。',
    category: '前端',
    tags: ['Vue', 'JavaScript', 'TypeScript'],
    image: 'https://picsum.photos/seed/vue3/400/240',
    date: '2026-05-20',
  },
  {
    id: 2,
    title: 'Tailwind CSS 实战技巧',
    description: '掌握 Tailwind CSS 的响应式设计、暗色模式、自定义主题等进阶用法，提升开发效率。',
    category: 'CSS',
    tags: ['Tailwind', 'CSS', '响应式'],
    image: 'https://picsum.photos/seed/tailwind/400/240',
    date: '2026-05-10',
  },
  {
    id: 3,
    title: 'TypeScript 类型体操',
    description: '从基础类型到高级类型体操，系统学习 TypeScript 的类型系统，让你的代码更安全。',
    category: '后端',
    tags: ['TypeScript', '类型系统'],
    image: 'https://picsum.photos/seed/typescript/400/240',
    date: '2026-05-08',
  },
  {
    id: 4,
    title: 'Node.js 性能优化',
    description: '分析 Node.js 应用性能瓶颈，介绍常见优化策略，包括事件循环、内存管理和集群模式。',
    category: '后端',
    tags: ['Node.js', '性能', '后端'],
    image: 'https://picsum.photos/seed/nodejs/400/240',
    date: '2026-04-28',
  },
  {
    id: 5,
    title: 'CSS Grid 布局完全攻略',
    description: '从入门到精通 CSS Grid 布局，涵盖网格容器、网格项目、命名区域等全部知识点。',
    category: 'CSS',
    tags: ['CSS', 'Grid', '布局'],
    image: 'https://picsum.photos/seed/cssgrid/400/240',
    date: '2026-04-20',
  },
  {
    id: 6,
    title: 'Vite 构建优化实践',
    description: '学习 Vite 的构建优化策略，从代码分割到 tree-shaking，让构建产物更小更快。',
    category: '前端',
    tags: ['Vite', '构建', '性能'],
    image: 'https://picsum.photos/seed/vite/400/240',
    date: '2026-04-15',
  },
  {
    id: 7,
    title: 'Docker 容器化部署',
    description: '使用 Docker 和 Docker Compose 对前端项目进行容器化部署，实现环境一致性和快速交付。',
    category: '运维',
    tags: ['Docker', '部署', 'DevOps'],
    image: 'https://picsum.photos/seed/docker/400/240',
    date: '2026-04-10',
  },
  {
    id: 8,
    title: 'React vs Vue 深度对比',
    description: '从设计理念、性能、生态、学习曲线等维度对 React 和 Vue 进行全面的对比分析。',
    category: '前端',
    tags: ['React', 'Vue', '对比'],
    image: 'https://picsum.photos/seed/compare/400/240',
    date: '2026-04-05',
  },
])

/* ============================================
 * 唯一分类列表（用于分类筛选）
 * ============================================ */
const categories = computed<string[]>(() => {
  const set = new Set(allCards.value.map((c) => c.category))
  return Array.from(set)
})

/* ============================================
 * 响应式状态
 * ============================================ */
const searchQuery = ref('')
const activeCategory = ref('全部')
const sortBy = ref<'date' | 'title'>('date')

/* ============================================
 * 计算属性：过滤 + 排序后的卡片列表
 * ============================================ */
const filteredCards = computed(() => {
  let list = [...allCards.value]

  // 分类筛选
  if (activeCategory.value !== '全部') {
    list = list.filter((card) => card.category === activeCategory.value)
  }

  // 关键词搜索（匹配标题、描述、标签）
  const keyword = searchQuery.value.trim().toLowerCase()
  if (keyword) {
    list = list.filter(
      (card) =>
        card.title.toLowerCase().includes(keyword) ||
        card.description.toLowerCase().includes(keyword) ||
        card.tags.some((tag) => tag.toLowerCase().includes(keyword)),
    )
  }

  // 排序
  list.sort((a, b) => {
    if (sortBy.value === 'date') {
      return b.date.localeCompare(a.date)
    }
    return a.title.localeCompare(b.title, 'zh-CN')
  })

  return list
})

/* ============================================
 * 方法
 * ============================================ */
function setCategory(category: string) {
  activeCategory.value = category
}

function clearSearch() {
  searchQuery.value = ''
}

/* ============================================
 * 监听器
 * ============================================ */
watch(searchQuery, (newVal, oldVal) => {
  console.log(
  `搜索关键词："${oldVal}"→"${newVal}"`,
  `| 当前匹配${filteredCards.value.length}篇文章`
  )
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-10 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <!-- 页面标题 -->
      <div class="mb-10 text-center">
        <h1 class="text-4xl font-bold tracking-tight text-gray-900">📚 技术文章库</h1>
        <p class="mt-2 text-lg text-gray-500">浏览、搜索和筛选你感兴趣的技术文章</p>
      </div>

      <!-- 搜索与控制栏 -->
      <div class="mb-8 space-y-4">
        <!-- 搜索框 -->
        <div class="relative mx-auto max-w-2xl">
          <div
            class="flex items-center rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/5 transition-all duration-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-200"
          >
            <!-- 搜索图标 -->
            <svg
              class="ml-4 h-5 w-5 flex-shrink-0 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索文章标题、描述或标签…"
              class="w-full border-none bg-transparent px-3 py-3.5 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
            />
            <!-- 清除按钮 -->
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="mr-2 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="清除搜索"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 分类标签 + 排序 -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <!-- 分类标签 -->
          <div class="flex flex-wrap items-center gap-2">
            <button
              @click="setCategory('全部')"
              :class="[
                'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200',
                activeCategory === '全部'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:ring-gray-300',
              ]"
            >
              全部
            </button>
            <!-- 快捷筛选：仅看前端 -->
            <button
              @click="setCategory('前端')"
              :class="[
                'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200',
                activeCategory === '前端'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-white text-emerald-600 ring-1 ring-emerald-300 hover:bg-emerald-50 hover:ring-emerald-400',
              ]"
            >
              仅看前端
            </button>
            <button
              v-for="cat in categories"
              :key="cat"
              @click="setCategory(cat)"
              :class="[
                'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200',
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:ring-gray-300',
              ]"
            >
              {{ cat }}
            </button>
          </div>

          <!-- 排序 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-500">排序：</label>
            <select
              v-model="sortBy"
              class="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="date">最新发布</option>
              <option value="title">按标题</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 结果统计 -->
      <div class="mb-4 text-sm text-gray-500">
        <template v-if="filteredCards.length === 0">
          没有找到匹配的文章
        </template>
        <template v-else>
          共找到 <span class="font-semibold text-indigo-600">{{ filteredCards.length }}</span> 篇文章
          <span v-if="searchQuery.trim()">（关键词："{{ searchQuery.trim() }}"）</span>
        </template>
      </div>

      <!-- 空状态 -->
      <div
        v-if="filteredCards.length === 0"
        class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 py-20"
      >
        <svg class="mb-4 h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="text-lg font-medium text-gray-400">暂无匹配内容</p>
        <p class="mt-1 text-sm text-gray-300">试试其他关键词或分类</p>
      </div>

      <!-- 卡片网格 -->
      <div
        v-if="filteredCards.length > 0"
        class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div
          v-for="card in filteredCards"
          :key="card.id"
          class="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <!-- 卡片图片 -->
          <div class="relative h-40 overflow-hidden bg-gray-100 sm:h-44">
            <img
              :src="card.image"
              :alt="card.title"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <!-- 分类角标 -->
            <span
              class="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm"
            >
              {{ card.category }}
            </span>
          </div>

          <!-- 卡片内容 -->
          <div class="flex flex-1 flex-col p-5">
            <!-- 标题 -->
            <h3 class="text-base font-semibold leading-snug text-gray-900 transition-colors group-hover:text-indigo-600">
              {{ card.title }}
            </h3>

            <!-- 描述 -->
            <p class="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">
              {{ card.description }}
            </p>

            <!-- 标签 -->
            <div class="mt-3 flex flex-wrap gap-1.5">
              <span
                v-for="tag in card.tags"
                :key="tag"
                class="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-700/10"
              >
                {{ tag }}
              </span>
            </div>

            <!-- 底部信息 -->
            <div class="mt-auto flex items-center justify-between pt-4">
              <span class="text-xs text-gray-400">{{ card.date }}</span>
              <span
                class="inline-flex items-center text-xs font-medium text-indigo-500 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5"
              >
                阅读更多
                <svg class="ml-0.5 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
