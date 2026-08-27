// 8 种心情映射（emoji + 名称 + 主题色）
export const MOODS = [
  { id: 'happy', emoji: '😄', name: '开心', color: '#FFD93D' },
  { id: 'excited', emoji: '🤩', name: '兴奋', color: '#FFC94D' },
  { id: 'calm', emoji: '😌', name: '平静', color: '#81D4FA' },
  { id: 'confused', emoji: '😕', name: '困惑', color: '#B39DDB' },
  { id: 'tired', emoji: '😫', name: '疲惫', color: '#A8E6CF' },
  { id: 'sad', emoji: '😢', name: '难过', color: '#9BB8D3' },
  { id: 'irritated', emoji: '😣', name: '烦躁', color: '#FFB74D' },
  { id: 'angry', emoji: '😡', name: '生气', color: '#FF8A80' },
]

export function moodById(id) {
  return MOODS.find((m) => m.id === id) || null
}

export function moodEmoji(id) {
  const m = moodById(id)
  return m ? m.emoji : '🙂'
}
