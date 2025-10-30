export const ROLES = {
  SUPER_ADMIN: 0,
  ADMIN: 1,
  MANAGER: 2,
  EMPLOYEE: 3,
} as const;

export const ROLE_NAMES = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.EMPLOYEE]: 'Employee',
} as const;

export const MANAGEMENT_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER];

export const EMPLOYEE_ROLES = [ROLES.EMPLOYEE];

export const isManagementRole = (role: number): boolean => {
  return MANAGEMENT_ROLES.includes(role as 0 | 1 | 2);
};

export const isEmployeeRole = (role: number): boolean => {
  return EMPLOYEE_ROLES.includes(role as 3);
};

export const PERMISSIONS = {
  // Superadmin only
  ADMIN_MANAGEMENT: [ROLES.SUPER_ADMIN],
  ROLES_PERMISSIONS: [ROLES.SUPER_ADMIN],
  SYSTEM_SETTINGS: [ROLES.SUPER_ADMIN],
  
  // Admin only
  VIEW_EMPLOYEES: [ROLES.ADMIN],
  MANAGE_EMPLOYEES: [ROLES.ADMIN],
  
  // Admin and Manager
  VIEW_PROJECTS: [ROLES.ADMIN, ROLES.MANAGER],
  MANAGE_PROJECTS: [ROLES.ADMIN, ROLES.MANAGER],
  VIEW_WORKSTREAMS: [ROLES.ADMIN, ROLES.MANAGER],
  MANAGE_WORKSTREAMS: [ROLES.ADMIN, ROLES.MANAGER],
  
  // All roles
  VIEW_PROFILE: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
  EDIT_PROFILE: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
  VIEW_DASHBOARD: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
  
  // Employee only
  TIME_TRACKING: [ROLES.EMPLOYEE],
  VIEW_WELCOME: [ROLES.EMPLOYEE],
} as const;

export const hasPermission = (userRole: number, permission: readonly number[]): boolean => {
  return permission.includes(userRole);
};

