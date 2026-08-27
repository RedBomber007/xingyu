// M1 验证脚本：在 Node 中模拟 IndexedDB，验证建表与种子数据
import 'fake-indexeddb/auto'

const { db } = await import('../src/db/index.js')

await db.open()

let failed = false
function check(name, ok, detail = '') {
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`)
  if (!ok) failed = true
}

// 1. 表结构
const tables = db.tables.map((t) => t.name).sort()
check('建出 6 张表', tables.length === 6, tables.join(', '))

// 2. 联系人种子
const contacts = await db.contacts.toArray()
check('联系人 3 人', contacts.length === 3, contacts.map((c) => c.name).join('、'))
const brother = contacts.find((c) => c.name === '哥哥')
check('哥哥有悄悄话', brother && brother.whisper.length > 0, brother?.whisper)

// 3. config 种子
const config = await db.config.toArray()
const confMap = Object.fromEntries(config.map((c) => [c.key, c.value]))
check('每日一问 30 题', Array.isArray(confMap.dailyQuestions) && confMap.dailyQuestions.length === 30)
check('冷知识 10 条', Array.isArray(confMap.dailyFacts) && confMap.dailyFacts.length === 10)
check('知识树 1 章节', Array.isArray(confMap.knowledgeTree) && confMap.knowledgeTree.length === 1)
check('管理员密码存在', typeof confMap.adminPassword === 'string' && confMap.adminPassword.length > 0)
check('提醒开关存在', typeof confMap.reminderEnabled === 'boolean')

// 4. 知识树知识点数量
const points = confMap.knowledgeTree.flatMap((n) => n.chapters.flatMap((ch) => ch.points))
check('知识树含 5 个知识点', points.length === 5, points.map((p) => p.name).join('、'))

await db.close()

console.log('\n' + (failed ? '❌ 验证未通过' : '✅ 全部验证通过'))
process.exit(failed ? 1 : 0)
