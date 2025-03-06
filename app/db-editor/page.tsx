"use client";

import React, { useState } from "react";
import { SQLEditor } from "@/components/editor/sql-editor";
import { ResultsTable } from "@/components/editor/results-table";
import { sqlQueriesService } from "@/lib/services/sql-queries";

export default function EditorPage() {
  const [query, setQuery] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExecuteQuery = async () => {
    if (!query.trim()) return;

    setIsExecuting(true);
    setError(null);

    try {
      const response = await sqlQueriesService.executeSQLQuery({
        query,
        connection_id: "390b4e88-b555-424a-9bf9-0fdbce6f8fea",
        params: {},
      });

      setResults(response.rows || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setResults(null);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      <div className="h-2/5">
        <SQLEditor
          value={query}
          onChange={setQuery}
          onExecute={handleExecuteQuery}
          isExecuting={isExecuting}
        />
      </div>
      <div className="h-3/5 border-t">
        <ResultsTable data={results} isLoading={isExecuting} error={error} />
      </div>
    </div>
  );
}
