import { getCookie } from "@/lib/utils";

interface UpdateDescriptionPayload {
  description: string;
}

interface CreateTagPayload {
  key: string;
  value: string;
}

class CatalogService {
  private baseUrl = "/api/v1/catalog";

  async updateDatabaseDescription(
    databaseId: string,
    payload: UpdateDescriptionPayload
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/databases/${databaseId}/description`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("id_token")}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update database description");
    }

    return response.json();
  }

  async createTag(
    databaseId: string,
    payload: CreateTagPayload
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/databases/${databaseId}/tags`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("id_token")}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create tag");
    }

    return response.json();
  }

  async getTags(databaseId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/databases/${databaseId}/tags`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("id_token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get tags");
    }

    return response.json();
  }
}

export const catalogService = new CatalogService();
