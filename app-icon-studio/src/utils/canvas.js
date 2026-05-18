/**
 * Canvas 图像处理工具
 * 纯前端：将源图缩放为指定正方形尺寸，输出 PNG Blob
 */

/**
 * 从 File 或 DataURL 加载 HTMLImageElement
 * @param {string} src - Object URL 或 Data URL
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * 使用 Canvas 将图片绘制为 size×size 的正方形 PNG
 * 采用 cover 裁剪：保持比例填满画布，居中裁切（适合非正方形源图）
 *
 * @param {HTMLImageElement} image
 * @param {number} size - 输出边长（像素）
 * @returns {Promise<Blob>}
 */
export async function resizeImageToSquare(image, size) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const srcW = image.naturalWidth
  const srcH = image.naturalHeight
  const scale = Math.max(size / srcW, size / srcH)
  const drawW = srcW * scale
  const drawH = srcH * scale
  const offsetX = (size - drawW) / 2
  const offsetY = (size - drawH) / 2

  ctx.drawImage(image, offsetX, offsetY, drawW, drawH)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob 失败'))),
      'image/png',
      1
    )
  })
}

/**
 * 批量生成多尺寸图标 Blob
 * @param {HTMLImageElement} image
 * @param {Array<{ size: number, platform: string, filename: string }>} items
 * @returns {Promise<Array<{ platform: string, filename: string, blob: Blob }>>}
 */
export async function generateIconBlobs(image, items) {
  const results = []
  for (const item of items) {
    const blob = await resizeImageToSquare(image, item.size)
    results.push({
      platform: item.platform,
      filename: item.filename,
      blob,
    })
  }
  return results
}
