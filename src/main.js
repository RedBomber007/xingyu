import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initDB } from './db'
import './styles/variables.css'
import './styles/global.css'

async function bootstrap() {
  // 打开数据库；首次打开会触发 populate 写入种子数据
  await initDB()

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')
}

bootstrap()
