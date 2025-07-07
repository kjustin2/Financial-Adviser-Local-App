/**
 * Enhanced API service with comprehensive error handling, retry logic, and monitoring
 */

import { logger } from '../utils/logger';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any,
    public requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toString(): string {
    return `ApiError ${this.status}: ${this.message}${this.code ? ` (${this.code})` : ''}`;
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`);
    this.name = 'TimeoutError';
  }
}

interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  skipAuth?: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  request_id?: string;
  timestamp?: string;
}

class ApiService {
  private static instance: ApiService;
  private baseURL: string;
  private defaultTimeout: number = 30000; // 30 seconds
  private defaultRetries: number = 3;
  private defaultRetryDelay: number = 1000; // 1 second

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    this.setupGlobalErrorHandling();
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private setupGlobalErrorHandling(): void {
    // Handle global network errors
    window.addEventListener('offline', () => {
      logger.warn('Network connection lost', 'API');
    });

    window.addEventListener('online', () => {
      logger.info('Network connection restored', 'API');
    });
  }

  private getAuthToken(): string | null {
    try {
      return localStorage.getItem('access_token');
    } catch (error) {
      logger.error('Failed to retrieve auth token', 'API', {}, error as Error);
      return null;
    }
  }

  private buildHeaders(config: RequestConfig = {}): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });

    // Add authentication if not skipped
    if (!config.skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // Add custom headers
    if (config.headers) {
      Object.entries(config.headers).forEach(([key, value]) => {
        headers.set(key, value as string);
      });
    }

    // Add request ID for tracing
    headers.set('X-Request-ID', this.generateRequestId());

    return headers;
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private buildURL(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const cleanBaseURL = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
    return `${cleanBaseURL}/${cleanEndpoint}`;
  }

  private async makeRequest(
    url: string,
    config: RequestConfig
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = config.timeout || this.defaultTimeout;

    // Set up timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(url, {
        ...config,
        headers: this.buildHeaders(config),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (controller.signal.aborted) {
        throw new TimeoutError(timeout);
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError('Failed to connect to server');
      }

      throw error;
    }
  }

  private shouldRetry(error: any, attempt: number, maxRetries: number): boolean {
    if (attempt >= maxRetries) {
      return false;
    }

    // Retry on network errors
    if (error instanceof NetworkError || error instanceof TimeoutError) {
      return true;
    }

    // Retry on 5xx server errors
    if (error instanceof ApiError && error.status >= 500) {
      return true;
    }

    // Retry on 429 (rate limit)
    if (error instanceof ApiError && error.status === 429) {
      return true;
    }

    return false;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateRetryDelay(attempt: number, baseDelay: number): number {
    // Exponential backoff with jitter
    const delay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * delay;
    return Math.min(delay + jitter, 30000); // Max 30 seconds
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let responseData: any;
    try {
      responseData = isJson ? await response.json() : await response.text();
    } catch (error) {
      logger.error('Failed to parse response', 'API', {
        status: response.status,
        contentType,
      });
      throw new ApiError(
        'Invalid response format from server',
        response.status
      );
    }

    if (!response.ok) {
      const error = responseData?.error || {};
      throw new ApiError(
        error.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        error.code,
        error.details,
        responseData?.request_id
      );
    }

    // Handle standardized API response format
    if (responseData?.success !== undefined) {
      if (!responseData.success) {
        const error = responseData.error || {};
        throw new ApiError(
          error.message || 'Request failed',
          response.status,
          error.code,
          error.details,
          responseData.request_id
        );
      }
      return responseData.data;
    }

    // Return raw response for non-standardized endpoints
    return responseData;
  }

  async request<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = this.buildURL(endpoint);
    const maxRetries = config.retries ?? this.defaultRetries;
    const baseRetryDelay = config.retryDelay ?? this.defaultRetryDelay;
    
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      const startTime = performance.now();
      
      try {
        logger.apiRequest(
          config.method || 'GET',
          endpoint,
          config.body ? JSON.parse(config.body as string) : undefined
        );

        const response = await this.makeRequest(url, config);
        const result = await this.handleResponse<T>(response);
        const duration = performance.now() - startTime;

        logger.apiResponse(
          config.method || 'GET',
          endpoint,
          response.status,
          duration,
          result
        );

        return result;

      } catch (error) {
        const duration = performance.now() - startTime;
        lastError = error as Error;

        logger.error(
          `API request failed (attempt ${attempt}/${maxRetries + 1})`,
          'API',
          {
            endpoint,
            method: config.method || 'GET',
            duration,
            error: error instanceof Error ? error.message : 'Unknown error',
            status: error instanceof ApiError ? error.status : undefined,
          },
          error as Error
        );

        // Don't retry on the last attempt
        if (attempt === maxRetries + 1) {
          break;
        }

        // Check if we should retry
        if (!this.shouldRetry(error, attempt, maxRetries)) {
          break;
        }

        // Wait before retrying
        const retryDelay = this.calculateRetryDelay(attempt, baseRetryDelay);
        logger.info(`Retrying request in ${retryDelay}ms`, 'API');
        await this.delay(retryDelay);
      }
    }

    throw lastError;
  }

  // Convenience methods
  async get<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // Health check endpoint
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health', { skipAuth: true, retries: 1, timeout: 5000 });
  }

  // Connection test
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      logger.error('Connection test failed', 'API', {}, error as Error);
      return false;
    }
  }

  // Update base URL (useful for environment switching)
  updateBaseURL(newBaseURL: string): void {
    this.baseURL = newBaseURL.endsWith('/') ? newBaseURL.slice(0, -1) : newBaseURL;
    logger.info(`API base URL updated to: ${this.baseURL}`, 'API');
  }

  // Get current configuration
  getConfig(): {
    baseURL: string;
    defaultTimeout: number;
    defaultRetries: number;
    defaultRetryDelay: number;
  } {
    return {
      baseURL: this.baseURL,
      defaultTimeout: this.defaultTimeout,
      defaultRetries: this.defaultRetries,
      defaultRetryDelay: this.defaultRetryDelay,
    };
  }
}

// Export singleton instance
export const apiService = ApiService.getInstance();
export default apiService;