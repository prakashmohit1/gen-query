"use client";

import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { vscodeLight } from "@uiw/codemirror-theme-vscode";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useTheme } from "next-themes";
import { theme } from "@/tailwind.config";

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  isExecuting?: boolean;
}

export function SQLEditor({
  value,
  onChange,
  onExecute,
  isExecuting = false,
}: SQLEditorProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-purple-900">SQL Editor</div>
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 gap-2"
          onClick={onExecute}
          disabled={isExecuting}
        >
          <Play className="w-4 h-4" />
          {isExecuting ? "Executing..." : "Run Query"}
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={value}
          height="50vh"
          theme={vscodeLight}
          extensions={[sql()]}
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
