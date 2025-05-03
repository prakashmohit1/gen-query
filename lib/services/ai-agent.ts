import { Message } from "@/types/chat";
import { getCookie } from "../utils";

export interface AiAgentResponse {
  id?: string;
  conversation_id?: string;
  messages: Message[];
  sql?: string;
  error?: string;
  panelSize?: number;
}

export interface ChatOptions {
  filter: string;
  limit: number;
  table_name?: string;
  columns?: string[];
  panelConfig?: {
    defaultSize: number;
    minSize: number;
    maxSize: number;
  };
}

export interface ChatRequest {
  database_server_connection_id: string;
  options: ChatOptions;
  user_message: string;
}

export interface ChatConversation {
  id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  panelSize?: number;
}

export class AiAgentService {
  private baseUrl: string;
  private defaultPanelConfig = {
    defaultSize: 30,
    minSize: 20,
    maxSize: 50,
  };

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
    // Add panel configuration to the request if not present
    const requestWithPanel = {
      ...request,
      options: {
        ...request.options,
        panelConfig: request.options.panelConfig || this.defaultPanelConfig,
      },
    };

    if (conversationId) {
      // If conversationId exists, use PUT to update existing conversation
      return this.makeRequest<AiAgentResponse>(
        `/api/v1/chat-conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify(requestWithPanel),
        }
      );
    } else {
      // If no conversationId, use POST to create new conversation
      return this.makeRequest<AiAgentResponse>("/api/v1/chat-conversations", {
        method: "POST",
        body: JSON.stringify(requestWithPanel),
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
    messages: Message[],
    panelSize?: number
  ): Promise<ChatConversation> {
    return this.makeRequest<ChatConversation>(
      `/api/v1/chat-conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ messages, panelSize }),
      }
    );
  }

  async createConversation(
    databaseConnectionId?: string,
    panelConfig = this.defaultPanelConfig
  ): Promise<ChatConversation> {
    return this.makeRequest<ChatConversation>("/api/v1/chat-conversations", {
      method: "PUT",
      body: JSON.stringify({
        database_server_connection_id: databaseConnectionId,
        messages: [],
        panelConfig,
      }),
    });
  }

  getPanelConfig() {
    return this.defaultPanelConfig;
  }
}

export const aiAgentServices = new AiAgentService();
