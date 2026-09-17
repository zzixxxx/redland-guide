// 从详情页跳到舞台 / 花车页后定位到对应条目：滚到屏幕中间并让它闪一下（.anchor-hit，见 style.css）
export function flashAnchor(el) {
  if (!el) return
  // 用即时滚动：刚切完页面本来就没有视觉连续性，平滑滚动反而会被路由的回顶 / 图片懒加载打断（9/17 无头测试里没滚到位）
  el.scrollIntoView({ behavior: 'auto', block: 'center' })
  el.classList.remove('anchor-hit')
  void el.offsetWidth // 重新触发动画
  el.classList.add('anchor-hit')
  setTimeout(() => el.classList.remove('anchor-hit'), 2600)
}
