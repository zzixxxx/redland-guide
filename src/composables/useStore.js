import { ref, watch, computed } from 'vue'
import { event } from '../data/rules.js'

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

// ---- 待打卡清单（按展位号 no 存，不是 id：一个展位号下的多个 IP 在图上是同一个点）----
const plan = ref(new Set(load('rl26.plan', [])))
watch(plan, (v) => save('rl26.plan', [...v]), { deep: true })

export function usePlan() {
  const inPlan = (no) => plan.value.has(no)
  const togglePlan = (no) => {
    const s = new Set(plan.value)
    s.has(no) ? s.delete(no) : s.add(no)
    plan.value = s
  }
  const clearPlan = () => (plan.value = new Set())
  const planCount = computed(() => plan.value.size)
  return { plan, inPlan, togglePlan, clearPlan, planCount }
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
