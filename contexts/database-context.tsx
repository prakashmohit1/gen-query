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

interface CatalogDatabase {
  id: string;
  name: string;
  description?: string;
  connection_id: string;
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

  // Fetch connections
  const fetchConnections = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const connections = await databaseService.getDatabaseConnections();
      
      // Map the response to match our interface
      const mappedConnections = connections.map(conn => ({
        ...conn,
        database_name: conn.database || conn.database_name, // Handle both property names
      }));

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

  // Context value
  const value: DatabaseContextType = {
    ...state,
    selectConnection,
    selectDatabase,
    refreshConnections: fetchConnections,
    selectedConnection,
    selectedDatabase,
    setMovedQueryText,
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
  const { connections, isLoading, error, refreshConnections } = useDatabase();
  return { databases: connections, isLoading, error, refreshConnections };
}

// Utility hook for database list
export function useQueryDetails() {
  const { movedQueryText, setMovedQueryText } = useDatabase();
  return { movedQueryText, setMovedQueryText };
}
