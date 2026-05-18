import JSZip from 'jszip'
import { saveAs } from 'file-saver'

/**
 * 将图标 Blob 列表打包为 AppIcons.zip
 * 目录结构：ios/、android/、web/
 *
 * @param {Array<{ platform: string, filename: string, blob: Blob }>} files
 * @param {string} zipName
 */
export async function downloadIconZip(files, zipName = 'AppIcons.zip') {
  const zip = new JSZip()

  for (const { platform, filename, blob } of files) {
    // 每个平台放入对应子文件夹
    const folder = zip.folder(platform)
    if (folder) {
      folder.file(filename, blob)
    }
  }

  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  saveAs(content, zipName)
}

/**
 * 将截图 Blob 列表打包下载
 * @param {Array<{ filename: string, blob: Blob }>} files
 * @param {string} zipName
 */
export async function downloadScreenshotZip(files, zipName = 'StoreScreenshots.zip') {
  const zip = new JSZip()
  const folder = zip.folder('screenshots')

  for (const { filename, blob } of files) {
    folder?.file(filename, blob)
  }

  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  saveAs(content, zipName)
}
