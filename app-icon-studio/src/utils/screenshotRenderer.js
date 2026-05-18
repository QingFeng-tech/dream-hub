import { loadImage } from './canvas.js'

/**
 * 上架截图 Canvas 渲染器
 * 在指定模版尺寸画布上绘制：背景 → 手机外壳 + 截屏 → 宣传文案
 */

/**
 * 绘制线性渐变背景
 */
function drawGradientBackground(ctx, width, height, stops, angleDeg = 135) {
  const rad = (angleDeg * Math.PI) / 180
  const x1 = width / 2 - (Math.cos(rad) * width) / 2
  const y1 = height / 2 - (Math.sin(rad) * height) / 2
  const x2 = width / 2 + (Math.cos(rad) * width) / 2
  const y2 = height / 2 + (Math.sin(rad) * height) / 2
  const grad = ctx.createLinearGradient(x1, y1, x2, y2)
  stops.forEach((color, i) => {
    grad.addColorStop(i / (stops.length - 1 || 1), color)
  })
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)
}

/**
 * 绘制纯色背景
 */
function drawSolidBackground(ctx, width, height, color) {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, width, height)
}

/**
 * 高斯模糊背景：将截屏放大铺满后模糊（简化版：scale + filter）
 */
async function drawBlurredScreenshotBackground(ctx, canvas, screenshot, width, height) {
  const off = document.createElement('canvas')
  off.width = width
  off.height = height
  const octx = off.getContext('2d')
  octx.filter = 'blur(40px) brightness(0.7)'
  const scale = Math.max(width / screenshot.naturalWidth, height / screenshot.naturalHeight) * 1.2
  const dw = screenshot.naturalWidth * scale
  const dh = screenshot.naturalHeight * scale
  octx.drawImage(screenshot, (width - dw) / 2, (height - dh) / 2, dw, dh)
  ctx.drawImage(off, 0, 0)
}

/**
 * 绘制极简 iPhone 外壳 + 屏幕内容
 */
function drawIPhoneMockup(ctx, screenImg, canvasW, canvasH) {
  const phoneW = canvasW * 0.72
  const phoneH = phoneW * 2.05
  const x = (canvasW - phoneW) / 2
  const y = canvasH * 0.22

  const radius = phoneW * 0.12
  const bezel = phoneW * 0.035
  const screenX = x + bezel
  const screenY = y + bezel * 2.2
  const screenW = phoneW - bezel * 2
  const screenH = phoneH - bezel * 3.5
  const screenRadius = radius * 0.85

  // 机身阴影
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.45)'
  ctx.shadowBlur = 48
  ctx.shadowOffsetY = 24

  // 外框
  ctx.fillStyle = '#1a1a1e'
  roundRect(ctx, x, y, phoneW, phoneH, radius)
  ctx.fill()
  ctx.restore()

  // 屏幕区域裁切
  ctx.save()
  roundRect(ctx, screenX, screenY, screenW, screenH, screenRadius)
  ctx.clip()

  if (screenImg) {
    const scale = Math.max(screenW / screenImg.naturalWidth, screenH / screenImg.naturalHeight)
    const dw = screenImg.naturalWidth * scale
    const dh = screenImg.naturalHeight * scale
    ctx.drawImage(screenImg, screenX + (screenW - dw) / 2, screenY + (screenH - dh) / 2, dw, dh)
  } else {
    ctx.fillStyle = '#27272a'
    ctx.fillRect(screenX, screenY, screenW, screenH)
  }
  ctx.restore()

  // Dynamic Island
  const islandW = phoneW * 0.28
  const islandH = phoneW * 0.065
  ctx.fillStyle = '#000'
  roundRect(ctx, x + (phoneW - islandW) / 2, y + bezel * 1.2, islandW, islandH, islandH / 2)
  ctx.fill()

  return { phoneY: y, phoneH }
}

/**
 * Android 外壳（圆角矩形 + 居中打孔感顶栏）
 */
function drawAndroidMockup(ctx, screenImg, canvasW, canvasH) {
  const phoneW = canvasW * 0.7
  const phoneH = phoneW * 2.08
  const x = (canvasW - phoneW) / 2
  const y = canvasH * 0.22
  const radius = phoneW * 0.08
  const bezel = phoneW * 0.025

  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.4)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 20
  ctx.fillStyle = '#2d2d30'
  roundRect(ctx, x, y, phoneW, phoneH, radius)
  ctx.fill()
  ctx.restore()

  const screenX = x + bezel
  const screenY = y + bezel * 2
  const screenW = phoneW - bezel * 2
  const screenH = phoneH - bezel * 3

  ctx.save()
  roundRect(ctx, screenX, screenY, screenW, screenH, radius * 0.6)
  ctx.clip()
  if (screenImg) {
    const scale = Math.max(screenW / screenImg.naturalWidth, screenH / screenImg.naturalHeight)
    const dw = screenImg.naturalWidth * scale
    const dh = screenImg.naturalHeight * scale
    ctx.drawImage(screenImg, screenX + (screenW - dw) / 2, screenY + (screenH - dh) / 2, dw, dh)
  } else {
    ctx.fillStyle = '#3f3f46'
    ctx.fillRect(screenX, screenY, screenW, screenH)
  }
  ctx.restore()

  return { phoneY: y, phoneH }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/**
 * 绘制宣传文案
 */
function drawCaption(ctx, text, width, height, options) {
  if (!text?.trim()) return
  const { position, fontSize, color } = options
  const yRatio = position === 'top' ? 0.1 : 0.92
  ctx.font = `600 ${fontSize}px "DM Sans", system-ui, sans-serif`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = position === 'top' ? 'top' : 'bottom'
  ctx.fillText(text, width / 2, height * yRatio)
}

/**
 * 主渲染入口
 * @param {object} options
 * @returns {Promise<Blob>}
 */
export async function renderStoreScreenshot(options) {
  const {
    template,
    screenshotSrc,
    backgroundType,
    solidColor,
    gradientStops,
    caption,
    captionPosition,
    captionFontSize,
    captionColor,
  } = options

  const { width, height, device } = template
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  let screenImg = null
  if (screenshotSrc) {
    screenImg = await loadImage(screenshotSrc)
  }

  // 1. 背景层
  if (backgroundType === 'solid') {
    drawSolidBackground(ctx, width, height, solidColor || '#0f172a')
  } else if (backgroundType === 'gradient') {
    drawGradientBackground(ctx, width, height, gradientStops || ['#667eea', '#764ba2'])
  } else if (backgroundType === 'blur' && screenImg) {
    await drawBlurredScreenshotBackground(ctx, canvas, screenImg, width, height)
  } else {
    drawSolidBackground(ctx, width, height, '#0a0a0b')
  }

  // 2. 顶部/底部文案（在 mockup 下层或上层：上方文案先画）
  if (captionPosition === 'top') {
    drawCaption(ctx, caption, width, height, {
      position: 'top',
      fontSize: captionFontSize,
      color: captionColor,
    })
  }

  // 3. 手机外壳 + 截屏
  if (device === 'android') {
    drawAndroidMockup(ctx, screenImg, width, height)
  } else {
    drawIPhoneMockup(ctx, screenImg, width, height)
  }

  // 4. 底部文案
  if (captionPosition === 'bottom') {
    drawCaption(ctx, caption, width, height, {
      position: 'bottom',
      fontSize: captionFontSize,
      color: captionColor,
    })
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('截图导出失败'))),
      'image/png',
      0.92
    )
  })
}

/**
 * 生成预览用缩略图 DataURL（降低分辨率以提升性能）
 */
export async function renderScreenshotPreview(options, maxWidth = 360) {
  const blob = await renderStoreScreenshot(options)
  const url = URL.createObjectURL(blob)
  const img = await loadImage(url)
  const scale = maxWidth / img.naturalWidth
  const canvas = document.createElement('canvas')
  canvas.width = maxWidth
  canvas.height = img.naturalHeight * scale
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  URL.revokeObjectURL(url)
  return canvas.toDataURL('image/png')
}
