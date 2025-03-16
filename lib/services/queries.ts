import { getCookie } from "../utils";

export interface Query {
  id: string;
  name: string;
  databaseId: string;
  userId: string;
  createdAt: string;
  createdBy: string;
  database: {
    name: string;
  };
}

export interface CreateQueryInput {
  name: string;
  databaseId: string;
}

class QueriesServiceImpl {
  private baseUrl = "/api/v1/queries";

  async getQueries(): Promise<Query[]> {
    const response = await fetch(this.baseUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch queries: ${response.statusText}`);
    }
    return response.json();
  }

  async createQuery(input: CreateQueryInput): Promise<Query> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Failed to create query: ${response.statusText}`);
    }

    return response.json();
  }
}

export const queriesService = new QueriesServiceImpl();
