"use client";

import React, { useState, useEffect } from "react";
import { SQLEditor } from "@/components/editor/sql-editor";
import { DatabaseList } from "@/components/editor/database-list";
import { sqlQueriesService } from "@/lib/services/sql-queries";
import { databaseService } from "@/lib/services/database.service";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { DatabaseTable } from "@/lib/services/database.service";
import {
  useQueryDetails,
  useSelectedDatabase,
} from "@/contexts/database-context";

export default function EditorPage() {
  const [query, setQuery] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const { selectedConnection } = useSelectedDatabase();
  const { movedQueryText, setMovedQueryText } = useQueryDetails();
  const [databaseTables, setDatabaseTables] = useState<DatabaseTable[]>([]);

  const handleExecuteQuery = async (selectedQuery: string) => {
    if (!selectedQuery || !selectedQuery.trim() || !selectedConnection) return;

    setIsExecuting(true);
    setError(null);

    try {
      const response = await sqlQueriesService.executeSQLQuery({
        query: selectedQuery,
        connection_id: selectedConnection.id,
        params: parameters,
      });

      setResults(response || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setResults(null);
    } finally {
      setIsExecuting(false);
    }
  };

  const onTableClick = (tableName: string) => {
    setQuery(`${query} ${tableName}`);
  };

  useEffect(() => {
    if (movedQueryText) {
      setQuery(movedQueryText);
      setMovedQueryText(null);
    }
  }, [movedQueryText]);

  useEffect(() => {
    if (selectedConnection) {
      databaseService
        .getDatabaseTables(selectedConnection.id, selectedConnection.db_type)
        .then((result) => {
          if (result?.rows) {
            // Transform the rows into DatabaseTable format
            const tables = result.rows.map((row) => ({
              name: row.table_name || row.TABLE_NAME || Object.values(row)[0],
              type: "table",
              schema: "public",
              columns: [
                {
                  name: "id",
                  type: "integer",
                  nullable: false,
                },
              ], // Default column until we implement column fetching
            }));
            setDatabaseTables(tables);
          }
        });
    }
  }, [selectedConnection]);

  return (
    <div className="h-screen bg-white">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <DatabaseList onTableClick={onTableClick} />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={80}>
          <SQLEditor
            parameters={parameters}
            setParameters={setParameters}
            value={query}
            onChange={setQuery}
            onExecute={handleExecuteQuery}
            isExecuting={isExecuting}
            selectedDatabase={
              selectedConnection
                ? {
                    name: selectedConnection.name,
                    database: selectedConnection.database_name,
                  }
                : undefined
            }
            tables={databaseTables}
            dbType={selectedConnection?.db_type.toLowerCase()}
            results={results}
            error={error}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
