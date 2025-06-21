import Cookies from 'js-cookie';
const API_BASE_URL = 'http://localhost:3001/api';

export class ApiService {
  static async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{
    data: T;
    status: number;
    ok: boolean;
    error?: string;
  }> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      
      const token = Cookies.get('auth_token');
      
      // Build headers safely
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('Making API request to:', url);
      console.log('With options:', {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        }
      });

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      console.log('Response status:', response.status);
      const data = await response.json().catch(() => {
        console.log('Failed to parse response as JSON');
        return null;
      });
      console.log('Response data:', data);

      return {
        data,
        status: response.status,
        ok: response.ok,
        error: !response.ok ? data?.message || 'An error occurred' : undefined,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        data: null as T,
        status: 500,
        ok: false,
        error: (error as Error).message || 'Network error occurred',
      };
    }
  }

  static async get<T = any>(endpoint: string, options: RequestInit = {}) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  static async post<T = any>(endpoint: string, body: any, options: RequestInit = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async put<T = any>(endpoint: string, body: any, options: RequestInit = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  static async delete<T = any>(endpoint: string, options: RequestInit = {}) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export default ApiService; 