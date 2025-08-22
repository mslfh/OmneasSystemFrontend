// Authentication and role management utilities

/**
 * Get current user from localStorage
 * @returns {Object|null} User object or null
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  }
  return null;
}

/**
 * Get current user role
 * @returns {string} User role (Admin, Desk, Staff) or empty string
 */
export function getUserRole() {
  const user = getCurrentUser();
  return user?.role || "";
}

/**
 * Check if current user is Admin or Desk
 * @returns {boolean}
 */
export function isAdminOrDesk() {
  const role = getUserRole();
  return role === "Admin" || role === "Desk" || role === "Root";
}


/**
 * Check if current user is Admin
 * @returns {boolean}
 */
export function isAdmin() {
  return getUserRole() === "Admin";
}

/**
 * Check if current user is Desk
 * @returns {boolean}
 */
export function isDesk() {
  return getUserRole() === "Desk";
}

/**
 * Check if current user is Staff
 * @returns {boolean}
 */
export function isStaff() {
  return getUserRole() === "Staff";
}

/**
 * Check if current user can access all menus (Admin or Desk)
 * @returns {boolean}
 */
export function canAccessAllMenus() {
  const role = getUserRole();
  return role === "Admin" || role === "Desk";
}

/**
 * Check if current user can only access schedule (Staff)
 * @returns {boolean}
 */
export function canOnlyAccessSchedule() {
  return getUserRole() === "Staff";
}

/**
 * Check if route is allowed for current user role
 * @param {string} path - Route path
 * @returns {boolean}
 */
export function isRouteAllowed(path) {
  const role = getUserRole();
  if (role === "Staff") {
    const allowedStaffRoutes = [
      "/admin",
      "/admin/schedule",
      "/admin/schedule/week",
      "/admin/schedule/day",
      "/admin/appointment",
    ];
    return allowedStaffRoutes.includes(path);
  }
  // Admin and Desk can access all routes
  return role === "Admin" || role === "Desk";
}

/**
 * Logout current user
 * Clears all user data from localStorage and redirects to login
 */
export function logout() {
  // Clear user data from localStorage
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("role");

  // Redirect to login page
  window.location.href = "/admin/login";
}
