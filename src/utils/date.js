// 日期工具函数

/** 格式化为 YYYY-MM-DD */
export function toKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** 从 YYYY-MM-DD 还原为本地 Date */
export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** 加/减天数 */
export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

/** 是否同一天 */
export function isSameDay(a, b) {
  return toKey(a) === toKey(b)
}

/** 本周（周一至周日）7 天的日期数组 */
export function getWeekDates(date = new Date()) {
  const day = date.getDay() // 0=周日
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = addDays(date, mondayOffset)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

/** 当月日历网格（6 行 × 7 列 = 42 格），返回 { date, inMonth, key }[] */
export function getCalendarGrid(year, month) {
  const first = new Date(year, month, 1)
  const firstDay = first.getDay() // 0=周日
  const start = addDays(first, -firstDay)
  return Array.from({ length: 42 }, (_, i) => {
    const date = addDays(start, i)
    return { date, inMonth: date.getMonth() === month, key: toKey(date) }
  })
}

/** 去年同一天 */
export function lastYearSameDay(date = new Date()) {
  const d = new Date(date)
  d.setFullYear(d.getFullYear() - 1)
  return d
}

/** 某天在一年中的第几天（用于每日一问/冷知识按日期轮替） */
export function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date - start
  return Math.floor(diff / 86400000)
}
