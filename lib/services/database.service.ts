import { getCookie } from "@/lib/utils";

export interface DatabaseConnection {
  id: string;
  name: string;
  description?: string;
  host: string;
  port: number | string;
  username: string;
  password?: string;
  database_name: string;
  db_type: string;
  connection_options?: Record<string, any>;
  is_active: boolean;
  status?: string;
}

export interface CreateDatabaseConnection
  extends Omit<DatabaseConnection, "id" | "status"> {
  password: string;
}

class DatabaseService {
  private baseUrl = "/api/v1/database-connections";

  async getDatabaseConnections(): Promise<DatabaseConnection[]> {
    const response = await fetch(this.baseUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch database connections");
    }
    return response.json();
  }

  async getDatabaseConnection(id: string): Promise<DatabaseConnection> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch database connection");
    }
    return response.json();
  }

  async updateDatabaseConnection(
    id: string,
    data: Partial<CreateDatabaseConnection>
  ): Promise<DatabaseConnection> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to update database connection");
    }
    return response.json();
  }

  async deleteDatabaseConnection(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to delete database connection");
    }
  }

  async createDatabaseConnection(
    data: CreateDatabaseConnection
  ): Promise<DatabaseConnection> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to create database connection");
    }
    return response.json();
  }
}

export const databaseService = new DatabaseService();
