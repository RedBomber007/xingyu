// 《星屿》种子数据：首次打开 App 时写入本地数据库

const now = () => new Date().toISOString()

// 家人档案（3 人，管理员初始化）
const familyContacts = [
  {
    name: '妈妈',
    tag: 'family',
    avatar: '👩',
    info: {
      birthday: '1985-03-15',
      zodiac: '双鱼座',
      phone: '13800000001',
      likes: ['喜欢种花', '爱看电视剧'],
      catchphrase: '宝贝，吃饭了吗？',
    },
    health: [],
    mood: [],
    funStories: [],
    whisper: '',
    createdAt: now(),
  },
  {
    name: '爸爸',
    tag: 'family',
    avatar: '👨',
    info: {
      birthday: '1983-07-20',
      zodiac: '巨蟹座',
      phone: '13800000002',
      likes: ['喜欢钓鱼', '爱看球赛'],
      catchphrase: '走，带你出去玩',
    },
    health: [],
    mood: [],
    funStories: [],
    whisper: '',
    createdAt: now(),
  },
  {
    name: '哥哥',
    tag: 'family',
    avatar: '🧑',
    info: {
      birthday: '2008-09-25',
      zodiac: '天秤座',
      phone: '13800000003',
      likes: ['喜欢编程', '爱看科幻电影'],
      catchphrase: '有问题找哥哥',
    },
    health: [],
    mood: [],
    funStories: [],
    whisper: '妹妹，你是最棒的！哥哥会一直支持你 💙',
    createdAt: now(),
  },
]

// 每日一问（30 题，按日期轮替）
const dailyQuestions = [
  '今天谁让你笑了？',
  '今天遇到什么小困难？你是怎么做的？',
  '今天学到了什么新词/新知识？',
  '如果今天能重来一分钟，你想重过哪一分钟？',
  '今天有没有做一件对别人好的小事？',
  '今天有没有什么让你感到骄傲的事？',
  '如果给今天取个名字，你会叫什么？',
  '今天有没有什么让你感到困惑的事？',
  '今天你照顾自己了吗（吃好/睡好/喝水）？',
  '今天有没有看到什么好看的/好玩的？',
  '今天最想感谢谁？为什么？',
  '今天你勇敢了吗？',
  '今天有没有什么让你觉得「我好棒」的时刻？',
  '今天有没有什么事让你觉得不过如此？',
  '如果明天有超能力，你想要什么能力？',
  '今天有没有和哪个朋友说过话？聊了什么？',
  '今天有没有什么让你觉得很美的东西？',
  '今天你觉得累吗？是因为什么？',
  '今天有没有笑出声来？因为什么？',
  '今天你好奇什么？',
  '今天有没有一件小事让你觉得今天还不错？',
  '今天有没有什么想对自己说的？',
  '今天有没有注意到爸爸妈妈/哥哥在做什么？',
  '今天你有没有比昨天进步一点点？在哪方面？',
  '今天有没有什么让你觉得有点遗憾？',
  '如果今天是一本书，封面会写什么？',
  '今天有没有什么让你觉得很温暖？',
  '今天你有没有对自己耐心一点？',
  '今天最想记住的一个瞬间是什么？',
  '如果明天可以完全自由安排，你想做什么？',
]

// 每日冷知识（精简版 10 条，后续可补到 50）
const dailyFacts = [
  { title: '为什么冰敷能止痛？', content: '低温让血管收缩，减少肿胀和炎症。' },
  { title: '人为什么会打哈欠？', content: '不只是困，也可能是大脑在降温。' },
  { title: '为什么天空是蓝色的？', content: '蓝光波长短，容易被大气散射。' },
  { title: '如何看地图辨方向？', content: '上北下南，左西右东。' },
  { title: '为什么洋葱会让人流泪？', content: '切开会释放化学物质刺激眼睛。' },
  { title: '为什么打喷嚏会闭眼睛？', content: '身体为了保护眼睛不受刺激。' },
  { title: '为什么彩虹是拱形的？', content: '阳光经过水滴折射和反射形成。' },
  { title: '为什么海水是咸的？', content: '河流把陆地的盐分冲刷进海里。' },
  { title: '为什么月亮有时圆有时弯？', content: '月球绕地球转，我们看到的被照亮部分不同。' },
  { title: '为什么肥皂能洗掉油？', content: '肥皂分子一头亲水一头亲油，把油「包」起来冲走。' },
]

// 知识树骨架（精简版：初一上数学第一章「有理数」）
const knowledgeTree = [
  {
    grade: '初一上',
    subject: '数学',
    chapters: [
      {
        name: '第一章 有理数',
        points: [
          { id: 'm1-1', name: '正数和负数', tip: '大于 0 的是正数，小于 0 的是负数。', example: '' },
          { id: 'm1-2', name: '数轴', tip: '规定了原点、正方向和单位长度的直线。', example: '' },
          { id: 'm1-3', name: '相反数', tip: '只有符号不同的两个数互为相反数。', example: '' },
          { id: 'm1-4', name: '绝对值', tip: '数轴上到原点的距离，永远非负。', example: '' },
          { id: 'm1-5', name: '有理数的加减法', tip: '同号相加取同号，异号相加取绝对值大的符号。', example: '' },
        ],
      },
    ],
  },
]

// 默认配置
const configEntries = [
  { key: 'adminPassword', value: '123456' }, // TODO(M6)：改为散列存储
  { key: 'reminderEnabled', value: true },
  { key: 'dailyQuestions', value: dailyQuestions },
  { key: 'dailyFacts', value: dailyFacts },
  { key: 'knowledgeTree', value: knowledgeTree },
]

/**
 * 写入种子数据。仅在 Dexie populate 钩子（首次创建数据库）时调用。
 */
export async function seedData(db) {
  await db.contacts.bulkAdd(familyContacts)
  await db.config.bulkAdd(configEntries)
}
