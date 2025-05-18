"use client";

import React from "react";
import { format } from "date-fns";
import { useDatabaseList } from "@/contexts/database-context";

interface ResultsTableProps {
  data: any | null;
}

export function QueryPerformance({ data }: ResultsTableProps) {
  const {
    result,
    connection_id,
    id,
    query_text,
    created_at,
    execution_status,
    error_message,
  } = data || {};
  const { execution_time_ms, row_count } = result || {};
  const { databases } = useDatabaseList();

  return (
    id && (
      <div className="grid gap-6 py-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500 mb-1">
                Statement ID
              </div>
              <div className="text-sm font-mono text-gray-900">{id}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500 mb-1">
                Connection ID
              </div>
              <div className="text-sm font-mono text-gray-900">
                {connection_id}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500 mb-1">
                Status
              </div>
              <div
                className={`text-sm font-medium ${
                  execution_status ? "text-green-600" : "text-red-600"
                }`}
              >
                {execution_status ? "Success" : "Failed"}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500 mb-1">
                Created At
              </div>
              <div className="text-sm text-gray-900">
                {format(new Date(created_at), "PPpp")}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500 mb-1">
                Execution Time
              </div>
              <div className="text-sm font-medium text-primary-600">
                {execution_time_ms?.toFixed(2) || "0"} ms
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500 mb-1">
                Rows Returned
              </div>
              <div className="text-sm font-medium text-primary-600">
                {row_count || "0"}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500 mb-1">
                Database Name
              </div>
              <div className="text-sm font-medium text-primary-600">
                {databases?.find((db) => db.id === connection_id)?.name}
              </div>
            </div>
          </div>
        </div>

        {error_message && (
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-red-700 mb-1">
              Error Message
            </div>
            <div className="text-sm text-red-600 font-mono">
              {error_message}
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Executed Query
          </div>
          <div className="text-sm font-mono text-gray-900 bg-white p-3 rounded border border-gray-200 overflow-x-auto">
            {query_text}
          </div>
        </div>
      </div>
    )
  );
}
