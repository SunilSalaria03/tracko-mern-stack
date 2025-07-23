export const API_ENDPOINTS = {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    USERS: {
      LIST: '/users',
      BY_ID: (id: string) => `/users/${id}`,
      PROFILE: '/users/profile',
      UPDATE_PROFILE: '/users/profile',
    },
  };
  