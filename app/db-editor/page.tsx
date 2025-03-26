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

export default function EditorPage() {
  const [query, setQuery] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const { selectedDatabase, selectedConnection } = useSelectedDatabase();
  const { movedQueryText, setMovedQueryText } = useQueryDetails();

  const handleExecuteQuery = async (selectedQuery: string) => {
    if (!selectedQuery || !query.trim() || !selectedDatabase) return;

    setIsExecuting(true);
    setError(null);

    try {
      const response = await sqlQueriesService.executeSQLQuery({
        query_text: selectedQuery || query,
        database_id: selectedDatabase.id,
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

  useEffect(() => {
    if (movedQueryText) {
      setQuery(movedQueryText);
      setMovedQueryText(null);
    }
  }, [movedQueryText]);

  return (
    <div className="h-screen bg-white">
      <ResizablePanelGroup direction="horizontal">
        <DatabaseList />

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
                tables={[]}
                dbType={selectedConnection?.db_type.toLowerCase()}
                results={results}
                error={error}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
