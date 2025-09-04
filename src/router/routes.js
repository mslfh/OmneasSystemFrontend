import { roleGuard, adminDeskOnlyGuard, defaultRouteGuard } from './guards';

const routes = [
  // Customer routes
  {
    path: '/',
    component: () => import('layouts/CustomerLayout.vue'),
    children: [
      { path: '', component: () => import('pages/CustomerDiningType.vue') },
      { path: 'order', component: () => import('pages/CustomerOrder.vue') },
      { path: 'confirm', component: () => import('src/pages/CustomerConfirm.vue') },
      { path: 'checkout', component: () => import('src/pages/CustomerCheckout.vue') },
      { path: 'confirmation', component: () => import('pages/CustomerOrderConfirmation.vue') },
      { path: 'order-tracking', component: () => import('pages/CustomerOrderTracking.vue') },
      { path: 'payment', component: () => import('pages/CustomerPayment.vue') },
      { path: 'profile', component: () => import('pages/CustomerProfile.vue') },
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
    beforeEnter: roleGuard,
    children: [
      {
        path: '',
        beforeEnter: defaultRouteGuard
      },
      // Schedule routes - accessible by all roles
      { path: 'schedule', name: 'AdminSchedule', component: () => import('pages/AdminSchedule.vue') },
      { path: 'schedule/week', name: 'AdminScheduleWeek', component: () => import('pages/AdminScheduleWeek.vue') },
      { path: 'schedule/day', name: 'AdminScheduleDay', component: () => import('pages/AdminScheduleDay.vue') },
      // Admin and Desk only routes
      { path: 'staff', component: () => import('pages/AdminStaff.vue'), beforeEnter: adminDeskOnlyGuard },
      { path: 'product', component: () => import('pages/AdminProduct.vue'), beforeEnter: adminDeskOnlyGuard },
      { path: 'product/detail', component: () => import('pages/AdminProductDetail.vue'), beforeEnter: adminDeskOnlyGuard },
      { path: 'product/add', component: () => import('pages/AdminProductAdd.vue'), beforeEnter: adminDeskOnlyGuard },
      { path: 'product/edit', component: () => import('pages/AdminProductEdit.vue'), beforeEnter: adminDeskOnlyGuard },
      { path: 'category', component: () => import('pages/AdminCategory.vue'), beforeEnter: adminDeskOnlyGuard },
      { path: 'item', component: () => import('pages/AdminItem.vue'), beforeEnter: adminDeskOnlyGuard },
      { path: 'option', component: () => import('pages/AdminOption.vue'), beforeEnter: adminDeskOnlyGuard },
      { path: 'attribute', component: () => import('pages/AdminAttribute.vue'), beforeEnter: adminDeskOnlyGuard },
      { path: 'combo', component: () => import('pages/AdminCombo.vue'), beforeEnter: adminDeskOnlyGuard },
      { path: 'order', component: () => import('pages/AdminOrder.vue'), beforeEnter: adminDeskOnlyGuard },
      { path: 'dashboard', component: () => import('pages/AdminDashboard.vue'), beforeEnter: adminDeskOnlyGuard },
      { path: 'setting', component: () => import('pages/AdminSetting.vue'), beforeEnter: adminDeskOnlyGuard },
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
