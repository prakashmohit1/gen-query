import { getCookie } from "@/lib/utils";

interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

class ApiService {
  // Using relative URL for Next.js API routes
  private baseUrl = "/api";

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const status = response.status;

    try {
      const data = await response.json();

      if (status === 401) {
        console.error("Unauthorized access - token might be expired");
        return {
          data: {} as T,
          error: "Unauthorized access. Please login again.",
          status,
        };
      }

      if (!response.ok) {
        return {
          data: {} as T,
          error: data.error || "An error occurred",
          status,
        };
      }

      return { data, status };
    } catch (error) {
      return {
        data: {} as T,
        error: "Failed to parse response",
        status,
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
        credentials: "same-origin", // Use same-origin for Next.js API routes
        headers: {
          Authorization: `Bearer ${getCookie("id_token")}`,
        },
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        data: {} as T,
        error: "Network error",
        status: 500,
      };
    }
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: "same-origin",
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        data: {} as T,
        error: "Network error",
        status: 500,
      };
    }
  }

  async put<T>(
    endpoint: string,
    id: string,
    body: any
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: "same-origin",
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        data: {} as T,
        error: "Network error",
        status: 500,
      };
    }
  }

  async delete<T>(endpoint: string, id: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}?id=${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        data: {} as T,
        error: "Network error",
        status: 500,
      };
    }
  }
}

export const apiService = new ApiService();
