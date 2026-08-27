// 学科主题色
export const SUBJECTS = [
  { name: '语文', color: '#FF9A76' },
  { name: '数学', color: '#679B9B' },
  { name: '英语', color: '#C6A2E8' },
]

export function subjectColor(name) {
  const s = SUBJECTS.find((x) => x.name === name)
  return s ? s.color : '#999'
}
