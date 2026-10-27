import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { storage } from '../../utils/storage';

const getBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  if (Platform.OS !== 'web') {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      return `http://${ip}:5000/api/v1`;
    }
  }
  return envUrl || 'http://localhost:5000/api/v1';
};

const API_BASE_URL = getBaseUrl();

export const isFormDataBody = (body: any): boolean => {
  if (!body) return false;
  if (typeof FormData !== 'undefined' && body instanceof FormData) return true;
  if (body.constructor?.name === 'FormData') return true;
  if (typeof body.append === 'function') return true;
  if (Array.isArray((body as any)?._parts)) return true;
  return false;
};

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode = 400, code = 'API_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    retry = true
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const accessToken = await storage.getSecureItem('finly_access_token');

    const isFormData = isFormDataBody(options.body);

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (accessToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized -> Refresh Token Rotation
      if (response.status === 401 && retry && !endpoint.includes('/auth/')) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          try {
            const refreshToken = await storage.getSecureItem('finly_refresh_token');
            if (refreshToken) {
              const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
              });

              if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                const newAccess = refreshData.data.accessToken;
                const newRefresh = refreshData.data.refreshToken;

                await storage.setSecureItem('finly_access_token', newAccess);
                await storage.setSecureItem('finly_refresh_token', newRefresh);

                this.isRefreshing = false;
                this.onTokenRefreshed(newAccess);

                // Retry original request with new token
                return this.request<T>(endpoint, options, false);
              }
            }
          } catch {
            // Refresh failed
          } finally {
            this.isRefreshing = false;
          }
        } else {
          // Wait for the active refresh to finish
          return new Promise<T>((resolve, reject) => {
            this.addRefreshSubscriber(async (newToken) => {
              try {
                const retried = await this.request<T>(
                  endpoint,
                  {
                    ...options,
                    headers: { ...headers, Authorization: `Bearer ${newToken}` },
                  },
                  false
                );
                resolve(retried);
              } catch (err) {
                reject(err);
              }
            });
          });
        }
      }

      // Check if response is JSON or blob (e.g. CSV)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/csv')) {
        return (await response.text()) as unknown as T;
      }

      const json = await response.json();

      if (!response.ok) {
        throw new ApiError(
          json?.error?.message || json?.message || 'A network error occurred.',
          response.status,
          json?.error?.code || 'API_ERROR',
          json?.error?.details
        );
      }

      return json.data !== undefined ? json.data : json;
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || 'Failed to connect to Finly servers. Please check your connection.', 500, 'NETWORK_ERROR');
    }
  }

  get<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    const isFormData = isFormDataBody(body);
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  patch<T = any>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

