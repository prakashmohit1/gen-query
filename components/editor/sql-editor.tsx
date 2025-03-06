"use client";

import React, { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { vscodeLight } from "@uiw/codemirror-theme-vscode";
import { Button } from "@/components/ui/button";
import { Play, Database } from "lucide-react";
import {
  autocompletion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  isExecuting?: boolean;
  selectedDatabase?: {
    name: string;
    database: string;
  };
  tables?: {
    name: string;
    type: string;
    columns?: { name: string; type: string }[];
  }[];
  dbType?: string;
}

export function SQLEditor({
  value,
  onChange,
  onExecute,
  isExecuting = false,
  selectedDatabase,
  tables = [],
  dbType = "postgresql",
}: SQLEditorProps) {
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <div className="text-sm font-semibold text-purple-900">
            Database Editor
          </div>
          {selectedDatabase ? (
            <div className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded-md">
              <Database className="w-3.5 h-3.5" />
              <span>{selectedDatabase.name}</span>
              <span className="text-purple-400">/</span>
              <span className="font-medium">{selectedDatabase.database}</span>
              {dbType && (
                <>
                  <span className="text-purple-400">/</span>
                  <span className="text-xs text-purple-500">{dbType}</span>
                </>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No database selected</div>
          )}
        </div>
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 gap-2"
          onClick={onExecute}
          disabled={isExecuting || !selectedDatabase}
        >
          <Play className="w-4 h-4" />
          {isExecuting ? "Executing..." : "Run Query"}
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={value}
          height="30vh"
          theme={vscodeLight}
          extensions={[
            sql(),
            autocompletion({ override: [customSQLCompletion] }),
          ]}
          onChange={onChange}
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
    </div>
  );
}
