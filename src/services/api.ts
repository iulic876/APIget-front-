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
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json().catch(() => null);

      return {
        data,
        status: response.status,
        ok: response.ok,
        error: !response.ok ? data?.message || 'An error occurred' : undefined,
      };
    } catch (error) {
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