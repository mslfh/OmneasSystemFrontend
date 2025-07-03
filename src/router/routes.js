const routes = [
  //Customer routes
  {
    path: '/',
    component: () => import('layouts/CustomerLayout.vue'),
    children: [
      // { path: '', component: () => import('pages/CustomerIndex.vue') },
      { path: '', component: () => import('pages/CustomerBooking.vue') },
      { path: '/old', component: () => import('pages/CustomerBookingSelectTime.vue') },
      { path: 'appointment', component: () => import('pages/CustomerAppointment.vue') },
      { path: 'profile', component: () => import('pages/CustomerProfile.vue') },
      { path: 'profile/detail', component: () => import('src/pages/CustomerProfileDetail.vue') },
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
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        next('/admin/login'); // Redirect to login if no token
      } else {
        next();
      }
    },
    children: [
      { path: '', component: () => import('pages/AdminAppointment.vue') },
      { path: 'staff', component: () => import('pages/AdminStaff.vue') },
      { path: 'user', component: () => import('pages/AdminUser.vue') },
      { path: 'package', component: () => import('pages/AdminPackage.vue') },
      { path: 'service', component: () => import('pages/AdminService.vue') },
      { path: 'schedule', component: () => import('pages/AdminSchedule.vue') },
      { path: 'schedule/week', component: () => import('pages/AdminScheduleWeek.vue') },
      { path: 'schedule/day', component: () => import('pages/AdminScheduleDay.vue') },
      { path: 'appointment', component: () => import('pages/AdminAppointment.vue') },
      { path: 'appointment/detail', component: () => import('pages/AdminHistoryDetail.vue') },
      { path: 'setting', component: () => import('pages/AdminSetting.vue') },
      { path: 'order', component: () => import('pages/AdminOrder.vue') },
      { path: 'order/detail', component: () => import('pages/AdminOrderDetail.vue') },
      { path: 'invoice', component: () => import('pages/AdminInvoice.vue') },
      { path: 'profile', component: () => import('pages/AdminProfile.vue') },
      { path: 'profile/detail', component: () => import('src/pages/AdminProfileDetail.vue') },
      { path: 'history', component: () => import('pages/AdminHistory.vue') },
      { path: 'voucher', component: () => import('pages/AdminVoucher.vue') },
      { path: 'dashboard', component: () => import('pages/AdminDashboard.vue') },
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
