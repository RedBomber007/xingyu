// 导出汇总（只导出统计汇总，不含日记原文）

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** 导出汇总数据为 JSON 文件 */
export function exportJSON(data, filename = '星屿汇总.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, filename)
}

/** 将某个 DOM 元素截图导出为 PNG 长图 */
export async function exportImage(element, filename = '星屿汇总.png') {
  const { default: html2canvas } = await import('html2canvas')
  const canvas = await html2canvas(element)
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = filename
  a.click()
}
