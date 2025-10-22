export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    body?: T; // Server sends data in 'body' field
    message: string;
    error?: string;
    code?: number;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
  
  export interface ApiError {
    message: string;
    status: number;
    code?: string;
  }
  