"use client";

import React, { useState, useEffect } from "react";
import { SQLEditor } from "@/components/editor/sql-editor";
import { ResultsTable } from "@/components/editor/results-table";
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
  tables?: DatabaseTable[];
}

export default function EditorPage() {
  const [query, setQuery] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const { selectedConnection } = useSelectedDatabase();
  const { movedQueryText, setMovedQueryText } = useQueryDetails();
  const handleExecuteQuery = async () => {
    if (!query.trim() || !selectedConnection) return;

    setIsExecuting(true);
    setError(null);

    try {
      const response = await sqlQueriesService.executeSQLQuery({
        query,
        connection_id: selectedConnection.id,
        params: parameters,
      });

      console.log("response", response);
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

  return (
    <div className="h-screen bg-white">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <DatabaseList onTableClick={onTableClick} />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={80}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={40}>
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
                tables={selectedConnection?.tables || []}
                dbType={selectedConnection?.db_type.toLowerCase()}
              />
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={60}>
              <ResultsTable
                data={results}
                isLoading={isExecuting}
                error={error}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
