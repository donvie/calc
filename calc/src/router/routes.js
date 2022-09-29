
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Part.vue'), meta: { requiresAuth: true } },
      { path: 'basket', component: () => import('pages/Basket.vue'), meta: { requiresAuth: true } },
      { path: 'login', component: () => import('pages/Login.vue') },
      { path: 'register', component: () => import('pages/Register.vue') },
      { path: 'part', component: () => import('pages/Part.vue'), meta: { requiresAuth: true } },
      { path: 'buy', component: () => import('pages/Buy.vue'), meta: { requiresAuth: true } }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
