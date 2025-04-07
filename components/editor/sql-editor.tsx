"use client";

import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { vscodeLight } from "@uiw/codemirror-theme-vscode";
import { Button } from "@/components/ui/button";
import {
  Play,
  Database,
  Plus,
  X,
  Clock,
  Settings2,
  Save,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  autocompletion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import { format } from "date-fns";
import { DatabaseSelector } from "@/components/common/database-selector";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ResultsTable } from "@/components/editor/results-table";
import { savedQueriesService } from "@/lib/services/saved-queries";
import { useToast } from "@/components/ui/use-toast";
import { useSelectedDatabase } from "@/contexts/database-context";
import { useSearchParams, useRouter } from "next/navigation";

interface DatabaseColumn {
  name: string;
  type: string;
  comment?: string;
}

interface DatabaseTable {
  name: string;
  type?: string;
  columns?: DatabaseColumn[];
  schema?: string;
}

interface SavedQuery {
  id?: string;
  name: string;
  query_text: string;
  description: string;
  database_id?: string;
  created_at?: string;
  updated_at?: string;
  parameters?: Record<string, string>;
}

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: (queryText: string, params: Record<string, any>) => void;
  isExecuting?: boolean;
  selectedDatabase?: {
    name: string;
    database: string;
    id: string;
  };
  tables?: DatabaseTable[];
  dbType?: string;
  parameters: Record<string, string>;
  setParameters: (params: Record<string, string>) => void;
  results?: any;
  error?: string | null;
}

export function SQLEditor({
  value,
  onChange,
  onExecute,
  isExecuting = false,
  tables = [],
  dbType = "postgresql",
  parameters,
  setParameters,
  results,
  error,
}: SQLEditorProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectDatabase, selectedDatabase } = useSelectedDatabase();

  const [queries, setQueries] = useState<SavedQuery[]>([
    {
      name: new Date().toLocaleString(),
      query_text: value,
      database_id: selectedDatabase?.id,
      description: "",
    },
  ]);
  const [activeQueryId, setActiveQueryId] = useState("");
  const [editingQueryId, setEditingQueryId] = useState<string | null>(null);
  const [editingQueryName, setEditingQueryName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSavedQueries, setIsLoadingSavedQueries] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<any>(null);
  const { toast } = useToast();
  const [lastSavedText, setLastSavedText] = useState(value);
  const [autoSaveInterval, setAutoSaveInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch saved queries when database changes
  useEffect(() => {
    const fetchSavedQueries = async () => {
      if (!selectedDatabase?.id) return;

      try {
        setIsLoadingSavedQueries(true);
        const savedQueries = await savedQueriesService.getSavedQueries(
          selectedDatabase.id || ""
        );

        // Filter queries for the current database
        const databaseQueries = savedQueries.filter(
          (query) => query.database_id === selectedDatabase.id
        );

        // If there are saved queries, set them as tabs
        if (databaseQueries.length > 0) {
          setQueries(databaseQueries);
          const queryId = searchParams.get("query_id");

          // Find the target query
          const targetQuery = queryId
            ? databaseQueries.find((query) => query.id === queryId)
            : databaseQueries[0];

          if (targetQuery) {
            setActiveQueryId(targetQuery.id || "");
            onChange(targetQuery.query_text);
            setParameters(targetQuery.parameters || {});

            // Update URL if queryId is not set
            if (!queryId) {
              const params = new URLSearchParams(searchParams.toString());
              params.set("query_id", targetQuery.id || "");
              params.set("database_id", selectedDatabase.id);
              router.replace(`/db-editor?${params.toString()}`);
            }
          }
        } else {
          // If no saved queries, create a default tab
          const defaultQuery = {
            name: new Date().toLocaleString(),
            query_text: "",
            database_id: selectedDatabase.id,
            description: "",
          };
          setQueries([defaultQuery]);
          setActiveQueryId("");
          onChange("");
          setParameters({});

          // Update URL to remove queryId if present
          const params = new URLSearchParams(searchParams.toString());
          params.delete("query_id");
          router.replace(`/db-editor?${params.toString()}`);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load saved queries",
          variant: "destructive",
        });
      } finally {
        setIsLoadingSavedQueries(false);
      }
    };

    fetchSavedQueries();
  }, [selectedDatabase?.id]);

  const handleAddQuery = () => {
    const newQueryId = "temp-" + Date.now().toString(); // Use timestamp as ID for new tabs
    const newQuery: SavedQuery = {
      id: newQueryId,
      name: new Date().toLocaleString(),
      query_text: "",
      database_id: selectedDatabase?.id,
      description: "",
    };
    setQueries([...queries, newQuery]);
    setActiveQueryId(newQueryId);
    onChange("");
    setParameters({});
  };

  const handleRemoveQuery = (queryId: string) => {
    if (queries.length === 1) return; // Don't remove the last tab
    const newQueries = queries.filter((query) => query.id !== queryId);
    setQueries(newQueries);

    // If removing active tab, switch to the last tab
    if (queryId === activeQueryId) {
      const lastQuery = newQueries[newQueries.length - 1];
      setActiveQueryId(lastQuery.id || "");
      onChange(lastQuery.query_text);
      setParameters(lastQuery.parameters || {});
    }
  };

  const handleTabChange = (queryId: string) => {
    // Save current tab state
    const updatedQueries = queries.map((query) =>
      query.id === activeQueryId
        ? { ...query, query_text: value, parameters: parameters }
        : query
    );

    // Switch to new tab
    const newQuery = updatedQueries.find((query) => query.id === queryId);
    if (newQuery) {
      setQueries(updatedQueries);
      setActiveQueryId(queryId);
      onChange(newQuery.query_text);
      setParameters(newQuery.parameters || {});

      // Update URL with new queryId
      const params = new URLSearchParams(searchParams.toString());
      params.set("query_id", queryId);
      if (selectedDatabase?.id) {
        params.set("database_id", selectedDatabase.id);
      }
      router.replace(`/db-editor?${params.toString()}`);
    }
  };

  const sqlCompletions = useMemo(() => {
    const completions: { label: string; type: string; info?: string }[] = [];

    // Add database name suggestions
    if (selectedDatabase) {
      completions.push({
        label: selectedDatabase.name,
        type: "database",
        info: "Current database",
      });
    }

    // Add table name suggestions with their columns
    tables.forEach((table) => {
      completions.push({
        label: table.name,
        type: "table",
        info: `Table${table.type ? ` (${table.type})` : ""}`,
      });

      // Add column suggestions for each table
      table.columns?.forEach((column) => {
        completions.push({
          label: `${table.name}.${column.name}`,
          type: "column",
          info: `Column (${column.type})`,
        });
        completions.push({
          label: column.name,
          type: "column",
          info: `Column from ${table.name} (${column.type})`,
        });
      });
    });

    // Add common SQL keywords
    const keywords = [
      "SELECT",
      "FROM",
      "WHERE",
      "JOIN",
      "LEFT JOIN",
      "RIGHT JOIN",
      "INNER JOIN",
      "GROUP BY",
      "ORDER BY",
      "HAVING",
      "LIMIT",
      "OFFSET",
      "INSERT INTO",
      "UPDATE",
      "DELETE FROM",
      "CREATE TABLE",
      "ALTER TABLE",
      "DROP TABLE",
      "AND",
      "OR",
      "NOT",
      "IN",
      "BETWEEN",
      "LIKE",
      "IS NULL",
      "IS NOT NULL",
      "ASC",
      "DESC",
      "DISTINCT",
      "COUNT",
      "SUM",
      "AVG",
      "MIN",
      "MAX",
    ];

    // Add PostgreSQL specific keywords and functions
    const postgresKeywords = [
      // Data Types
      "INTEGER",
      "BIGINT",
      "SMALLINT",
      "DECIMAL",
      "NUMERIC",
      "REAL",
      "DOUBLE PRECISION",
      "CHARACTER VARYING",
      "VARCHAR",
      "CHARACTER",
      "CHAR",
      "TEXT",
      "TIMESTAMP",
      "DATE",
      "TIME",
      "INTERVAL",
      "BOOLEAN",
      "ENUM",
      "UUID",
      "JSON",
      "JSONB",
      "ARRAY",

      // Functions
      "NOW()",
      "CURRENT_TIMESTAMP",
      "CURRENT_DATE",
      "CURRENT_TIME",
      "COALESCE()",
      "NULLIF()",
      "GREATEST()",
      "LEAST()",
      "LENGTH()",
      "LOWER()",
      "UPPER()",
      "INITCAP()",
      "TRIM()",
      "TO_CHAR()",
      "TO_DATE()",
      "TO_NUMBER()",
      "TO_TIMESTAMP()",
      "DATE_TRUNC()",
      "DATE_PART()",
      "EXTRACT()",
      "ARRAY_AGG()",
      "STRING_AGG()",
      "JSON_AGG()",
      "JSONB_AGG()",

      // Window Functions
      "OVER",
      "PARTITION BY",
      "ROW_NUMBER()",
      "RANK()",
      "DENSE_RANK()",
      "FIRST_VALUE()",
      "LAST_VALUE()",
      "LAG()",
      "LEAD()",

      // Common Clauses
      "WITH",
      "RECURSIVE",
      "UNION",
      "UNION ALL",
      "INTERSECT",
      "EXCEPT",
      "CASE",
      "WHEN",
      "THEN",
      "ELSE",
      "END",
      "FILTER",
      "WITHIN GROUP",
      "ILIKE",
      "SIMILAR TO",

      // Table Constraints
      "PRIMARY KEY",
      "FOREIGN KEY",
      "REFERENCES",
      "UNIQUE",
      "CHECK",
      "DEFAULT",
      "NOT NULL",
      "CONSTRAINT",
    ];

    // Add all keywords with their types
    [...keywords, ...(dbType === "postgresql" ? postgresKeywords : [])].forEach(
      (keyword) => {
        completions.push({
          label: keyword,
          type: "keyword",
          info: keyword.endsWith("()") ? "Function" : "Keyword",
        });
      }
    );

    return completions;
  }, [selectedDatabase, tables, dbType]);

  const customSQLCompletion = (
    context: CompletionContext
  ): CompletionResult | null => {
    const word = context.matchBefore(/[\w.]*$/);
    if (!word) return null;

    return {
      from: word.from,
      options: sqlCompletions.map((completion) => ({
        label: completion.label,
        type: completion.type,
        detail: completion.info,
        boost:
          completion.type === "column"
            ? 3
            : completion.type === "table"
            ? 2
            : completion.type === "database"
            ? 1.5
            : 1,
      })),
    };
  };

  const handleAddParameter = () => {
    const newParamName = `param_${Object.keys(parameters).length + 1}`;
    setParameters({ ...parameters, [newParamName]: "" });
  };

  const handleRemoveParameter = (paramName: string) => {
    const newParams = { ...parameters };
    delete newParams[paramName];
    setParameters(newParams);
  };

  const handleParameterChange = (paramName: string, value: string) => {
    setParameters({ ...parameters, [paramName]: value });
  };

  const handleTabDoubleClick = (query: SavedQuery) => {
    setEditingQueryId(query.id || "");
    setEditingQueryName(query.name);
    // Focus the input after it's rendered
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleTabNameSave = async () => {
    if (editingQueryId) {
      // Update the tab name in the UI
      setQueries(
        queries.map((query) =>
          query.id === editingQueryId
            ? { ...query, name: editingQueryName.trim() || query.name }
            : query
        )
      );

      // Save the query with the new name
      if (selectedDatabase) {
        const query = queries.find((q) => q.id === editingQueryId);
        if (query) {
          try {
            setIsSaving(true);
            const queryPayload = {
              name: editingQueryName.trim(),
              description: "",
              query_text: value,
              database_id: selectedDatabase.id,
            };

            if (!query.id || query.id?.startsWith("temp-")) {
              // For new queries, use saveQuery
              await savedQueriesService.saveQuery(queryPayload);

              // Get all saved queries and find the one we just saved
              const savedQueries = await savedQueriesService.getSavedQueries(
                selectedDatabase.id
              );
              const savedQuery = savedQueries.find(
                (query) =>
                  query.database_id === selectedDatabase.id &&
                  query.name === editingQueryName.trim() &&
                  query.query_text === value
              );

              // Update the tab with the new ID
              if (savedQuery) {
                setQueries(
                  queries.map((q) =>
                    q.id === editingQueryId ? { ...q, id: savedQuery.id } : q
                  )
                );
                setActiveQueryId(savedQuery.id || "");
              }
            } else {
              // For existing queries, use updateSavedQuery
              await savedQueriesService.updateSavedQuery(
                query.id,
                queryPayload
              );
            }

            toast({
              title: "Success",
              description: "Query saved successfully",
            });
          } catch (error) {
            toast({
              title: "Error",
              description:
                error instanceof Error ? error.message : "Failed to save query",
              variant: "destructive",
            });
          } finally {
            setIsSaving(false);
          }
        }
      }
      setEditingQueryId(null);
    }
  };

  const handleTabNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTabNameSave();
    } else if (e.key === "Escape") {
      setEditingQueryId(null);
    }
  };

  const getCurrentTimestamp = () => {
    return format(new Date(), "yyyy-MM-dd h:mma");
  };

  const handleExecuteQuery = () => {
    if (!editorRef.current) return;

    const editor = editorRef.current.view;
    const selection = editor.state.selection;
    const selectedText = editor.state.sliceDoc(
      selection.main.from,
      selection.main.to
    );

    // If there's selected text, execute only that portion
    // Otherwise, execute the entire query
    const queryToExecute = selectedText || value;

    if (queryToExecute.trim()) {
      onExecute(queryToExecute, parameters);
    }
  };

  // Save query function
  const saveQuery = useCallback(
    async (queryText: string) => {
      console.log(
        "aaaa",
        selectedDatabase,
        activeQueryId,
        queryText,
        lastSavedText
      );
      if (!selectedDatabase || !activeQueryId || queryText === lastSavedText)
        return;

      const activeQuery = queries.find((query) => query.id === activeQueryId);
      if (!activeQuery) return;

      const queryPayload = {
        name: activeQuery.name,
        description: "",
        query_text: queryText,
        database_id: selectedDatabase.id,
      };

      try {
        setIsSaving(true);

        if (!activeQuery.id || activeQuery.id === "1") {
          // For new queries, use saveQuery
          await savedQueriesService.saveQuery(queryPayload);

          // Get all saved queries and find the one we just saved
          const savedQueries = await savedQueriesService.getSavedQueries(
            selectedDatabase.id
          );
          const savedQuery = savedQueries.find(
            (query) =>
              query.database_id === selectedDatabase.id &&
              query.name === activeQuery.name &&
              query.query_text === queryText
          );

          // Update the tab with the new ID
          if (savedQuery) {
            setQueries(
              queries.map((query) =>
                query.id === activeQueryId
                  ? { ...query, id: savedQuery.id }
                  : query
              )
            );
            setActiveQueryId(savedQuery.id || "");
          }
        } else {
          // For existing queries, use updateSavedQuery
          await savedQueriesService.updateSavedQuery(
            activeQuery.id,
            queryPayload
          );
        }

        setLastSavedText(queryText);
      } catch (error) {
        console.error("Auto-save failed:", error);
        toast({
          title: "Error",
          description: "Failed to auto-save query",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [selectedDatabase, activeQueryId, queries, lastSavedText]
  );

  // Set up periodic auto-save
  useEffect(() => {
    // Clear existing interval if any
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
    }

    // Start new interval if we have a query to save
    if (value.trim() && selectedDatabase) {
      const interval = setInterval(() => {
        saveQuery(value);
      }, 30000); // 30 seconds
      setAutoSaveInterval(interval);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
    };
  }, [value, selectedDatabase, saveQuery]);

  // Handle debounced save after typing
  const handleQueryChange = useCallback(
    (newValue: string) => {
      onChange(newValue);
      setQueries(
        queries.map((query) =>
          query.id === activeQueryId
            ? { ...query, query_text: newValue }
            : query
        )
      );

      // Clear existing timeout if any
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      // Set new timeout for saving
      const timeout = setTimeout(() => {
        saveQuery(newValue);
      }, 5000); // 5 seconds
      setSaveTimeout(timeout);
    },
    [onChange, queries, activeQueryId, saveTimeout, saveQuery]
  );

  // Cleanup save timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            size="xs"
            className="text-[13px] h-[26px] px-3 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
            onClick={handleExecuteQuery}
            disabled={isExecuting || !selectedDatabase}
          >
            <Play className="w-3 h-3 mr-1.5" />
            {isExecuting ? (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 animate-spin" />
                Executing...
              </span>
            ) : (
              "Run"
            )}
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {queries.find((query) => query.id === activeQueryId)?.name ||
                "New Query"}
            </span>
            <span className="text-xs text-gray-500">
              {getCurrentTimestamp()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={() => saveQuery(value)}
            disabled={!value.trim() || !selectedDatabase || isSaving}
            className="h-[26px] px-3"
          >
            <Save className="w-3 h-3 mr-1.5" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <div className="h-[26px]">
            <DatabaseSelector />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 px-2 pt-2 border-b bg-gray-50">
        {isLoadingSavedQueries ? (
          <div className="flex items-center gap-2 px-4 py-1 text-sm text-gray-500">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading saved queries...
          </div>
        ) : (
          <>
            {queries?.map((query, index) => (
              <div
                key={`${query.id}-${index}`}
                className={`group flex items-center gap-2 px-3 py-1.5 text-sm rounded-t-lg cursor-pointer border-x border-t transition-colors ${
                  activeQueryId === query.id
                    ? "bg-white text-gray-900 border-gray-200"
                    : "bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100"
                }`}
                onClick={() => handleTabChange(query.id || "")}
                onDoubleClick={() => handleTabDoubleClick(query)}
              >
                {editingQueryId === query.id ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={editingQueryName}
                    onChange={(e) => setEditingQueryName(e.target.value)}
                    onBlur={handleTabNameSave}
                    onKeyDown={handleTabNameKeyDown}
                    className="w-24 px-1 text-sm bg-transparent border-b border-blue-500 outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="min-w-[3rem]">{query.name}</span>
                )}
                {queries.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveQuery(query.id || "");
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <Button
              variant="ghost"
              size="xs"
              onClick={handleAddQuery}
              className="h-7 px-2 text-gray-500 hover:text-blue-600"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </>
        )}
      </div>

      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={40}>
          <div className="flex-1 overflow-auto">
            <CodeMirror
              ref={editorRef}
              value={value}
              height="30vh"
              theme={vscodeLight}
              extensions={[
                sql(),
                autocompletion({ override: [customSQLCompletion] }),
              ]}
              onChange={handleQueryChange}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightSpecialChars: true,
                history: true,
                foldGutter: true,
                drawSelection: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
                syntaxHighlighting: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: true,
                crosshairCursor: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                closeBracketsKeymap: true,
                defaultKeymap: true,
                searchKeymap: true,
                historyKeymap: true,
                foldKeymap: true,
                completionKeymap: true,
                lintKeymap: true,
              }}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle />
        <div className="p-2 border-t">
          <div className="flex flex-wrap gap-2">
            {Object.entries(parameters).map(([name, value]) => (
              <div key={name} className="flex items-center gap-1">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <label className="text-xs font-medium text-gray-700">
                      {name}
                    </label>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Settings2 className="w-3 h-3" />
                    </button>
                  </div>
                  <Input
                    value={value}
                    onChange={(e) =>
                      handleParameterChange(name, e.target.value)
                    }
                    className="h-7 w-[180px] text-sm"
                    placeholder="Enter value..."
                  />
                </div>
                <button
                  onClick={() => handleRemoveParameter(name)}
                  className="self-end h-7 px-1 text-gray-400 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <Button
              variant="outline"
              size="xs"
              onClick={handleAddParameter}
              className="px-3 py-1"
            >
              Add parameter
            </Button>
          </div>
        </div>

        <ResizablePanel defaultSize={60}>
          <ResultsTable data={results} isLoading={isExecuting} error={error} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
