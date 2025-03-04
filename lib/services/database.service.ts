import { getCookie } from "@/lib/utils";

export interface DatabaseConnection {
  id: string;
  name: string;
  type: string;
  status: string;
  createdBy: string;
  size: string;
  activeConnections: number;
  maxConnections: number;
  connectionType: string;
}

interface DatabaseConnectionPayload {
  name: string;
  description: string;
  db_type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database_name: string;
  connection_options: Record<string, any>;
}

class DatabaseService {
  private baseUrl = "/api/database-connections";

  async getDatabaseConnections(): Promise<DatabaseConnection[]> {
    try {
      const response = await fetch(this.baseUrl, {
        headers: {
          Authorization: `Bearer ${getCookie("id_token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch database connections");
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching database connections:", error);
      throw error;
    }
  }

  async createDatabaseConnection(
    data: DatabaseConnectionPayload
  ): Promise<DatabaseConnection> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("id_token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || "Failed to create database connection"
        );
      }

      return response.json();
    } catch (error) {
      console.error("Error creating database connection:", error);
      throw error;
    }
  }

  async updateDatabaseConnection(
    id: string,
    data: Partial<DatabaseConnection>
  ): Promise<DatabaseConnection> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || "Failed to update database connection"
        );
      }

      return response.json();
    } catch (error) {
      console.error("Error updating database connection:", error);
      throw error;
    }
  }

  async deleteDatabaseConnection(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || "Failed to delete database connection"
        );
      }
    } catch (error) {
      console.error("Error deleting database connection:", error);
      throw error;
    }
  }
}

export const databaseService = new DatabaseService();
