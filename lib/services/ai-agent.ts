import { Message } from "@/types/chat";
import { getCookie } from "../utils";

export interface AiAgentResponse {
  id?: string;
  messages: Message[];
  sql?: string;
  error?: string;
}

export interface ChatRequest {
  database_server_connection_id?: string;
  messages: Message[];
}

export interface ChatConversation {
  id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export class AiAgentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getCookie("id_token")}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 204) {
        return null as T;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Request failed");
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error(`Error in ${endpoint}:`, error);
      throw error;
    }
  }

  async sendMessage(
    request: ChatRequest,
    conversationId?: string
  ): Promise<AiAgentResponse> {
    if (conversationId) {
      // If conversationId exists, use PUT to update existing conversation
      return this.makeRequest<AiAgentResponse>(
        `/api/v1/chat-conversations/${conversationId}`,
        {
          method: "PUT",
          body: JSON.stringify(request),
        }
      );
    } else {
      // If no conversationId, use POST to create new conversation
      return this.makeRequest<AiAgentResponse>("/api/v1/chat-conversations", {
        method: "POST",
        body: JSON.stringify(request),
      });
    }
  }

  async getChatHistory(): Promise<ChatConversation[]> {
    return this.makeRequest<ChatConversation[]>("/api/v1/chat-conversations", {
      method: "GET",
    });
  }

  async deleteConversation(conversationId: string): Promise<void> {
    return this.makeRequest<void>(
      `/api/v1/chat-conversations/${conversationId}`,
      {
        method: "DELETE",
      }
    );
  }

  async updateConversation(
    conversationId: string,
    messages: Message[]
  ): Promise<ChatConversation> {
    return this.makeRequest<ChatConversation>(
      `/api/v1/chat-conversations/${conversationId}`,
      {
        method: "PUT",
        body: JSON.stringify({ messages }),
      }
    );
  }

  async createConversation(
    databaseConnectionId?: string
  ): Promise<ChatConversation> {
    return this.makeRequest<ChatConversation>("/api/v1/chat-conversations", {
      method: "PUT",
      body: JSON.stringify({
        database_server_connection_id: databaseConnectionId,
        messages: [],
      }),
    });
  }
}

export const aiAgentServices = new AiAgentService();
