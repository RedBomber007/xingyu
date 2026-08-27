import Dexie from 'dexie'
import { seedData } from './seed.js'

export const db = new Dexie('xingyu')

// 6 张表：
// moods     心情记录
// health    健康打卡（喝水/睡眠/三餐/玩耍）
// diary     点滴记录（见闻/灵感/技能/里程碑/身体数据）
// knowledge 知识库（学习日志/冷知识收藏/技能/知识树掌握状态）
// contacts  通讯录（联系人 + 健康/心情/趣事/悄悄话）
// config    配置与物料（键值对）
db.version(1).stores({
  moods: '++id, date, createdAt',
  health: '++id, date, type, createdAt',
  diary: '++id, type, date, createdAt',
  knowledge: '++id, category, subject, createdAt',
  contacts: '++id, tag, name',
  config: 'key',
})

// 首次创建数据库时写入种子数据
db.on('populate', () => seedData(db))

/** 打开数据库（首次打开会触发 populate 写入种子数据） */
export async function initDB() {
  await db.open()
  return db
}
