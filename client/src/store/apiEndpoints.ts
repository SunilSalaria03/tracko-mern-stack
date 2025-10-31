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
      LIST: '/admin/users',
      BY_ID: (id: string) => `/admin/users/${id}`,
      CREATE: '/admin/users/add',
      UPDATE: (id: string) => `/admin/users/${id}`,
      DELETE: (id: string) => `/admin/users/${id}`,
      PROFILE: '/users/profile',
      UPDATE_PROFILE: '/users/profile',
      CHANGE_PASSWORD: '/users/changePassword',
    },
    EMPLOYEES: {
      LIST: '/admin/users',
      BY_ID: (id: string) => `/admin/users/${id}`,
      CREATE: '/admin/users',
      UPDATE: (id: string) => `/admin/users/${id}`,
      DELETE: (id: string) => `/admin/users/${id}`,
    },
    PROJECTS: {
      LIST: '/admin/projects',
      BY_ID: (id: string) => `/admin/projects/${id}`,
      CREATE: '/admin/projects',
      UPDATE: (id: string) => `/admin/projects/${id}`,
      DELETE: (id: string) => `/admin/projects/${id}`,
    },
    WORKSTREAMS: {
      LIST: '/admin/workstreams',
      BY_ID: (id: string) => `/admin/workstreams/${id}`,
      CREATE: '/admin/workstreams',
      UPDATE: (id: string) => `/admin/workstreams/${id}`,
      DELETE: (id: string) => `/admin/workstreams/${id}`,
    },
    ADMINS: {
      LIST: '/admin/admins',
      BY_ID: (id: string) => `/admin/admins/${id}`,
      CREATE: '/admin/admins',
      UPDATE: (id: string) => `/admin/admins/${id}`,
      DELETE: (id: string) => `/admin/admins/${id}`,
    },
  };
  