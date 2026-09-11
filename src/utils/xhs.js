// 小红书链接工具
// uid 来自笔记 note.json 的 user.userId；RED LAND 官方号 uid 固定
export const REDLAND_XHS = { uid: '685ce6320000000008039c70', name: 'RED LAND' }

export const profileUrl = (uid) => `https://www.xiaohongshu.com/user/profile/${uid}`
export const searchUrl = (keyword) => `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(keyword)}`
export const boothSearchKeyword = (booth) => `${booth.ip} RED LAND2026`

// 小红书 App 的 URL Scheme：主页 xhsdiscover://user/<uid>
export const profileDeepLink = (uid) => `xhsdiscover://user/${uid}`

const ua = () => (typeof navigator === 'undefined' ? '' : navigator.userAgent || '')
export const isMobile = () => /iPhone|iPad|iPod|Android|HarmonyOS|Mobile/i.test(ua())

/**
 * 小红书主页按钮的点击处理（挂在 <a :href="profileUrl(uid)"> 上）。
 * - PC：不拦截，保持 <a target="_blank"> 打开网页版。
 * - 手机：拦截默认跳转，先尝试唤起小红书 App（系统会弹「是否在小红书中打开」），
 *   直接在 App 内打开主页，绕过网页版 user/profile 的滑块 / 身份验证；
 *   1.6s 内页面仍可见（未安装 App 或用户取消）则退回网页版。
 *   Android Chrome 走 intent://，未安装时由浏览器自动跳 browser_fallback_url。
 */
export function openProfile(e, uid) {
  if (!isMobile()) return
  e.preventDefault()
  openInApp(profileDeepLink(uid), profileUrl(uid))
}

function openInApp(deepLink, webUrl) {
  const u = ua()
  if (/Android/i.test(u) && /Chrome\//i.test(u) && !/MicroMessenger|QQ\//i.test(u)) {
    const path = deepLink.replace(/^xhsdiscover:\/\//, '')
    window.location.href = `intent://${path}#Intent;scheme=xhsdiscover;package=com.xingin.xhs;S.browser_fallback_url=${encodeURIComponent(webUrl)};end`
    return
  }
  let left = false
  const onHide = () => (left = true)
  document.addEventListener('visibilitychange', onHide)
  window.addEventListener('pagehide', onHide)
  window.addEventListener('blur', onHide)
  const t0 = Date.now()
  window.location.href = deepLink
  setTimeout(() => {
    document.removeEventListener('visibilitychange', onHide)
    window.removeEventListener('pagehide', onHide)
    window.removeEventListener('blur', onHide)
    // 页面被切到后台（App 已打开）或定时器被挂起很久（从 App 切回来）都不再跳网页
    if (!left && !document.hidden && Date.now() - t0 < 2500) window.location.href = webUrl
  }, 1600)
}
