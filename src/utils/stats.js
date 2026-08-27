// 聚合统计工具函数
import { toKey, addDays } from './date'

/**
 * 连续打卡天数。
 * @param {string[]} recordDates 有记录的日期 key 数组（可含重复）
 * @param {Date} today 基准日
 * @returns 连续天数（今天无记录则从昨天起算）
 */
export function calcStreak(recordDates, today = new Date()) {
  const set = new Set(recordDates)
  let streak = 0
  let cursor = today
  if (!set.has(toKey(cursor))) {
    cursor = addDays(cursor, -1)
  }
  while (set.has(toKey(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

/** 平均心情值（1-10），保留一位小数 */
export function avgMood(moods) {
  if (!moods || moods.length === 0) return 0
  const sum = moods.reduce((s, m) => s + (Number(m.score) || 0), 0)
  return Math.round((sum / moods.length) * 10) / 10
}

/** 学习总时长（分钟） */
export function studyDuration(logs) {
  return (logs || []).reduce((s, l) => s + (Number(l.duration) || 0), 0)
}

/**
 * 四叶草四项完成度（0-1）。
 * @param {object[]} records 某天/某周的 health 记录
 * @param {object} targets 各项目标值，默认：喝水 8 杯、睡眠 8 小时、三餐 3 顿、玩耍 60 分钟
 */
export function healthBreakdown(records, targets = { water: 8, sleep: 8, meal: 3, play: 60 }) {
  const agg = { water: 0, sleep: 0, meal: 0, play: 0 }
  for (const r of records || []) {
    if (r.type === 'water') agg.water += Number(r.value) || 0
    else if (r.type === 'sleep') agg.sleep += Number(r.value) || 0
    else if (r.type === 'meal') agg.meal += Number(r.value) || 0
    else if (r.type === 'play') agg.play += Number(r.value) || 0
  }
  return {
    water: Math.min(1, agg.water / targets.water),
    sleep: Math.min(1, agg.sleep / targets.sleep),
    meal: Math.min(1, agg.meal / targets.meal),
    play: Math.min(1, agg.play / targets.play),
  }
}

/** 四叶草综合健康评分（0-1） */
export function healthScore(records, targets) {
  const b = healthBreakdown(records, targets)
  return (b.water + b.sleep + b.meal + b.play) / 4
}

/**
 * 学科掌握度进度。
 * @param {object[]} tree 知识树（grade/subject/chapters/points）
 * @param {object} mastery 知识点掌握度映射 { pointId: 0-3 }（0未知 1了解 2掌握 3可教）
 * @param {string} subject 学科名（语文/数学/英语）
 */
export function masteryProgress(tree, mastery = {}, subject) {
  let total = 0
  let lit = 0
  for (const node of tree || []) {
    if (subject && node.subject !== subject) continue
    for (const ch of node.chapters || []) {
      for (const p of ch.points || []) {
        total += 1
        if ((mastery[p.id] || 0) >= 2) lit += 1
      }
    }
  }
  return { lit, total, percent: total ? Math.round((lit / total) * 100) : 0 }
}

/** 简单词频统计（供周报关键词云使用） */
export function wordFrequency(texts, stopWords = []) {
  const freq = {}
  const stop = new Set(stopWords)
  for (const text of texts || []) {
    const words = String(text).split(/[\s，。！？、,.!?]+/)
    for (const w of words) {
      if (!w || w.length < 2 || stop.has(w)) continue
      freq[w] = (freq[w] || 0) + 1
    }
  }
  return freq
}
