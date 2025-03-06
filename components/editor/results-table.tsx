"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface ResultsTableProps {
  data: any | null;
  isLoading?: boolean;
  error?: string | null;
}

export function ResultsTable({
  data,
  isLoading = false,
  error = null,
}: ResultsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <div className="text-sm text-gray-500">Executing query...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-red-500">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-gray-500">No results to display</div>
      </div>
    );
  }

  const columns = data.columns;

  return (
    <div className="h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="text-sm font-medium text-purple-900">Query Results</div>
        <div className="text-sm text-gray-500">{data.rows.length} rows</div>
      </div>
      <ScrollArea className="h-[calc(100%-57px)]">
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column: any) => (
                  <TableHead key={column.name}>{column.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row: any, i: number) => (
                <TableRow key={i}>
                  {row.map((data: any) => (
                    <TableCell key={data}>
                      {data?.toString() ?? "NULL"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}
