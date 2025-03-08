"use client";

import React, { useMemo, useState, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { vscodeLight } from "@uiw/codemirror-theme-vscode";
import { Button } from "@/components/ui/button";
import { Play, Database, Plus, X, Clock, Settings2 } from "lucide-react";
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
import type { DatabaseTable } from "@/lib/services/database.service";

interface QueryTab {
  id: string;
  name: string;
  query: string;
  parameters: Record<string, string>;
}

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: (queryText: string, params: Record<string, any>) => void;
  isExecuting?: boolean;
  selectedDatabase?: {
    name: string;
    database: string;
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
  selectedDatabase,
  tables = [],
  dbType = "postgresql",
  parameters,
  setParameters,
  results,
  error,
}: SQLEditorProps) {
  const [tabs, setTabs] = useState<QueryTab[]>([
    { id: "1", name: "Query 1", query: value, parameters: {} },
  ]);
  const [activeTabId, setActiveTabId] = useState("1");
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabName, setEditingTabName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<any>(null);

  const handleAddTab = () => {
    const newTabId = (tabs.length + 1).toString();
    const newTab: QueryTab = {
      id: newTabId,
      name: `Query ${newTabId}`,
      query: "",
      parameters: {},
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);
    onChange("");
    setParameters({});
  };

  const handleRemoveTab = (tabId: string) => {
    if (tabs.length === 1) return; // Don't remove the last tab
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);

    // If removing active tab, switch to the last tab
    if (tabId === activeTabId) {
      const lastTab = newTabs[newTabs.length - 1];
      setActiveTabId(lastTab.id);
      onChange(lastTab.query);
      setParameters(lastTab.parameters);
    }
  };

  const handleTabChange = (tabId: string) => {
    // Save current tab state
    const updatedTabs = tabs.map((tab) =>
      tab.id === activeTabId
        ? { ...tab, query: value, parameters: parameters }
        : tab
    );

    // Switch to new tab
    const newTab = updatedTabs.find((tab) => tab.id === tabId);
    if (newTab) {
      setTabs(updatedTabs);
      setActiveTabId(tabId);
      onChange(newTab.query);
      setParameters(newTab.parameters);
    }
  };

  const sqlCompletions = useMemo(() => {
    const completions: { label: string; type: string; info?: string }[] = [];

    // Add database name suggestions
    if (selectedDatabase) {
      completions.push({
        label: selectedDatabase.database,
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

  const handleTabDoubleClick = (tab: QueryTab) => {
    setEditingTabId(tab.id);
    setEditingTabName(tab.name);
    // Focus the input after it's rendered
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleTabNameSave = () => {
    if (editingTabId) {
      setTabs(
        tabs.map((tab) =>
          tab.id === editingTabId
            ? { ...tab, name: editingTabName.trim() || tab.name }
            : tab
        )
      );
      setEditingTabId(null);
    }
  };

  const handleTabNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTabNameSave();
    } else if (e.key === "Escape") {
      setEditingTabId(null);
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            className="text-[13px] h-[30px] bg-white text-purple-600 border border-purple-200 hover:bg-purple-50 transition-colors"
            onClick={handleExecuteQuery}
            disabled={isExecuting || !selectedDatabase}
          >
            <Play className="w-4 h-4" />
            {isExecuting ? (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                Executing...
              </span>
            ) : (
              "Run"
            )}
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {tabs.find((tab) => tab.id === activeTabId)?.name || "New Query"}
            </span>
            <span className="text-sm text-gray-500">
              {getCurrentTimestamp()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DatabaseSelector />
        </div>
      </div>

      <div className="flex items-center gap-1 px-2 pt-2 border-b bg-gray-50">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`group flex items-center gap-2 px-4 py-2 text-sm rounded-t-lg cursor-pointer border-x border-t transition-colors ${
              activeTabId === tab.id
                ? "bg-white text-gray-900 border-gray-200"
                : "bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100"
            }`}
            onClick={() => handleTabChange(tab.id)}
            onDoubleClick={() => handleTabDoubleClick(tab)}
          >
            {editingTabId === tab.id ? (
              <input
                ref={inputRef}
                type="text"
                value={editingTabName}
                onChange={(e) => setEditingTabName(e.target.value)}
                onBlur={handleTabNameSave}
                onKeyDown={handleTabNameKeyDown}
                className="w-24 px-1 text-sm bg-transparent border-b border-purple-500 outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="min-w-[3rem]">{tab.name}</span>
            )}
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTab(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddTab}
          className="h-8 px-2 text-gray-500 hover:text-purple-600"
        >
          <Plus className="w-4 h-4" />
        </Button>
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
              onChange={(newValue) => {
                onChange(newValue);
                setTabs(
                  tabs.map((tab) =>
                    tab.id === activeTabId ? { ...tab, query: newValue } : tab
                  )
                );
              }}
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
        <div className="p-4 border-t">
          <div className="flex flex-wrap gap-4">
            {Object.entries(parameters).map(([name, value]) => (
              <div key={name} className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      {name}
                    </label>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Settings2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Input
                    value={value}
                    onChange={(e) =>
                      handleParameterChange(name, e.target.value)
                    }
                    className="h-8 w-[200px]"
                    placeholder="Enter value..."
                  />
                </div>
                <button
                  onClick={() => handleRemoveParameter(name)}
                  className="self-end h-8 px-2 text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddParameter}
              className="h-8"
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
