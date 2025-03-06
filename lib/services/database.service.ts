import { getCookie } from "@/lib/utils";
import { sqlQueriesService } from "./sql-queries";

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

export interface DatabaseTable {
  name: string;
  type?: string;
  schema?: string;
  columns?: {
    name: string;
    type: string;
    nullable: boolean;
  }[];
}

export interface DatabaseService {
  getDatabaseConnections: () => Promise<
    {
      id: string;
      name: string;
      host: string;
      port: number | string;
      username: string;
      password?: string;
      database: string;
      db_type: string;
      is_active: boolean;
      description?: string;
      connection_options?: Record<string, any>;
      status?: string;
    }[]
  >;

  getDatabaseTables: (connectionId: string, db_type: string) => any;
}

class DatabaseServiceImpl implements DatabaseService {
  private baseUrl = "/api/v1/database-connections";

  async getDatabaseConnections(): Promise<
    {
      id: string;
      name: string;
      host: string;
      port: number | string;
      username: string;
      password?: string;
      database: string;
      db_type: string;
      is_active: boolean;
      description?: string;
      connection_options?: Record<string, any>;
      status?: string;
    }[]
  > {
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

  async getDatabaseTables(connection_id: string, db_type: string) {
    const TABLE_QUERY = {
      postgresql: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`,
      mysql: `SHOW TABLES;`,
    };
    const response = await sqlQueriesService.executeSQLQuery({
      query: TABLE_QUERY[db_type],
      connection_id,
      params: {},
    });
    if (response.result) return response.result || [];
  }
}

export const databaseService = new DatabaseServiceImpl();
