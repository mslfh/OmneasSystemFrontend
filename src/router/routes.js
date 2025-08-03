import { roleGuard, adminDeskOnlyGuard, defaultRouteGuard } from './guards';

const routes = [
  //Customer routes
  // {
    // path: '/',
    // component: () => import('layouts/CustomerLayout.vue'),
  //   children: [
  //     // { path: '', component: () => import('pages/CustomerIndex.vue') },
  //     { path: '', component: () => import('pages/CustomerBooking.vue') },
  //     { path: '/old', component: () => import('pages/CustomerBookingSelectTime.vue') },
  //     { path: 'appointment', component: () => import('pages/CustomerAppointment.vue') },
  //     { path: 'profile', component: () => import('pages/CustomerProfile.vue') },
  //     { path: 'profile/detail', component: () => import('src/pages/CustomerProfileDetail.vue') },
  //   ]
  // },

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
      { path: 'user', component: () => import('pages/AdminUser.vue'), beforeEnter: adminDeskOnlyGuard },
      // { path: 'package', component: () => import('pages/AdminPackage.vue'), beforeEnter: adminDeskOnlyGuard },
      // { path: 'service', component: () => import('pages/AdminService.vue'), beforeEnter: adminDeskOnlyGuard },
      // { path: 'appointment', component: () => import('pages/AdminAppointment.vue'), beforeEnter: adminDeskOnlyGuard },
      // { path: 'appointment/detail', component: () => import('pages/AdminHistoryDetail.vue'), beforeEnter: adminDeskOnlyGuard },
      // { path: 'setting', component: () => import('pages/AdminSetting.vue'), beforeEnter: adminDeskOnlyGuard },
      // { path: 'order', component: () => import('pages/AdminOrder.vue'), beforeEnter: adminDeskOnlyGuard },
      // { path: 'order/detail', component: () => import('pages/AdminOrderDetail.vue'), beforeEnter: adminDeskOnlyGuard },
      // { path: 'invoice', component: () => import('pages/AdminInvoice.vue'), beforeEnter: adminDeskOnlyGuard },
      // { path: 'profile', component: () => import('pages/AdminProfile.vue'), beforeEnter: adminDeskOnlyGuard },
      // { path: 'profile/detail', component: () => import('src/pages/AdminProfileDetail.vue'), beforeEnter: adminDeskOnlyGuard },
      // { path: 'history', component: () => import('pages/AdminHistory.vue'), beforeEnter: adminDeskOnlyGuard },
      // { path: 'voucher', component: () => import('pages/AdminVoucher.vue'), beforeEnter: adminDeskOnlyGuard },
      { path: 'dashboard', component: () => import('pages/AdminDashboard.vue'), beforeEnter: adminDeskOnlyGuard },
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
