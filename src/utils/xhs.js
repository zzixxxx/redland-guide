// 小红书链接工具
// 主页 URL 在手机浏览器打开会提示跳转 App；uid 来自笔记 note.json 的 user.userId
export const REDLAND_XHS = { uid: '685ce6320000000008039c70', name: 'RED LAND' }

export const profileUrl = (uid) => `https://www.xiaohongshu.com/user/profile/${uid}`
export const searchUrl = (keyword) => `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(keyword)}`
export const boothSearchKeyword = (booth) => `${booth.ip} RED LAND2026`
