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
}

interface DatabaseState {
  connections: DatabaseConnection[];
  selectedConnectionId: string | null;
  isLoading: boolean;
  error: string | null;
  movedQueryText: string | null;
}

interface DatabaseContextType extends DatabaseState {
  selectConnection: (id: string | null) => void;
  refreshConnections: () => Promise<void>;
  selectedConnection: DatabaseConnection | null;
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
    isLoading: true,
    error: null,
    movedQueryText: null,
  });

  // Load saved connection ID from localStorage
  useEffect(() => {
    const savedId = localStorage.getItem("selectedConnectionId");
    if (savedId) {
      setState((prev) => ({ ...prev, selectedConnectionId: savedId }));
    }
  }, []);

  // Fetch connections
  const fetchConnections = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const connections = await databaseService.getDatabaseConnections();

      setState((prev) => ({
        ...prev,
        connections,
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

  // Save selected connection to localStorage
  useEffect(() => {
    if (state.selectedConnectionId) {
      localStorage.setItem("selectedConnectionId", state.selectedConnectionId);
    } else {
      localStorage.removeItem("selectedConnectionId");
    }
  }, [state.selectedConnectionId]);

  // Select connection handler
  const selectConnection = (id: string | null) => {
    setState((prev) => ({ ...prev, selectedConnectionId: id }));
  };

  // Get selected connection
  const selectedConnection = state.selectedConnectionId
    ? state.connections.find(
        (conn) => conn.id === state.selectedConnectionId
      ) || null
    : null;

  // Context value
  const value: DatabaseContextType = {
    ...state,
    selectConnection,
    refreshConnections: fetchConnections,
    selectedConnection,
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

// Utility hook for selected connection
export function useSelectedDatabase() {
  const { selectedConnection, selectConnection, isLoading, error } =
    useDatabase();
  return { selectedConnection, selectConnection, isLoading, error };
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
