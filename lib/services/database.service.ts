import { deleteCookie, getCookie } from "@/lib/utils";
import { sqlQueriesService } from "./sql-queries";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { signOut } from "next-auth/react";
import { DatabaseConnection } from "@/contexts/database-context";
import { clearAllCookies, logout } from "../actions";
import { authService } from "./auth";
import { log } from "console";

export interface CreateDatabaseConnection {
  name: string;
  description: string;
  db_type: string;
  host: string;
  port: number;
  username: string;
  default_database_name: string;
  connection_options: Record<string, any>;
  password: string;
}

export interface DatabaseTable {
  columns: string[];
  rows: any[][];
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
  private catalogBaseUrl = "/api/v1/catalog/databases";

  async getDatabaseConnections(): Promise<DatabaseConnection[]> {
    const response = await fetch(this.baseUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
    });
    if (response.status === 401) {
      console.log(">>>> logout inside database service");
      logout();
      await signOut();
      window.location.href = "/";
    }
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
    newData: Partial<CreateDatabaseConnection>
  ): Promise<DatabaseConnection> {
    // Get current connection data
    const currentConnection = await this.getDatabaseConnection(id);

    // Compare and only include changed fields
    const changedFields = Object.entries(newData).reduce(
      (acc, [key, value]) => {
        if (
          value !== undefined &&
          value !== currentConnection[key as keyof DatabaseConnection]
        ) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, any>
    );

    // Only make the request if there are changes
    if (Object.keys(changedFields).length === 0) {
      return currentConnection;
    }

    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
      body: JSON.stringify(changedFields),
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

  async getDatabaseTables(database_id: string) {
    // const TABLE_QUERY = {
    //   postgresql: `SELECT table_name, column_name, data_type
    //         FROM information_schema.columns
    //         WHERE table_schema = 'public'
    //         ORDER BY table_name, ordinal_position;`,
    //   mysql: `SELECT
    //         TABLE_NAME AS 'table_name',
    //         COLUMN_NAME AS 'column_name',
    //         DATA_TYPE AS 'data_type'
    //     FROM
    //         INFORMATION_SCHEMA.COLUMNS
    //     WHERE
    //         TABLE_SCHEMA = DATABASE();`,
    // };
    // const response = await sqlQueriesService.executeSQLQuery({
    //   query_text: TABLE_QUERY[db_type as keyof typeof TABLE_QUERY],
    //   database_id,
    //   params: {},
    // });
    // if (response.result) return response.result || [];
    const response = await fetch(
      `${this.catalogBaseUrl}/${database_id}/tables/columns`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("id_token")}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to create database connection");
    }
    return response.json();
  }

  async getDatabaseDescription(
    database_id: string,
    db_type: string,
    table_name: string
  ) {
    const TABLE_QUERY = {
      postgresql: `SELECT column_name, data_type, character_maximum_length, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = '${table_name}';`,
      mysql: `DESCRIBE ${table_name};`,
    };
    const response = await sqlQueriesService.executeSQLQuery({
      query_text: TABLE_QUERY[db_type as keyof typeof TABLE_QUERY],
      database_id,
      params: {},
    });
    if (response.result) return response.result || [];
  }
}

export const databaseService = new DatabaseServiceImpl();
