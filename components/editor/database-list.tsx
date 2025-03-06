"use client";

import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Circle, Database, ChevronRight, Table2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DatabaseTable,
  databaseService,
} from "@/lib/services/database.service";
import {
  useDatabaseList,
  useSelectedDatabase,
} from "@/contexts/database-context";

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

interface ConnectionWithTables extends DatabaseConnection {
  tables?: DatabaseTable[];
}

export function DatabaseList({
  onTableClick,
}: {
  onTableClick: (tableName: string) => void;
}) {
  const [expandedConnections, setExpandedConnections] = useState<string[]>([]);
  const [loadingTables, setLoadingTables] = useState<string[]>([]);
  const [connectionTables, setConnectionTables] = useState<
    Record<string, DatabaseTable[]>
  >({});

  const { databases } = useDatabaseList();
  const { selectedConnection, selectConnection } = useSelectedDatabase();

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
        console.log("selectedConnection?.db_type", selectedConnection?.db_type);
        const table = await databaseService.getDatabaseTables(
          connectionId,
          db_type
        );
        if ((table?.rows.length || 0) > 0) {
          setConnectionTables((prev) => ({
            ...prev,
            [connectionId]: table,
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

  return (
    <div className="h-full border-r bg-white">
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold text-purple-900">
          Database Connections
        </h2>
      </div>
      <ScrollArea className="h-[calc(100%-57px)]">
        <div className="p-2">
          {databases
            ?.filter((connection) => connection.is_active)
            .map((connection) => (
              <div key={connection.id} className="space-y-1">
                <button
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-md transition-colors",
                    selectedConnection?.id === connection.id
                      ? "bg-purple-50 text-purple-900"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => {
                    selectConnection(connection.id);
                    toggleExpand(connection.id, connection.db_type);
                  }}
                >
                  <Circle
                    className={cn(
                      "w-2 h-2",
                      connection.is_active
                        ? "text-green-500 fill-current"
                        : "text-gray-400"
                    )}
                  />
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
                      connectionTables[connection.id]?.rows?.map(
                        (table) =>
                          table[0] && (
                            <div
                              onClick={() => onTableClick(table[0])}
                              key={table[0]}
                              className="flex items-center gap-2 px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                              <Table2 className="w-4 h-4" />
                              <span>{table[0]}</span>
                            </div>
                          )
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}
