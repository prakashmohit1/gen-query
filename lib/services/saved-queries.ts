import { getCookie } from "../utils";

export interface SaveQueryPayload {
  name: string;
  description: string;
  query_text: string;
  database_id: string;
}

export interface SavedQuery {
  id: string;
  name: string;
  description: string;
  query_text: string;
}
class SavedQueriesService {
  private baseUrl = "/api/v1/saved-queries";

  async saveQuery(payload: SaveQueryPayload): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to save query");
    }
    return response.json();
  }

  async getSavedQueries(): Promise<SavedQuery[]> {
    const response = await fetch(this.baseUrl, {
      headers: {
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get saved queries");
    }
    return response.json();
  }
}

export const savedQueriesService = new SavedQueriesService();
