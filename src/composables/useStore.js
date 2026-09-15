import { ref, watch, computed } from 'vue'
import { event } from '../data/rules.js'
import { booths } from '../data/booths.js'

// ---- localStorage 小工具 ----
function load(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v == null ? fallback : JSON.parse(v)
  } catch {
    return fallback
  }
}
function save(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {
    /* 隐私模式等场景忽略 */
  }
}

// ---- 展位打卡（已完成任务 / 已拿 PIN）----
const checked = ref(new Set(load('rl26.checked', [])))
watch(checked, (v) => save('rl26.checked', [...v]), { deep: true })

export function useChecked() {
  const isChecked = (id) => checked.value.has(id)
  const toggle = (id) => {
    const s = new Set(checked.value)
    s.has(id) ? s.delete(id) : s.add(id)
    checked.value = s
  }
  const count = computed(() => checked.value.size)
  return { checked, isChecked, toggle, count }
}

// ---- PIN 图鉴「已收集」（按 pin id；未公布展位的占位卡用 'booth:<id>'）----
const collected = ref(new Set(load('rl26.pins', [])))
watch(collected, (v) => save('rl26.pins', [...v]), { deep: true })

export function useCollected() {
  const has = (id) => collected.value.has(id)
  const toggle = (id) => {
    const s = new Set(collected.value)
    s.has(id) ? s.delete(id) : s.add(id)
    collected.value = s
  }
  const count = computed(() => collected.value.size)
  return { collected, has, toggle, count }
}

// ---- 待打卡清单 ----
// plan 按**展位 id** 存（A25a / A25b 分开），因为同一个展位号下的多个 IP 要能各加各的（用户 9/15）；
// 地图上它们是同一个点，所以排路线时再按展位号去重（见 BoothsPage 的 planNos）。
// planOrder 存的是**展位号**顺序（null = 交给 planRoute 自动排最少回头路）。
// 迁移：9/15 之前存的是展位号，遇到同号多 IP 的（A01 → A01a/A01b）展开成全部 id。
function migratePlan(saved) {
  const ids = new Set(booths.map((b) => b.id))
  const out = new Set()
  for (const v of saved) {
    if (ids.has(v)) {
      out.add(v)
      continue
    }
    for (const b of booths) if (String(b.no).split('/').some((s) => s.trim() === v)) out.add(b.id)
  }
  return out
}
const plan = ref(migratePlan(load('rl26.plan', [])))
watch(plan, (v) => save('rl26.plan', [...v]), { deep: true })
const planOrder = ref(load('rl26.planOrder', null))
watch(planOrder, (v) => save('rl26.planOrder', v), { deep: true })

// 展位 id → 地图上的展位号（「B02 / B17」这类共用编号取第一个）
const noOfId = (id) => {
  const b = booths.find((x) => x.id === id)
  return b ? String(b.no).split('/')[0].trim() : null
}
const nosOf = (ids) => [...new Set([...ids].map(noOfId).filter(Boolean))]

export function usePlan() {
  const inPlan = (id) => plan.value.has(id)
  const togglePlan = (id) => {
    const s = new Set(plan.value)
    s.has(id) ? s.delete(id) : s.add(id)
    plan.value = s
    // 手动顺序按展位号存，跟着增删同步：新点排到最后，删掉的移出；
    // 成员对不上时 planRoute 会自动退回优化顺序
    if (planOrder.value) {
      const nos = nosOf(s)
      const o = planOrder.value.filter((n) => nos.includes(n))
      for (const n of nos) if (!o.includes(n)) o.push(n)
      planOrder.value = o
    }
  }
  const clearPlan = () => {
    plan.value = new Set()
    planOrder.value = null
  }
  // 把当前显示的顺序里第 i 个往前 / 往后挪一格（从此转为手动顺序）
  const movePlan = (order, i, dir) => {
    const j = i + dir
    if (j < 0 || j >= order.length) return
    const o = [...order]
    ;[o[i], o[j]] = [o[j], o[i]]
    planOrder.value = o
  }
  const autoPlan = () => (planOrder.value = null)
  const planCount = computed(() => plan.value.size)
  // 排路线用的展位号（同号多 IP 只算一个点）
  const planNos = computed(() => nosOf(plan.value))
  return { plan, planOrder, planNos, inPlan, togglePlan, clearPlan, movePlan, autoPlan, planCount }
}

// ---- 当前选中日期（花车 / 舞台共用）----
function guessToday() {
  // 活动期间自动定位到当天，其余时间默认 DAY1
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate()
  if (y === 2026 && m === 10 && d >= 2 && d <= 6) return d - 1
  return 1
}
const day = ref(load('rl26.day', null) ?? guessToday())
watch(day, (v) => save('rl26.day', v))

export function useDay() {
  const dayInfo = computed(() => event.days.find((x) => x.day === day.value) || event.days[0])
  return { day, dayInfo, days: event.days }
}
