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
  database_id?: string;
  created_at?: string;
  updated_at?: string;
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

  async getSavedQueries(database_id: string = ""): Promise<SavedQuery[]> {
    const response = await fetch(
      `${this.baseUrl}${database_id ? `?database_id=${database_id}` : ""}`,
      {
        headers: {
          Authorization: `Bearer ${getCookie("id_token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get saved queries");
    }
    return response.json();
  }

  async updateSavedQuery(
    queryId: string,
    payload: SaveQueryPayload
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${queryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to update saved query");
    }
    return response.json();
  }

  async deleteSavedQuery(queryId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${queryId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete saved query");
    }
    return response.json();
  }
}

export const savedQueriesService = new SavedQueriesService();
