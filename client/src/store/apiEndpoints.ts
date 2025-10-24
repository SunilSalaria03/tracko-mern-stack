export const API_ENDPOINTS = {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/signup',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      FORGOT_PASSWORD: '/auth/forgotPassword',
      RESET_PASSWORD: '/auth/reset-password',
    },
    USERS: {
      LIST: '/users',
      BY_ID: (id: string) => `/users/${id}`,
      PROFILE: '/users/profile',
      UPDATE_PROFILE: '/users/profile',
    },
    EMPLOYEES: {
      LIST: '/admin/employees',
      BY_ID: (id: string) => `/admin/employees/${id}`,
      CREATE: '/admin/employees',
      UPDATE: (id: string) => `/admin/employees/${id}`,
      DELETE: (id: string) => `/admin/employees/${id}`,
    },
  };
  