import { Message } from "@/types/chat";
import { getCookie } from "../utils";

export interface AiAgentResponse {
  messages: Message[];
  sql?: string;
  error?: string;
}

export interface ChatRequest {
  database_connection_id?: string;
  messages: Message[];
}

export class AiAgentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  }

  async sendMessage(request: ChatRequest): Promise<AiAgentResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/chat-conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("id_token")}`,
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      throw error;
    }
  }
}

export const aiAgentServices = new AiAgentService();
