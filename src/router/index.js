import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/booths' },
  { path: '/booths', name: 'booths', component: () => import('../views/BoothsPage.vue') },
  { path: '/booth/:id', name: 'booth', component: () => import('../views/BoothDetailPage.vue'), props: true },
  { path: '/parade', name: 'parade', component: () => import('../views/ParadePage.vue') },
  { path: '/stage', name: 'stage', component: () => import('../views/StagePage.vue') },
  { path: '/pins', name: 'pins', component: () => import('../views/PinsPage.vue') },
  // 开发者模式：不挂底栏，手动敲 #/dev 进（校正热区 / 到达门 / 出入口，只存本机）
  { path: '/dev', name: 'dev', component: () => import('../views/DevMapPage.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/booths' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    return { top: 0 }
  },
})

export default router
