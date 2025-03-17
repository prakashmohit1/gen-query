import { getCookie } from "@/lib/utils";

interface UpdateDescriptionPayload {
  description: string;
}

interface CreateTagPayload {
  key: string;
  value: string;
  entity_type: "DATABASE";
  entity_id: string;
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
  }

  async createTag(payload: CreateTagPayload): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to create tag");
    }
  }
}

export const catalogService = new CatalogService();
