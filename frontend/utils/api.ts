import { 
  RegisterUser, 
  LoginUser, 
  ApiSuccessResponse, 
  AuthResponse 
} from '@/types/schemas';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public success: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok || data.error) {
      throw new ApiError(
        data.statusCode || response.status,
        data.message || 'An error occurred',
        data.success || false
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(500, 'Network error or server unavailable');
  }
}

export const authApi = {
  register: async (userData: RegisterUser): Promise<AuthResponse> => {
    const response = await apiRequest<ApiSuccessResponse<AuthResponse>>(
      '/api/users/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );
    return response.data;
  },

  login: async (credentials: LoginUser): Promise<AuthResponse> => {
    const response = await apiRequest<ApiSuccessResponse<AuthResponse>>(
      '/api/users/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
    return response.data;
  },
};

export { ApiError };