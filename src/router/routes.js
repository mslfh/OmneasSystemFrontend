const routes = [
  //Customer routes
  {
    path: '/',
    component: () => import('layouts/CustomerLayout.vue'),
    children: [
      { path: '', component: () => import('pages/CustomerIndex.vue') },
      { path: 'book', component: () => import('pages/CustomerBooking.vue') },
    ]
  },

  //Admin routes
  {
    path: '/admin/login',
    component: () => import('pages/AdminLogin.vue')
  },
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      { path: '', component: () => import('pages/AdminDashboard.vue') },
    ]
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
