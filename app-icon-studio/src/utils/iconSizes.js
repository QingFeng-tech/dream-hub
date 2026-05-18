/**
 * 各平台 App 图标标准尺寸配置
 * id 用于勾选状态；folder 决定 ZIP 内目录；filename 为导出文件名
 */
export const ICON_PLATFORMS = [
  {
    key: 'ios',
    label: 'iOS (App Store)',
    items: [
      { id: 'ios-1024', size: 1024, filename: 'AppStore-1024x1024.png' },
      { id: 'ios-180', size: 180, filename: 'iPhone-180x180.png' },
      { id: 'ios-120', size: 120, filename: 'iPhone-120x120.png' },
      { id: 'ios-87', size: 87, filename: 'iPad-87x87.png' },
      { id: 'ios-60', size: 60, filename: 'iPhone-60x60.png' },
      { id: 'ios-58', size: 58, filename: 'iPad-58x58.png' },
      { id: 'ios-40', size: 40, filename: 'Spotlight-40x40.png' },
      { id: 'ios-29', size: 29, filename: 'Settings-29x29.png' },
    ],
  },
  {
    key: 'android',
    label: 'Android (Google Play)',
    items: [
      { id: 'android-512', size: 512, filename: 'play-store-512x512.png' },
      { id: 'android-192', size: 192, filename: 'xxxhdpi-192x192.png' },
      { id: 'android-144', size: 144, filename: 'xxhdpi-144x144.png' },
      { id: 'android-96', size: 96, filename: 'xhdpi-96x96.png' },
      { id: 'android-72', size: 72, filename: 'hdpi-72x72.png' },
      { id: 'android-48', size: 48, filename: 'mdpi-48x48.png' },
    ],
  },
  {
    key: 'web',
    label: '网页 Favicon',
    items: [
      { id: 'web-32', size: 32, filename: 'favicon-32x32.png' },
      { id: 'web-16', size: 16, filename: 'favicon-16x16.png' },
    ],
  },
]

/** 扁平化所有尺寸项，便于全选/反选 */
export function getAllIconItems() {
  return ICON_PLATFORMS.flatMap((p) =>
    p.items.map((item) => ({ ...item, platform: p.key, platformLabel: p.label }))
  )
}

/** 默认全选所有尺寸 ID */
export function getDefaultSelectedIds() {
  return getAllIconItems().map((i) => i.id)
}
