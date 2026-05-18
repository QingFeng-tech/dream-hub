<script setup>
import { ref, watch, computed } from 'vue'
import { Download, Loader2 } from 'lucide-vue-next'
import FileDropzone from './FileDropzone.vue'
import {
  SCREENSHOT_TEMPLATES,
  GRADIENT_PRESETS,
} from '../utils/screenshotTemplates.js'
import { renderStoreScreenshot, renderScreenshotPreview } from '../utils/screenshotRenderer.js'
import { downloadScreenshotZip } from '../utils/zipExport.js'

const screenshotUrl = ref('')
const selectedTemplateIds = ref(SCREENSHOT_TEMPLATES.map((t) => t.id))
const backgroundType = ref('gradient')
const solidColor = ref('#0f172a')
const gradientId = ref('aurora')
const caption = ref('让你的 App 脱颖而出')
const captionPosition = ref('bottom')
const captionFontSize = ref(48)
const captionColor = ref('#ffffff')
const deviceType = ref('iphone')
const previewDataUrl = ref('')
const isRendering = ref(false)
const isExporting = ref(false)

const selectedTemplates = computed(() =>
  SCREENSHOT_TEMPLATES.filter((t) => selectedTemplateIds.value.includes(t.id))
)

const currentGradient = computed(
  () => GRADIENT_PRESETS.find((g) => g.id === gradientId.value) || GRADIENT_PRESETS[0]
)

function toggleTemplate(id) {
  const set = new Set(selectedTemplateIds.value)
  if (set.has(id)) set.delete(id)
  else set.add(id)
  selectedTemplateIds.value = [...set]
}

function buildRenderOptions(template) {
  return {
    template: { ...template, device: deviceType.value },
    screenshotSrc: screenshotUrl.value || null,
    backgroundType: backgroundType.value,
    solidColor: solidColor.value,
    gradientStops: currentGradient.value.stops,
    caption: caption.value,
    captionPosition: captionPosition.value,
    captionFontSize: captionFontSize.value,
    captionColor: captionColor.value,
  }
}

/** 防抖更新右侧预览 */
let previewTimer = null
async function refreshPreview() {
  if (!selectedTemplates.value.length) {
    previewDataUrl.value = ''
    return
  }
  isRendering.value = true
  try {
    const tpl = selectedTemplates.value[0]
    previewDataUrl.value = await renderScreenshotPreview(buildRenderOptions(tpl), 320)
  } catch (e) {
    console.error(e)
    previewDataUrl.value = ''
  } finally {
    isRendering.value = false
  }
}

watch(
  [
    screenshotUrl,
    selectedTemplateIds,
    backgroundType,
    solidColor,
    gradientId,
    caption,
    captionPosition,
    captionFontSize,
    captionColor,
    deviceType,
  ],
  () => {
    clearTimeout(previewTimer)
    previewTimer = setTimeout(refreshPreview, 300)
  },
  { deep: true }
)

function onFileSelected(file) {
  if (screenshotUrl.value) URL.revokeObjectURL(screenshotUrl.value)
  screenshotUrl.value = URL.createObjectURL(file)
}

function onClear() {
  if (screenshotUrl.value) URL.revokeObjectURL(screenshotUrl.value)
  screenshotUrl.value = ''
}

/** 为每个选中模版 Canvas 渲染并 JSZip 打包 */
async function exportAll() {
  if (selectedTemplates.value.length === 0) return
  isExporting.value = true
  try {
    const files = []
    for (const tpl of selectedTemplates.value) {
      const blob = await renderStoreScreenshot(buildRenderOptions(tpl))
      files.push({
        filename: `${tpl.id}-${tpl.width}x${tpl.height}.png`,
        blob,
      })
    }
    await downloadScreenshotZip(files, 'StoreScreenshots.zip')
  } catch (e) {
    console.error(e)
    alert('导出失败')
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[minmax(280px,400px)_1fr]">
    <aside class="space-y-5">
      <section class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
        <h2 class="mb-3 text-sm font-semibold">上传 App 截屏</h2>
        <FileDropzone
          :preview-url="screenshotUrl"
          hint="上传应用内截图"
          sub-hint="将自动套入手机外壳并美化背景"
          @file-selected="onFileSelected"
          @clear="onClear"
        />
      </section>

      <section class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
        <h2 class="mb-3 text-sm font-semibold">模版尺寸</h2>
        <ul class="space-y-2">
          <li v-for="tpl in SCREENSHOT_TEMPLATES" :key="tpl.id">
            <label class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-[var(--color-surface-hover)]">
              <input
                type="checkbox"
                class="accent-[var(--color-accent)]"
                :checked="selectedTemplateIds.includes(tpl.id)"
                @change="toggleTemplate(tpl.id)"
              />
              <span>{{ tpl.label }}</span>
            </label>
          </li>
        </ul>
      </section>

      <section class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 space-y-3">
        <h2 class="text-sm font-semibold">背景</h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in [
              { v: 'solid', l: '纯色' },
              { v: 'gradient', l: '渐变' },
              { v: 'blur', l: '模糊' },
            ]"
            :key="opt.v"
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition"
            :class="
              backgroundType === opt.v
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'
            "
            @click="backgroundType = opt.v"
          >
            {{ opt.l }}
          </button>
        </div>
        <input
          v-if="backgroundType === 'solid'"
          v-model="solidColor"
          type="color"
          class="h-10 w-full cursor-pointer rounded-lg border border-[var(--color-border)]"
        />
        <div v-if="backgroundType === 'gradient'" class="grid grid-cols-2 gap-2">
          <button
            v-for="g in GRADIENT_PRESETS"
            :key="g.id"
            type="button"
            class="h-12 rounded-lg ring-2 transition"
            :class="gradientId === g.id ? 'ring-[var(--color-accent)]' : 'ring-transparent'"
            :style="{ background: g.css }"
            :title="g.label"
            @click="gradientId = g.id"
          />
        </div>
        <p v-if="backgroundType === 'blur' && !screenshotUrl" class="text-xs text-amber-500">
          请先上传截屏以生成模糊背景
        </p>
      </section>

      <section class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 space-y-3">
        <h2 class="text-sm font-semibold">手机外壳</h2>
        <select
          v-model="deviceType"
          class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
        >
          <option value="iphone">iPhone（Dynamic Island）</option>
          <option value="android">Android</option>
        </select>
      </section>

      <section class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 space-y-3">
        <h2 class="text-sm font-semibold">宣传文案</h2>
        <input
          v-model="caption"
          type="text"
          placeholder="一行宣传语"
          class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
        />
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 rounded-lg py-1.5 text-xs"
            :class="captionPosition === 'top' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface-hover)]'"
            @click="captionPosition = 'top'"
          >
            上方
          </button>
          <button
            type="button"
            class="flex-1 rounded-lg py-1.5 text-xs"
            :class="captionPosition === 'bottom' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface-hover)]'"
            @click="captionPosition = 'bottom'"
          >
            下方
          </button>
        </div>
        <label class="block text-xs text-[var(--color-text-muted)]">
          字号 {{ captionFontSize }}px
          <input v-model.number="captionFontSize" type="range" min="24" max="96" class="mt-1 w-full" />
        </label>
        <label class="flex items-center gap-2 text-xs">
          文字颜色
          <input v-model="captionColor" type="color" class="h-8 w-16 rounded border border-[var(--color-border)]" />
        </label>
      </section>

      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-3 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        :disabled="selectedTemplates.length === 0 || isExporting"
        @click="exportAll"
      >
        <Loader2 v-if="isExporting" :size="18" class="animate-spin" />
        <Download v-else :size="18" />
        {{ isExporting ? '导出中…' : '导出所有截图 (ZIP)' }}
      </button>
    </aside>

    <div class="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
      <h2 class="mb-4 text-sm font-semibold">预览（首项模版）</h2>
      <div class="flex flex-1 items-center justify-center min-h-[400px] bg-[var(--color-surface)] rounded-lg">
        <Loader2 v-if="isRendering" class="animate-spin text-[var(--color-text-muted)]" />
        <img
          v-else-if="previewDataUrl"
          :src="previewDataUrl"
          alt="截图预览"
          class="max-h-[70vh] max-w-full rounded-lg shadow-2xl"
        />
        <p v-else class="text-sm text-[var(--color-text-muted)]">调整左侧配置以查看效果</p>
      </div>
    </div>
  </div>
</template>
