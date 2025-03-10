"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, History, ArrowUpDown, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { QueryPerformance } from "./query-performance-popup";

interface ResultsTableProps {
  data: any | null;
  isLoading?: boolean;
  error?: string | null;
  queryId?: string;
}

export function ResultsTable({
  data,
  isLoading = false,
  error = null,
  queryId,
}: ResultsTableProps) {
  const { result, id } = data || {};
  const { rows: originalRows = [], columns = [] } = result || {};

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);

  // Apply filters and sorting
  const rows = useMemo(() => {
    let filteredRows = [...originalRows];

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filteredRows = filteredRows.filter((row) => {
          const cellValue = row[columns.findIndex((col) => col.name === key)]
            ?.toString()
            .toLowerCase();
          return cellValue?.includes(value.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig) {
      const columnIndex = columns.findIndex(
        (col) => col.name === sortConfig.key
      );
      filteredRows.sort((a, b) => {
        const aValue = a[columnIndex];
        const bValue = b[columnIndex];

        if (aValue === null) return sortConfig.direction === "asc" ? -1 : 1;
        if (bValue === null) return sortConfig.direction === "asc" ? 1 : -1;

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filteredRows;
  }, [originalRows, filters, sortConfig, columns]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        if (current.direction === "asc") {
          return { key, direction: "desc" };
        }
        return null;
      }
      return { key, direction: "asc" };
    });
  };

  const handleFilterChange = (columnName: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [columnName]: value,
    }));
  };

  const downloadCSV = () => {
    // Create CSV content
    const csvContent = [
      // Headers
      columns.map((col) => `"${col.name}"`).join(","),
      // Rows
      ...rows.map((row) =>
        row
          .map((cell) => `"${cell?.toString().replace(/"/g, '""') ?? "NULL"}"`)
          .join(",")
      ),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `query_results_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
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

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="text-sm font-medium text-blue-900">Query Results</div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Search className="w-4 h-4 mr-2" />
            {showFilters ? "Hide Search" : "Show Search"}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCSV}>
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPerformance(true)}
            disabled={!id}
          >
            <History className="w-4 h-4 mr-2" />
            Performance
          </Button>
          <div className="text-sm text-gray-500">{rows.length} rows</div>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 overflow-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    {columns.map((column: any) => (
                      <TableHead
                        key={column.name}
                        className="whitespace-nowrap bg-white"
                        style={{ minWidth: "150px" }}
                      >
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleSort(column.name)}
                            className="flex items-center gap-2 hover:text-blue-600"
                          >
                            {column.name}
                            <ArrowUpDown className="w-4 h-4" />
                          </button>
                          {showFilters && (
                            <Input
                              placeholder="Filter..."
                              value={filters[column.name] || ""}
                              onChange={(e) =>
                                handleFilterChange(column.name, e.target.value)
                              }
                              className="h-7 text-sm"
                            />
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row: any, i: number) => (
                    <TableRow key={i}>
                      {row.map((data: any, j: number) => (
                        <TableCell
                          key={`${i}-${j}`}
                          className="whitespace-nowrap"
                          style={{ minWidth: "150px" }}
                        >
                          {data?.toString() ?? "NULL"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showPerformance} onOpenChange={setShowPerformance}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-blue-900">
              Query Performance Details
            </DialogTitle>
          </DialogHeader>
          <QueryPerformance data={data} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
