<script setup>
import { ref } from 'vue'
import { Upload, ImageIcon, X } from 'lucide-vue-next'

const props = defineProps({
  accept: { type: String, default: 'image/png,image/jpeg,image/webp' },
  hint: { type: String, default: '拖拽图片到此处，或点击上传' },
  subHint: { type: String, default: '支持 PNG / JPG / WEBP' },
  previewUrl: { type: String, default: '' },
})

const emit = defineEmits(['file-selected', 'clear'])

const isDragging = ref(false)
const inputRef = ref(null)

function onFiles(files) {
  const file = files?.[0]
  if (!file?.type.startsWith('image/')) return
  emit('file-selected', file)
}

function onDrop(e) {
  e.preventDefault()
  isDragging.value = false
  onFiles(e.dataTransfer?.files)
}

function onChange(e) {
  onFiles(e.target.files)
  e.target.value = ''
}
</script>

<template>
  <div
    class="relative rounded-xl border border-dashed transition"
    :class="
      isDragging
        ? 'border-[var(--color-accent)] bg-[var(--color-accent-glow)]'
        : 'border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-text-muted)]'
    "
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop="onDrop"
  >
    <input
      ref="inputRef"
      type="file"
      class="hidden"
      :accept="accept"
      @change="onChange"
    />

    <div v-if="previewUrl" class="relative p-3">
      <img :src="previewUrl" alt="预览" class="mx-auto max-h-40 rounded-lg object-contain" />
      <button
        type="button"
        class="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
        @click.stop="emit('clear')"
      >
        <X :size="14" />
      </button>
    </div>

    <button
      v-else
      type="button"
      class="flex w-full flex-col items-center gap-2 px-4 py-8 text-center"
      @click="inputRef?.click()"
    >
      <div class="rounded-full bg-[var(--color-surface-hover)] p-3 text-[var(--color-text-muted)]">
        <Upload v-if="!isDragging" :size="22" />
        <ImageIcon v-else :size="22" class="text-[var(--color-accent)]" />
      </div>
      <p class="text-sm font-medium">{{ hint }}</p>
      <p class="text-xs text-[var(--color-text-muted)]">{{ subHint }}</p>
    </button>
  </div>
</template>
