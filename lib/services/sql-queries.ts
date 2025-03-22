import { getCookie } from "@/lib/utils";

export interface SQLQuery {
  id: string;
  name: string;
  description?: string;
  query_text: string;
  params?: Record<string, any>;
  connection_id: string;
  created_at: string;
  updated_at: string;
  status?: string;
  execution_status: boolean;
  error_message?: string;
  execution_time_ms?: number;
  source?: string;
  result: {
    columns: string[];
    rows: Record<string, any>[];
  };
}

export interface ExecuteSQLQuery {
  query_text: string;
  database_id: string;
  params?: Record<string, any>;
}

class SQLQueriesService {
  private baseUrl = "/api/v1/sql-queries";

  async getSQLQueries(): Promise<SQLQuery[]> {
    const response = await fetch(this.baseUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch SQL queries");
    }
    return response.json();
  }

  async getSQLQuery(id: string): Promise<SQLQuery> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch SQL query");
    }
    return response.json();
  }

  //   async updateSQLQuery(
  //     id: string,
  //     data: Partial<CreateSQLQuery>
  //   ): Promise<SQLQuery> {
  //     const response = await fetch(`${this.baseUrl}/${id}`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${getCookie("id_token")}`,
  //       },
  //       body: JSON.stringify(data),
  //     });
  //     if (!response.ok) {
  //       throw new Error("Failed to update SQL query");
  //     }
  //     return response.json();
  //   }

  async deleteSQLQuery(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to delete SQL query");
    }
  }

  async executeSQLQuery(data: ExecuteSQLQuery): Promise<SQLQuery> {
    const response = await fetch(`${this.baseUrl}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.execution_status) {
      throw new Error(result.error_message || "Query execution failed");
    }

    return result;
  }
}

export const sqlQueriesService = new SQLQueriesService();
