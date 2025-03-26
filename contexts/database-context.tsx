"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { databaseService } from "@/lib/services/database.service";

// Types
export interface DatabaseConnection {
  id: string;
  name: string;
  host: string;
  port: number | string;
  username: string;
  password?: string;
  database_name: string;
  db_type: string;
  is_active: boolean;
  description?: string;
  connection_options?: Record<string, any>;
  status?: string;
  team_id?: string;
  catalog_databases?: CatalogDatabase[];
  default_database_name?: string;
  created_at?: string;
}

interface CatalogTable {
  id: string;
  name: string;
  description: string;
  database_id: string;
  schema: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  columns?: CatalogColumn[];
}

interface CatalogColumn {
  id: string;
  name: string;
  description: string;
  table_id: string;
  data_type: string;
  is_nullable: boolean;
  ordinal_position: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

interface CatalogDatabase {
  id: string;
  name: string;
  description?: string;
  connection_id: string;
  tables?: CatalogTable[];
  loadingTable?: boolean;
}

interface DatabaseState {
  connections: DatabaseConnection[];
  selectedConnectionId: string | null;
  selectedDatabaseId: string | null;
  isLoading: boolean;
  error: string | null;
  movedQueryText: string | null;
}

interface DatabaseContextType extends DatabaseState {
  selectConnection: (id: string | null) => void;
  selectDatabase: (id: string | null) => void;
  refreshConnections: () => Promise<void>;
  selectedConnection: DatabaseConnection | null;
  selectedDatabase: CatalogDatabase | null;
  movedQueryText: string | null;
  setMovedQueryText: (text: string | null) => void;
  fetchTableColumns: (databaseId: string) => void;
}

// Context
const DatabaseContext = createContext<DatabaseContextType | undefined>(
  undefined
);

// Provider
export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  // State
  const [state, setState] = useState<DatabaseState>({
    connections: [],
    selectedConnectionId: null,
    selectedDatabaseId: null,
    isLoading: true,
    error: null,
    movedQueryText: null,
  });

  // Load saved connection and database IDs from localStorage
  useEffect(() => {
    const savedConnectionId = localStorage.getItem("selectedConnectionId");
    const savedDatabaseId = localStorage.getItem("selectedDatabaseId");
    if (savedConnectionId) {
      setState((prev) => ({
        ...prev,
        selectedConnectionId: savedConnectionId,
      }));
    }
    if (savedDatabaseId) {
      setState((prev) => ({ ...prev, selectedDatabaseId: savedDatabaseId }));
    }
  }, []);

  const fetchTableColumns = async (databaseId: string) => {
    try {
      // Create a deep copy of connections to avoid mutating state directly
      const updatedConnections = state.connections.map((conn) => ({
        ...conn,
        catalog_databases: conn.catalog_databases?.map((db) => {
          if (db.id === databaseId) {
            return { ...db, loadingTable: true };
          }
          return db;
        }),
      }));

      // Update state to show loading
      setState((prev) => ({
        ...prev,
        connections: updatedConnections,
      }));

      // Fetch tables data
      const response = await databaseService.getDatabaseTables(databaseId);

      // Update the connections with the fetched tables
      const connectionsWithTables = updatedConnections.map((conn) => ({
        ...conn,
        catalog_databases: conn.catalog_databases?.map((db) => {
          if (db.id === databaseId) {
            return {
              ...db,
              tables: response.tables,
              loadingTable: false,
            };
          }
          return db;
        }),
      }));

      // Update state with the new data
      setState((prev) => ({
        ...prev,
        connections: connectionsWithTables,
        isLoading: false,
      }));

      return response.tables;
    } catch (error) {
      console.error("Error fetching table columns:", error);

      // Update state to remove loading state in case of error
      setState((prev) => ({
        ...prev,
        connections: prev.connections.map((conn) => ({
          ...conn,
          catalog_databases: conn.catalog_databases?.map((db) => {
            if (db.id === databaseId) {
              return { ...db, loadingTable: false };
            }
            return db;
          }),
        })),
        isLoading: false,
      }));
    }
  };

  // Fetch connections
  const fetchConnections = async () => {
    console.log("fetchConnections");
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const connections = await databaseService.getDatabaseConnections();
      console.log("connections", connections);

      // Map the response to match our interface
      const mappedConnections = connections.map((conn: DatabaseConnection) => {
        conn.catalog_databases?.map((db: any) => {
          db.loadingTable = true;
        });
        return {
          ...conn,
        };
      });

      setState((prev) => ({
        ...prev,
        connections: mappedConnections,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Failed to fetch databases",
        isLoading: false,
      }));
    }
  };

  const setMovedQueryText = (text: string | null) => {
    setState((prev) => ({ ...prev, movedQueryText: text }));
  };

  // Initial fetch
  useEffect(() => {
    fetchConnections();
  }, []);

  // Save selected connection and database to localStorage
  useEffect(() => {
    if (state.selectedConnectionId) {
      localStorage.setItem("selectedConnectionId", state.selectedConnectionId);
    } else {
      localStorage.removeItem("selectedConnectionId");
    }
    if (state.selectedDatabaseId) {
      localStorage.setItem("selectedDatabaseId", state.selectedDatabaseId);
    } else {
      localStorage.removeItem("selectedDatabaseId");
    }
  }, [state.selectedConnectionId, state.selectedDatabaseId]);

  // Select connection handler
  const selectConnection = (id: string | null) => {
    setState((prev) => ({ ...prev, selectedConnectionId: id }));
  };

  // Select database handler
  const selectDatabase = (id: string | null) => {
    setState((prev) => ({ ...prev, selectedDatabaseId: id }));
  };

  // Get selected connection
  const selectedConnection = state.selectedConnectionId
    ? state.connections.find(
        (conn) => conn.id === state.selectedConnectionId
      ) || null
    : null;

  // Get selected database
  const selectedDatabase = state.selectedDatabaseId
    ? state.connections
        .flatMap((conn) => conn.catalog_databases || [])
        .find((db) => db.id === state.selectedDatabaseId) || null
    : null;

  console.log("selectedDatabase", selectedDatabase);

  // Context value
  const value: DatabaseContextType = {
    ...state,
    selectConnection,
    selectDatabase,
    refreshConnections: fetchConnections,
    selectedConnection,
    selectedDatabase,
    setMovedQueryText,
    fetchTableColumns,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

// Hook
export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
}

// Update useSelectedDatabase hook
export function useSelectedDatabase() {
  const {
    selectedConnection,
    selectedDatabase,
    selectConnection,
    selectDatabase,
    isLoading,
    error,
  } = useDatabase();
  return {
    selectedConnection,
    selectedDatabase,
    selectConnection,
    selectDatabase,
    isLoading,
    error,
  };
}

// Utility hook for database list
export function useDatabaseList() {
  const {
    connections,
    isLoading,
    error,
    refreshConnections,
    fetchTableColumns,
  } = useDatabase();
  return {
    databases: connections,
    isLoading,
    error,
    refreshConnections,
    fetchTableColumns,
  };
}

// Utility hook for database list
export function useQueryDetails() {
  const { movedQueryText, setMovedQueryText } = useDatabase();
  return { movedQueryText, setMovedQueryText };
}
