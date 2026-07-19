/**
 * The Gym Fitness Club - Gym HR & Membership System
 * Future API Integration Bridge (Placeholder & Typed Schema Contracts)
 * 
 * In production, the service methods in `src/services/` will be re-routed 
 * to consume this API Client instead of direct `localStorage` access.
 */

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Endpoint Registry representing the backend gateway structure
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/auth/me',
  },
  CLIENTS: {
    BASE: '/api/v1/clients',
    DETAIL: (id: string) => `/api/v1/clients/${id}`,
    COACH_ASSIGN: (id: string) => `/api/v1/clients/${id}/assign-coach`,
  },
  COACHES: {
    BASE: '/api/v1/coaches',
    DETAIL: (id: string) => `/api/v1/coaches/${id}`,
  },
  HR: {
    STAFF: '/api/v1/hr/staff',
    DETAIL: (id: string) => `/api/v1/hr/staff/${id}`,
  },
  MEMBERSHIPS: {
    BASE: '/api/v1/memberships',
    DETAIL: (id: string) => `/api/v1/memberships/${id}`,
  },
  INVENTORY: {
    BASE: '/api/v1/inventory',
    DETAIL: (id: string) => `/api/v1/inventory/${id}`,
  },
  PAYMENTS: {
    BASE: '/api/v1/payments',
    INTEGRATION: '/api/v1/payments/stripe-intent', // Gateway hook
    VERIFY_AI: '/api/v1/payments/verify-slip-ai', // AI verification endpoint
  },
  DIETS: '/api/v1/plans/diets',
  WORKOUTS: '/api/v1/plans/workouts',
  NOTIFICATIONS: {
    BASE: '/api/v1/notifications',
    READ_ALL: '/api/v1/notifications/read-all',
  },
  REPORTS: '/api/v1/reports',
};

// Generic Axios / Fetch Wrapper (Future Implementation Draft)
export class FutureApiClient {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.gymhr.thegymfitnesshub.in';

  private static async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Future JWT Integration:
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('gym_auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Simulated HTTP methods to show mapping
   */
  public static async get<T>(url: string): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders();
    console.log(`[FUTURE API] GET request to: ${this.baseUrl}${url} with headers:`, headers);
    
    // In production, this becomes:
    // const res = await fetch(`${this.baseUrl}${url}`, { headers });
    // return res.json();
    
    throw new Error('API Client is in MVP Prototype mode. Utilize mock services inside src/services/ instead.');
  }

  public static async post<T, U = unknown>(url: string, body: U): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders();
    console.log(`[FUTURE API] POST request to: ${this.baseUrl}${url} with body:`, body);
    
    throw new Error('API Client is in MVP Prototype mode. Utilize mock services inside src/services/ instead.');
  }

  public static async put<T, U = unknown>(url: string, body: U): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders();
    console.log(`[FUTURE API] PUT request to: ${this.baseUrl}${url} with body:`, body);
    
    throw new Error('API Client is in MVP Prototype mode. Utilize mock services inside src/services/ instead.');
  }

  public static async delete<T>(url: string): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders();
    console.log(`[FUTURE API] DELETE request to: ${this.baseUrl}${url}`);
    
    throw new Error('API Client is in MVP Prototype mode. Utilize mock services inside src/services/ instead.');
  }
}
