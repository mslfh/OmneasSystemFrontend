// Route guards for role-based access control
import { getUserRole } from '../utils/auth';

/**
 * Route guard for role-based access control
 * @param {Object} to - Target route
 * @param {Object} from - Source route
 * @param {Function} next - Next function
 */
export function roleGuard(to, from, next) {
  const token = localStorage.getItem("authToken");

  if (!token) {
    next('/admin/login');
    return;
  }

  const userRole = getUserRole();

  // Staff can only access schedule-related routes
  if (userRole === 'Staff') {
    const allowedStaffRoutes = [
      '/admin',
      '/admin/schedule',
      '/admin/schedule/week',
      '/admin/schedule/day'
    ];

    // If staff tries to access other routes, redirect to schedule
    if (!allowedStaffRoutes.includes(to.path)) {
      next('/admin/schedule');
      return;
    }
  }

  next();
}

/**
 * Guard for non-staff routes (Admin and Desk only)
 * @param {Object} to - Target route
 * @param {Object} from - Source route
 * @param {Function} next - Next function
 */
export function adminDeskOnlyGuard(to, from, next) {
  const userRole = getUserRole();

  if (userRole === 'Staff') {
    next('/admin/schedule');
    return;
  }

  next();
}

/**
 * Default route handler based on role
 * @param {Object} to - Target route
 * @param {Object} from - Source route
 * @param {Function} next - Next function
 */
export function defaultRouteGuard(to, from, next) {
  const userRole = getUserRole();

  // Redirect Staff to schedule, others to appointment
  if (userRole === 'Staff') {
    next('/admin/schedule');
  } else {
    next('/admin/appointment');
  }
}
