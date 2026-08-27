import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/living-room' },
  {
    path: '/living-room',
    name: 'living-room',
    component: () => import('../views/LivingRoom.vue'),
  },
  {
    path: '/diary',
    name: 'diary',
    component: () => import('../views/Diary.vue'),
  },
  {
    path: '/knowledge',
    name: 'knowledge',
    component: () => import('../views/Knowledge.vue'),
  },
  {
    path: '/contacts',
    name: 'contacts',
    component: () => import('../views/Contacts.vue'),
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/Profile.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
