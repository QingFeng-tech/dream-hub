<script setup>
import { ref, computed, watch } from 'vue'
import { CheckSquare, Square, Download, Loader2, Smartphone } from 'lucide-vue-next'
import FileDropzone from './FileDropzone.vue'
import {
  ICON_PLATFORMS,
  getAllIconItems,
  getDefaultSelectedIds,
} from '../utils/iconSizes.js'
import { loadImage, generateIconBlobs } from '../utils/canvas.js'
import { downloadIconZip } from '../utils/zipExport.js'

const previewUrl = ref('')
const sourceImage = ref(null)
const selectedIds = ref(getDefaultSelectedIds())
const isExporting = ref(false)
const showIosMask = ref(true)

const allItems = getAllIconItems()

const selectedItems = computed(() =>
  allItems.filter((item) => selectedIds.value.includes(item.id))
)

/** 预览用尺寸（取几个代表性大小） */
const previewSizes = [180, 120, 60, 40]

watch(previewUrl, async (url) => {
  if (!url) {
    sourceImage.value = null
    return
  }
  try {
    sourceImage.value = await loadImage(url)
  } catch {
    sourceImage.value = null
  }
})

function onFileSelected(file) {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
}

function onClear() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
  sourceImage.value = null
}

function toggleId(id) {
  const set = new Set(selectedIds.value)
  if (set.has(id)) set.delete(id)
  else set.add(id)
  selectedIds.value = [...set]
}

function selectAll() {
  selectedIds.value = getDefaultSelectedIds()
}

function invertSelection() {
  const all = new Set(getDefaultSelectedIds())
  selectedIds.value = [...all].filter((id) => !selectedIds.value.includes(id))
}

/** 一键生成 ZIP：Canvas 缩放 → JSZip 分目录打包 */
async function exportIcons() {
  if (!sourceImage.value || selectedItems.value.length === 0) return
  isExporting.value = true
  try {
    const blobs = await generateIconBlobs(sourceImage.value, selectedItems.value)
    await downloadIconZip(blobs, 'AppIcons.zip')
  } catch (e) {
    console.error(e)
    alert('导出失败，请确认已上传有效图片')
  } finally {
    isExporting.value = false
  }
}

</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[minmax(280px,380px)_1fr]">
    <!-- 左侧控制面板 -->
    <aside class="space-y-5">
      <section class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
        <h2 class="mb-3 text-sm font-semibold">上传 App 图标</h2>
        <FileDropzone
          :preview-url="previewUrl"
          hint="上传 1024×1024 正方形图标"
          sub-hint="推荐 PNG 透明底 · 支持 JPG / WEBP"
          @file-selected="onFileSelected"
          @clear="onClear"
        />
      </section>

      <section class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-sm font-semibold">导出尺寸</h2>
          <div class="flex gap-2 text-xs">
            <button type="button" class="text-[var(--color-accent)] hover:underline" @click="selectAll">
              全选
            </button>
            <span class="text-[var(--color-border)]">|</span>
            <button type="button" class="text-[var(--color-text-muted)] hover:underline" @click="invertSelection">
              反选
            </button>
          </div>
        </div>

        <div v-for="platform in ICON_PLATFORMS" :key="platform.key" class="mb-4 last:mb-0">
          <p class="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
            {{ platform.label }}
          </p>
          <ul class="space-y-1">
            <li v-for="item in platform.items" :key="item.id">
              <label
                class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-[var(--color-surface-hover)]"
              >
                <input
                  type="checkbox"
                  class="sr-only"
                  :checked="selectedIds.includes(item.id)"
                  @change="toggleId(item.id)"
                />
                <CheckSquare
                  v-if="selectedIds.includes(item.id)"
                  :size="16"
                  class="shrink-0 text-[var(--color-accent)]"
                />
                <Square v-else :size="16" class="shrink-0 text-[var(--color-border)]" />
                <span class="font-mono text-xs">{{ item.size }}×{{ item.size }}</span>
                <span class="truncate text-xs text-[var(--color-text-muted)]">{{ item.filename }}</span>
              </label>
            </li>
          </ul>
        </div>
      </section>

      <section class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <input v-model="showIosMask" type="checkbox" class="accent-[var(--color-accent)]" />
          <Smartphone :size="16" class="text-[var(--color-text-muted)]" />
          预览 iOS 圆角遮罩（导出仍为直角）
        </label>
      </section>

      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        :disabled="!sourceImage || selectedItems.length === 0 || isExporting"
        @click="exportIcons"
      >
        <Loader2 v-if="isExporting" :size="18" class="animate-spin" />
        <Download v-else :size="18" />
        {{ isExporting ? '正在打包…' : '生成图标包 (AppIcons.zip)' }}
      </button>
      <p class="text-center text-xs text-[var(--color-text-muted)]">
        已选 {{ selectedItems.length }} 个尺寸 · ZIP 内含 ios / android / web 目录
      </p>
    </aside>

    <!-- 右侧预览 -->
    <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 lg:min-h-[480px]">
      <h2 class="mb-4 text-sm font-semibold">实时预览</h2>
      <div v-if="!previewUrl" class="flex h-64 items-center justify-center text-sm text-[var(--color-text-muted)]">
        上传图标后在此查看多尺寸效果
      </div>
      <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div
          v-for="size in previewSizes"
          :key="size"
          class="flex flex-col items-center gap-2"
        >
          <div
            class="relative overflow-hidden bg-[var(--color-surface-hover)] ring-1 ring-[var(--color-border)]"
            :class="showIosMask ? 'ios-icon-mask' : 'rounded-lg'"
            :style="{ width: `${Math.min(size, 120)}px`, height: `${Math.min(size, 120)}px` }"
          >
            <img :src="previewUrl" alt="" class="h-full w-full object-cover" />
          </div>
          <span class="font-mono text-xs text-[var(--color-text-muted)]">{{ size }}px</span>
          <span v-if="showIosMask && size >= 60" class="text-[10px] text-[var(--color-accent)]">iOS 圆角预览</span>
        </div>
      </div>
      <p v-if="previewUrl" class="mt-4 text-xs text-[var(--color-text-muted)]">
        苹果要求提交直角 PNG；上方圆角仅用于网页预览模拟主屏幕效果。
      </p>
    </div>
  </div>
</template>
