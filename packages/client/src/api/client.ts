import axios, { type AxiosInstance } from 'axios';

/**
 * API client for communicating with the backend server
 * Configured to work with the Express backend
 */
class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Get server status
   */
  async getServerStatus(): Promise<{ port: number; status: string }> {
    const response = await this.client.get<{ port: number; status: string }>('/api/status');
    return response.data;
  }

  /**
   * Set base URL dynamically (called when port is discovered)
   */
  setBaseURL(baseURL: string): void {
    this.client.defaults.baseURL = baseURL;
  }

  /**
   * Get the Axios instance for advanced usage
   */
  getClient(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
