<template>
  <div class="flex h-screen bg-gray-50">
    <!-- 侧边栏 -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span class="text-lg font-bold text-gray-800">VueDash</span>
      </div>

      <!-- 导航菜单 -->
      <nav class="flex-1 px-4 py-4 space-y-1">
        <a v-for="item in navItems" :key="item.name"
           :class="[
             'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
             item.active
               ? 'bg-indigo-50 text-indigo-700'
               : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
           ]"
           href="#"
           @click.prevent="activeNav = item.name">
          <component :is="item.icon" class="w-5 h-5" />
          {{ item.label }}
          <span v-if="item.badge"
                class="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full"
                :class="item.badge === 'NEW' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
            {{ item.badge }}
          </span>
        </a>
      </nav>

      <!-- 底部用户信息 -->
      <div class="border-t border-gray-100 px-4 py-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium shadow-sm">
            张三
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800 truncate">张三</p>
            <p class="text-xs text-gray-500 truncate">zhangsan@example.com</p>
          </div>
          <button class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶部导航 -->
      <header class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-semibold text-gray-800">{{ currentPageTitle }}</h1>
          <div class="hidden sm:flex items-center gap-1 text-xs text-gray-400">
            <span>仪表板</span>
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" /></svg>
            <span class="text-gray-600">{{ currentPageTitle }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <!-- 搜索 -->
          <div class="relative hidden md:block">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="搜索..." class="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent w-56 transition-all" v-model="searchQuery">
          </div>
          <!-- 通知 -->
          <button class="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all" @click="showNotifications = !showNotifications">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <!-- 主题切换 -->
          <button class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all" @click="toggleDark">
            <svg v-if="!isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>
          <!-- 头像（移动端显示） -->
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium sm:hidden">
            张
          </div>
        </div>
      </header>

      <!-- 页面内容 -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- 统计卡片 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div v-for="stat in stats" :key="stat.label"
               class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium text-gray-500">{{ stat.label }}</span>
              <div :class="stat.iconBg" class="w-10 h-10 rounded-lg flex items-center justify-center">
                <component :is="stat.icon" class="w-5 h-5" :class="stat.iconColor" />
              </div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-bold text-gray-800">{{ stat.value }}</span>
              <span :class="stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'"
                    class="text-sm font-medium flex items-center gap-0.5">
                <svg v-if="stat.change.startsWith('+')" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
                <svg v-else class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                {{ stat.change }}
              </span>
            </div>
            <p class="mt-1 text-xs text-gray-400">{{ stat.subtitle }}</p>
          </div>
        </div>

        <!-- 图表 & 活动 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <!-- 图表区域 -->
          <div class="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-semibold text-gray-800">月度收入趋势</h3>
              <div class="flex items-center gap-2">
                <select class="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        v-model="selectedMonth">
                  <option value="6">最近6个月</option>
                  <option value="12">最近12个月</option>
                  <option value="24">最近24个月</option>
                </select>
              </div>
            </div>
            <!-- 柱状图 -->
            <div class="flex items-end justify-between gap-2 h-48 pt-2 pb-1">
              <div v-for="(item, idx) in chartData" :key="idx"
                   class="flex-1 flex flex-col items-center gap-1.5 group">
                <div class="relative w-full flex justify-center">
                  <div class="w-full mx-0.5 rounded-t-md transition-all duration-500 ease-out cursor-pointer group-hover:opacity-80"
                       :style="{ height: item.height + 'px', background: item.color }"
                       @mouseenter="hoveredBar = idx"
                       @mouseleave="hoveredBar = null">
                  </div>
                  <!-- Tooltip -->
                  <div v-if="hoveredBar === idx"
                       class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                    ¥{{ item.value.toLocaleString() }}
                  </div>
                </div>
                <span class="text-xs text-gray-400">{{ item.label }}</span>
              </div>
            </div>
          </div>

          <!-- 最近活动 -->
          <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-semibold text-gray-800">最近活动</h3>
              <a href="#" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium" @click.prevent>查看全部</a>
            </div>
            <div class="space-y-4">
              <div v-for="(activity, idx) in recentActivities" :key="idx" class="flex gap-3">
                <div class="relative flex flex-col items-center">
                  <div :class="activity.dotColor"
                       class="w-2.5 h-2.5 rounded-full ring-2 ring-white mt-1.5">
                  </div>
                  <div v-if="idx !== recentActivities.length - 1" class="w-px flex-1 bg-gray-200 mt-1"></div>
                </div>
                <div class="flex-1 min-w-0 pb-4">
                  <p class="text-sm text-gray-700">{{ activity.text }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 表格与待办 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- 订单表格 -->
          <div class="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 class="text-base font-semibold text-gray-800">最近订单</h3>
              <div class="flex items-center gap-3">
                <span class="text-xs text-gray-400">共 {{ orders.length }} 条</span>
                <button class="text-xs text-indigo-600 hover:text-indigo-800 font-medium" @click="exportData">导出</button>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-50">
                    <th class="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">订单</th>
                    <th class="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">客户</th>
                    <th class="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">金额</th>
                    <th class="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">状态</th>
                    <th class="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="order in visibleOrders" :key="order.id"
                      class="hover:bg-gray-50/50 transition-colors">
                    <td class="px-5 py-3.5 text-sm font-medium text-gray-800">#{{ order.id }}</td>
                    <td class="px-5 py-3.5">
                      <div class="flex items-center gap-2.5">
                        <div class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                          {{ order.customer.charAt(0) }}
                        </div>
                        <span class="text-sm text-gray-600">{{ order.customer }}</span>
                      </div>
                    </td>
                    <td class="px-5 py-3.5 text-sm font-medium text-gray-800">¥{{ order.amount.toLocaleString() }}</td>
                    <td class="px-5 py-3.5">
                      <span :class="statusStyles[order.status]"
                            class="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full">
                        <span class="w-1.5 h-1.5 rounded-full" :class="statusDotStyles[order.status]"></span>
                        {{ statusLabels[order.status] }}
                      </span>
                    </td>
                    <td class="px-5 py-3.5 text-right">
                      <button class="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                              @click="viewOrder(order)">
                        详情
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="orders.length > 4" class="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <button class="text-xs text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                      @click="showAllOrders = !showAllOrders">
                {{ showAllOrders ? '收起' : `查看全部 ${orders.length} 条` }}
                <svg class="w-3 h-3" :class="{ 'rotate-180': showAllOrders }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 待办事项 -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-semibold text-gray-800">待办事项</h3>
              <span class="text-xs text-gray-400">{{ todos.filter(t => !t.done).length }} 项未完成</span>
            </div>
            <div class="space-y-2 mb-4">
              <div v-for="(todo, idx) in todos" :key="idx"
                   class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                <input type="checkbox"
                       :checked="todo.done"
                       @change="toggleTodo(idx)"
                       class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer">
                <span :class="{ 'line-through text-gray-300': todo.done }"
                      class="text-sm text-gray-700 flex-1">
                  {{ todo.text }}
                </span>
                <button class="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 transition-all"
                        @click="removeTodo(idx)">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- 添加待办 -->
            <form @submit.prevent="addTodo" class="flex gap-2">
              <input type="text" v-model="newTodo"
                     placeholder="添加新待办..."
                     class="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent">
              <button type="submit" :disabled="!newTodo.trim()"
                      class="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>

    <!-- 通知弹出 -->
    <Transition name="slide">
      <div v-if="showNotifications"
           class="fixed right-4 top-16 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h4 class="text-sm font-semibold text-gray-800">通知</h4>
          <button class="text-xs text-indigo-600 hover:text-indigo-800 font-medium" @click="showNotifications = false">关闭</button>
        </div>
        <div class="divide-y divide-gray-50 max-h-80 overflow-y-auto">
          <div v-for="(notif, idx) in notifications" :key="idx" class="px-4 py-3 hover:bg-gray-50 transition-colors">
            <p class="text-sm text-gray-700">{{ notif.text }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ notif.time }}</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 订单详情 Modal -->
    <Transition name="fade">
      <div v-if="selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="selectedOrder = null">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
        <div class="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800">订单详情 #{{ selectedOrder.id }}</h3>
            <button class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    @click="selectedOrder = null">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between py-2 border-b border-gray-50">
              <span class="text-sm text-gray-500">客户</span>
              <span class="text-sm font-medium text-gray-800">{{ selectedOrder.customer }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-50">
              <span class="text-sm text-gray-500">金额</span>
              <span class="text-sm font-medium text-gray-800">¥{{ selectedOrder.amount.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-50">
              <span class="text-sm text-gray-500">状态</span>
              <span :class="statusStyles[selectedOrder.status]"
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full">
                <span class="w-1.5 h-1.5 rounded-full" :class="statusDotStyles[selectedOrder.status]"></span>
                {{ statusLabels[selectedOrder.status] }}
              </span>
            </div>
          </div>
          <div class="mt-6 flex gap-2 justify-end">
            <button class="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    @click="selectedOrder = null">关闭</button>
            <button class="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">确认</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ============ 导航 ============
const activeNav = ref('dashboard')

const navItems = [
  { name: 'dashboard', label: '仪表板', icon: 'ChartIcon', active: true },
  { name: 'analytics', label: '数据分析', icon: 'AnalyticsIcon', active: false },
  { name: 'products', label: '产品管理', icon: 'ProductIcon', active: false, badge: 'NEW' },
  { name: 'orders', label: '订单管理', icon: 'OrderIcon', active: false },
  { name: 'customers', label: '客户管理', icon: 'CustomerIcon', active: false },
  { name: 'settings', label: '系统设置', icon: 'SettingsIcon', active: false },
]

const currentPageTitle = computed(() => {
  const item = navItems.find(i => i.name === activeNav.value)
  return item ? item.label : '仪表板'
})

// ============ 搜索 ============
const searchQuery = ref('')

// ============ 数据统计 ============
const stats = [
  {
    label: '总营收',
    value: '¥128,430',
    change: '+12.5%',
    subtitle: '较上月增长',
    icon: 'RevenueIcon',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    label: '活跃用户',
    value: '2,846',
    change: '+8.2%',
    subtitle: '较上月增长',
    icon: 'UsersIcon',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    label: '订单量',
    value: '486',
    change: '-3.1%',
    subtitle: '较上月下降',
    icon: 'ShoppingIcon',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    label: '转化率',
    value: '3.24%',
    change: '+1.8%',
    subtitle: '较上月增长',
    icon: 'ConversionIcon',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
]

// ============ 图表数据 ============
const selectedMonth = ref('6')
const hoveredBar = ref(null)

const chartData = computed(() => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const values = [28500, 32000, 29800, 35000, 41200, 38500, 42000, 39800, 45000, 48000, 52000, 55000]
  const colors = [
    'linear-gradient(to top, #818cf8, #a78bfa)',
    'linear-gradient(to top, #818cf8, #a78bfa)',
    'linear-gradient(to top, #818cf8, #a78bfa)',
    'linear-gradient(to top, #818cf8, #a78bfa)',
    'linear-gradient(to top, #818cf8, #a78bfa)',
    'linear-gradient(to top, #818cf8, #a78bfa)',
    'linear-gradient(to top, #818cf8, #a78bfa)',
    'linear-gradient(to top, #818cf8, #a78bfa)',
    'linear-gradient(to top, #818cf8, #a78bfa)',
    'linear-gradient(to top, #818cf8, #a78bfa)',
    'linear-gradient(to top, #818cf8, #a78bfa)',
    'linear-gradient(to top, #818cf8, #a78bfa)',
  ]
  const count = parseInt(selectedMonth.value)
  const sliced = months.slice(-count)
  const valSlice = values.slice(-count)
  const max = Math.max(...valSlice)
  return sliced.map((label, i) => ({
    label,
    value: valSlice[i],
    height: (valSlice[i] / max) * 160,
    color: colors[values.indexOf(valSlice[i])] || 'linear-gradient(to top, #818cf8, #a78bfa)',
  }))
})

// ============ 最近活动 ============
const recentActivities = [
  { text: '新用户 "李四" 完成了注册', time: '2 分钟前', dotColor: 'bg-green-500' },
  { text: '订单 #12458 已完成支付', time: '15 分钟前', dotColor: 'bg-blue-500' },
  { text: '系统备份已完成', time: '1 小时前', dotColor: 'bg-indigo-500' },
  { text: '新产品 "无线耳机 Pro" 已上架', time: '3 小时前', dotColor: 'bg-purple-500' },
]

// ============ 订单 ============
const showAllOrders = ref(false)

const orders = [
  { id: 12458, customer: '王小明', amount: 1299, status: 'completed' },
  { id: 12457, customer: '李芳华', amount: 599, status: 'processing' },
  { id: 12456, customer: '张伟强', amount: 2499, status: 'pending' },
  { id: 12455, customer: '赵丽颖', amount: 899, status: 'completed' },
  { id: 12454, customer: '陈志远', amount: 1799, status: 'processing' },
  { id: 12453, customer: '刘思琪', amount: 349, status: 'cancelled' },
  { id: 12452, customer: '周杰伦', amount: 4599, status: 'completed' },
  { id: 12451, customer: '吴敏霞', amount: 1299, status: 'pending' },
]

const statusLabels = {
  completed: '已完成',
  processing: '处理中',
  pending: '待处理',
  cancelled: '已取消',
}

const statusStyles = {
  completed: 'bg-green-50 text-green-700',
  processing: 'bg-blue-50 text-blue-700',
  pending: 'bg-yellow-50 text-yellow-700',
  cancelled: 'bg-red-50 text-red-700',
}

const statusDotStyles = {
  completed: 'bg-green-500',
  processing: 'bg-blue-500',
  pending: 'bg-yellow-500',
  cancelled: 'bg-red-500',
}

const visibleOrders = computed(() => showAllOrders.value ? orders : orders.slice(0, 4))

const selectedOrder = ref(null)

function viewOrder(order) {
  selectedOrder.value = order
}

function exportData() {
  alert('数据导出功能（演示）')
}

// ============ 待办事项 ============
const newTodo = ref('')
const todos = ref([
  { text: '完成月度销售报告', done: false },
  { text: '审核产品上架申请', done: true },
  { text: '安排团队周会', done: false },
  { text: '更新系统文档', done: false },
])

function toggleTodo(idx) {
  todos.value[idx].done = !todos.value[idx].done
}

function removeTodo(idx) {
  todos.value.splice(idx, 1)
}

function addTodo() {
  if (!newTodo.value.trim()) return
  todos.value.push({ text: newTodo.value.trim(), done: false })
  newTodo.value = ''
}

// ============ 主题 ============
const isDark = ref(false)

function toggleDark() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark')
}

// ============ 通知 ============
const showNotifications = ref(false)

const notifications = [
  { text: '新订单 #12459 已创建', time: '5 分钟前' },
  { text: '用户 "赵丽颖" 提交了退款申请', time: '30 分钟前' },
  { text: '系统更新 v2.4.0 已部署', time: '1 小时前' },
  { text: '库存预警：无线耳机库存不足', time: '2 小时前' },
]

// ============ SVG 图标组件 ============
const ChartIcon = {
  template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>'
}

const AnalyticsIcon = {
  template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>'
}

const ProductIcon = {
  template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>'
}

const OrderIcon = {
  template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>'
}

const CustomerIcon = {
  template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>'
}

const SettingsIcon = {
  template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>'
}

// 统计卡片图标
const RevenueIcon = {
  template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
}

const UsersIcon = {
  template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>'
}

const ShoppingIcon = {
  template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>'
}

const ConversionIcon = {
  template: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>'
}
</script>

<style>
/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active {
  transition: all 0.3s ease-out;
}
.slide-leave-active {
  transition: all 0.2s ease-in;
}
.slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
