<script setup>
import { ref, onMounted, watch } from 'vue'
import { Layers, Image } from 'lucide-vue-next'
import AppHeader from './components/AppHeader.vue'
import IconGeneratorPanel from './components/IconGeneratorPanel.vue'
import ScreenshotPanel from './components/ScreenshotPanel.vue'

const activeTab = ref('icons')
const isDark = ref(true)

function applyTheme(dark) {
  document.documentElement.classList.toggle('light', !dark)
  document.documentElement.classList.toggle('dark', dark)
}

onMounted(() => {
  const saved = localStorage.getItem('iconforge-theme')
  if (saved === 'light') isDark.value = false
  applyTheme(isDark.value)
})

watch(isDark, (v) => {
  applyTheme(v)
  localStorage.setItem('iconforge-theme', v ? 'dark' : 'light')
})

function toggleTheme() {
  isDark.value = !isDark.value
}

const tabs = [
  { id: 'icons', label: 'App 图标', icon: Layers },
  { id: 'screenshots', label: '上架截图', icon: Image },
]
</script>

<template>
  <div class="relative min-h-screen">
    <div class="pointer-events-none fixed inset-0 bg-grid opacity-40" aria-hidden="true" />

    <AppHeader :is-dark="isDark" @toggle-theme="toggleTheme" />

    <main class="relative mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
      <nav class="mb-6 flex gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1 w-fit">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition"
          :class="
            activeTab === tab.id
              ? 'bg-[var(--color-accent)] text-white shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
          "
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" :size="16" />
          {{ tab.label }}
        </button>
      </nav>

      <IconGeneratorPanel v-show="activeTab === 'icons'" />
      <ScreenshotPanel v-show="activeTab === 'screenshots'" />
    </main>

    <footer class="border-t border-[var(--color-border)] py-6 text-center text-xs text-[var(--color-text-muted)]">
      IconForge · 纯前端 · 可部署 GitHub Pages / Vercel
    </footer>
  </div>
</template>
