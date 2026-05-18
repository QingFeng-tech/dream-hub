/** 上架截图模版尺寸（输出画布像素） */
export const SCREENSHOT_TEMPLATES = [
  {
    id: 'iphone-67',
    label: 'iPhone 6.7" (1290×2796)',
    width: 1290,
    height: 2796,
    device: 'iphone',
  },
  {
    id: 'iphone-65',
    label: 'iPhone 6.5" (1242×2688)',
    width: 1242,
    height: 2688,
    device: 'iphone',
  },
  {
    id: 'android-phone',
    label: 'Android 手机 (1080×2340)',
    width: 1080,
    height: 2340,
    device: 'android',
  },
]

/** 预设弥散渐变背景 */
export const GRADIENT_PRESETS = [
  {
    id: 'aurora',
    label: '极光紫',
    css: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    stops: ['#667eea', '#764ba2', '#f093fb'],
  },
  {
    id: 'ocean',
    label: '深海蓝',
    css: 'linear-gradient(160deg, #0c1445 0%, #1e3a5f 40%, #2d6a8f 100%)',
    stops: ['#0c1445', '#1e3a5f', '#2d6a8f'],
  },
  {
    id: 'sunset',
    label: '暮色橙',
    css: 'linear-gradient(145deg, #ff6b6b 0%, #feca57 50%, #ff9ff3 100%)',
    stops: ['#ff6b6b', '#feca57', '#ff9ff3'],
  },
  {
    id: 'mint',
    label: '薄荷绿',
    css: 'linear-gradient(120deg, #11998e 0%, #38ef7d 100%)',
    stops: ['#11998e', '#38ef7d'],
  },
]
