<script setup>
import { Sparkles, Github, Sun, Moon } from 'lucide-vue-next'

defineProps({
  isDark: { type: Boolean, default: true },
})
defineEmits(['toggle-theme'])
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl">
    <div class="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
      <div class="flex items-center gap-3">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/20"
        >
          <Sparkles :size="18" />
        </div>
        <div>
          <h1 class="text-sm font-semibold tracking-tight sm:text-base">IconForge</h1>
          <p class="hidden text-xs text-[var(--color-text-muted)] sm:block">
            一键多尺寸图标 · 上架截图套壳
          </p>
        </div>
      </div>

      <p class="hidden flex-1 text-center text-xs text-[var(--color-text-muted)] md:block">
        为独立开发者而生 — 纯前端离线可用，数据不上传服务器
      </p>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-lg p-2 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          :aria-label="isDark ? '切换浅色' : '切换深色'"
          @click="$emit('toggle-theme')"
        >
          <Sun v-if="isDark" :size="18" />
          <Moon v-else :size="18" />
        </button>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <Github :size="16" />
          <span class="hidden sm:inline">GitHub</span>
        </a>
      </div>
    </div>
  </header>
</template>
