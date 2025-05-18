"use client";

import { useQueryDetails } from "@/contexts/database-context";
import { formatMessage } from "@/lib/utils/format-message";
import { Copy, Check, Move, MoveLeft } from "lucide-react";
import { useState } from "react";

interface FormattedMessageProps {
  content: string;
  isDark?: boolean;
}

export function FormattedMessage({
  content,
  isDark = false,
}: FormattedMessageProps) {
  const segments = formatMessage(content);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { setMovedQueryText } = useQueryDetails();

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-2 text-[13px] break-words">
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return <span key={index}>{segment.content}</span>;
        }

        if (segment.type === "bold") {
          return (
            <span key={index} className="font-bold">
              {segment.content}
            </span>
          );
        }

        if (segment.type === "code") {
          return (
            <code
              key={index}
              className={`px-1.5 py-0.5 rounded font-mono text-[13px] whitespace-normal break-all ${
                isDark
                  ? "bg-white/10 text-white"
                  : "bg-gray-100 text-primary-600"
              }`}
            >
              {segment.content}
            </code>
          );
        }

        if (segment.type === "codeBlock") {
          return (
            <div key={index} className="relative group">
              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className={`p-1.5 rounded`}>
                  {copiedIndex === index ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <div className="flex items-center gap-4">
                      <MoveLeft
                        className={`w-4 h-4 ${
                          isDark
                            ? "hover:bg-white/10 text-white/60 hover:text-white"
                            : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setMovedQueryText(segment.content)}
                      />
                      <Copy
                        className={`w-4 h-4 ${
                          isDark
                            ? "hover:bg-white/10 text-white/60 hover:text-white"
                            : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => copyToClipboard(segment.content, index)}
                      />
                    </div>
                  )}
                </button>
              </div>
              <pre
                className={`p-4 rounded-lg font-mono text-[13px] whitespace-pre-wrap break-all ${
                  isDark
                    ? "bg-white/10 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <code className="break-words">{segment.content}</code>
              </pre>
            </div>
          );
        }
      })}
    </div>
  );
}
