"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Circle,
  Database,
  ChevronRight,
  Table2,
  Loader2,
  FileCode,
  Trash2,
  AlertTriangle,
  X,
  Search,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DatabaseTable,
  databaseService,
} from "@/lib/services/database.service";
import {
  useDatabaseList,
  useQueryDetails,
  useSelectedDatabase,
} from "@/contexts/database-context";
import { sqlQueriesService } from "@/lib/services/sql-queries";
import { format } from "date-fns";

interface DatabaseConnection {
  id: string;
  name: string;
  host: string;
  port: number | string;
  username: string;
  password?: string;
  database: string;
  database_name?: string;
  db_type: string;
  is_active: boolean;
  description?: string;
  connection_options?: Record<string, any>;
  status?: string;
}

type TabType = "databases" | "workspaces";

// Add DeleteConfirmationDialog component
const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  queryName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  queryName: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Delete Query</h3>
        </div>
        <p className="text-gray-600 mb-2">
          Are you sure you want to delete this query?
        </p>
        <p className="text-sm text-gray-500 mb-6 break-all">"{queryName}"</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export function DatabaseList({ connectionId }: { connectionId?: string }) {
  const [expandedConnections, setExpandedConnections] = useState<string[]>([]);
  const [expandedTables, setExpandedTables] = useState<string[]>([]);
  const [loadingTables, setLoadingTables] = useState<string[]>([]);
  const [connectionTables, setConnectionTables] = useState<
    Record<string, DatabaseTable>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { databases, isLoading, error, refreshConnections } = useDatabaseList();
  const { selectedConnection, selectConnection } = useSelectedDatabase();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshConnections();
    setIsRefreshing(false);
  };

  const filteredDatabases = useMemo(() => {
    return databases
      ?.filter((connection) => connection.is_active)
      .filter((connection) =>
        connection.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [databases, searchQuery]);

  const toggleExpand = async (connectionId: string, db_type: string) => {
    if (expandedConnections.includes(connectionId)) {
      setExpandedConnections((prev) =>
        prev.filter((id) => id !== connectionId)
      );
      return;
    }

    setExpandedConnections((prev) => [...prev, connectionId]);

    // Fetch tables if not already loaded
    if (!connectionTables[connectionId]) {
      setLoadingTables((prev) => [...prev, connectionId]);
      try {
        const table = await databaseService.getDatabaseTables(
          connectionId,
          db_type
        );
        if ((table?.rows.length || 0) > 0) {
          setConnectionTables((prev) => ({
            ...prev,
            [connectionId]: table as unknown as DatabaseTable,
          }));
        }
      } catch (error) {
        console.error("Error fetching tables:", error);
      } finally {
        setLoadingTables((prev) => prev.filter((id) => id !== connectionId));
      }
    }
  };

  useEffect(() => {
    const activeConnections = databases.filter(
      (connection) => connection.is_active
    );
    if (activeConnections.length > 0 && !selectedConnection) {
      selectConnection(activeConnections[0].id);
    }
  }, [databases, selectedConnection, selectConnection]);

  useEffect(() => {
    if (connectionId) {
      selectConnection(connectionId);
    }
  }, [connectionId, selectConnection]);

  return (
    <div className="h-full border-r bg-white w-[280px]">
      {/* Header with search and refresh */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search databases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100%-73px)]">
        <div className="p-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center pt-8">
              <Loader2 className="w-4 h-4 animate-spin" />
              <div className="text-sm text-gray-500 pt-4">
                Loading Databases...
              </div>
            </div>
          ) : (
            filteredDatabases?.map((connection) => (
              <div key={connection.id} className="space-y-1">
                <button
                  className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedConnection?.id === connection.id
                      ? "bg-blue-50 text-blue-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    selectConnection(connection.id);
                    toggleExpand(connection.id, connection.db_type);
                  }}
                >
                  <Database className="w-4 h-4" />
                  <span className="flex-1 text-left">{connection.name}</span>
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 transition-transform",
                      expandedConnections.includes(connection.id) && "rotate-90"
                    )}
                  />
                </button>
                {expandedConnections.includes(connection.id) && (
                  <div className="ml-8 space-y-1">
                    {loadingTables.includes(connection.id) ? (
                      <div className="flex items-center gap-2 px-2 py-1 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading tables...</span>
                      </div>
                    ) : connectionTables[connection.id]?.rows?.length === 0 ? (
                      <div className="px-2 py-1 text-sm text-gray-500">
                        No tables found
                      </div>
                    ) : (
                      // Group tables and their columns
                      (() => {
                        const tableMap = new Map();
                        connectionTables[connection.id]?.rows?.forEach(
                          (row) => {
                            const tableName = row[0];
                            const columnName = row[1];
                            if (!tableMap.has(tableName)) {
                              tableMap.set(tableName, []);
                            }
                            if (columnName) {
                              tableMap.get(tableName).push(columnName);
                            }
                          }
                        );

                        return Array.from(tableMap.entries()).map(
                          ([tableName, columns]) => (
                            <div key={tableName} className="space-y-0.5">
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedTables((prev) =>
                                    prev.includes(tableName)
                                      ? prev.filter((t) => t !== tableName)
                                      : [...prev, tableName]
                                  );
                                }}
                                className="flex items-center gap-2 px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer font-medium"
                              >
                                <Table2 className="w-4 h-4" />
                                <span className="flex-1">{tableName}</span>
                                <ChevronRight
                                  className={cn(
                                    "w-3 h-3 transition-transform",
                                    expandedTables.includes(tableName) &&
                                      "rotate-90"
                                  )}
                                />
                              </div>
                              {expandedTables.includes(tableName) && (
                                <div className="ml-6 border-l border-gray-200 pl-2">
                                  {columns.map((columnName: string) => (
                                    <div
                                      key={`${tableName}-${columnName}`}
                                      className="flex items-center gap-2 px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-50 rounded-md"
                                    >
                                      <span>{columnName}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        );
                      })()
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
