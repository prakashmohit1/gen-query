"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  History,
  ArrowUpDown,
  Download,
  Search,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { QueryPerformance } from "./query-performance-popup";
import dynamic from "next/dynamic";
import { ChartRenderer } from "./chart-renderer";

// Remove tab-related dynamic imports and keep only necessary ones
const Select = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.Select),
  { ssr: false }
);
const SelectContent = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectContent),
  { ssr: false }
);
const SelectItem = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectItem),
  { ssr: false }
);
const SelectTrigger = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectTrigger),
  { ssr: false }
);
const SelectValue = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectValue),
  { ssr: false }
);
const Checkbox = dynamic(
  () => import("@/components/ui/checkbox").then((mod) => mod.Checkbox),
  { ssr: false }
);
const Label = dynamic(
  () => import("@/components/ui/label").then((mod) => mod.Label),
  { ssr: false }
);

interface Column {
  name: string;
  type?: string;
}

interface YColumnConfig {
  column: string;
  aggregation: string;
}

interface ResultsTableProps {
  data: {
    result: {
      rows: any[][];
      columns: Column[];
    };
    id?: string;
  } | null;
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { result, id } = data || {};
  const { rows: originalRows = [], columns = [] } = result || {};

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartConfig, setChartConfig] = useState({
    chartType: "bar",
    xColumn: "",
    yColumns: [] as YColumnConfig[],
    groupBy: "",
    errorColumn: "",
    stacking: "none",
  });

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
      columns.map((col: Column) => `"${col.name}"`).join(","),
      // Rows
      ...rows.map((row: any[]) =>
        row
          .map(
            (cell: any) => `"${cell?.toString().replace(/"/g, '""') ?? "NULL"}"`
          )
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

  const renderChart = () => {
    // Implementation of renderChart function
  };

  if (!mounted) {
    return null; // or a loading state
  }

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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChart(true)}
            disabled={!id}
          >
            <BarChart2 className="w-4 h-4 mr-2" />
            Show Chart
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

      <Dialog open={showChart} onOpenChange={setShowChart}>
        <DialogContent className="w-[90vw] h-[90vh] max-w-[90vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-blue-900">
              Visualization Editor
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-6 h-[calc(90vh-120px)]">
            {/* Form Fields */}
            <div className="w-1/3 space-y-4 overflow-y-auto pr-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Chart Type</Label>
                  <Select
                    value={chartConfig.chartType}
                    onValueChange={(value) =>
                      setChartConfig({ ...chartConfig, chartType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                      <SelectItem value="scatter">Scatter Plot</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="donut">Donut Chart</SelectItem>
                      <SelectItem value="radar">Radar Chart</SelectItem>
                      <SelectItem value="composed">Composed Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>X Axis</Label>
                  <Select
                    value={chartConfig.xColumn}
                    onValueChange={(value) =>
                      setChartConfig({ ...chartConfig, xColumn: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select X axis column" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col: Column) => (
                        <SelectItem key={col.name} value={col.name}>
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Y Columns</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setChartConfig({
                          ...chartConfig,
                          yColumns: [
                            ...chartConfig.yColumns,
                            { column: "", aggregation: "sum" },
                          ],
                        });
                      }}
                    >
                      Add Y Column
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {chartConfig.yColumns.map((yCol, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Select
                          value={yCol.column}
                          onValueChange={(value) => {
                            const newYColumns = [...chartConfig.yColumns];
                            newYColumns[index] = {
                              ...newYColumns[index],
                              column: value,
                            };
                            setChartConfig({
                              ...chartConfig,
                              yColumns: newYColumns,
                            });
                          }}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            {columns.map((col: Column) => (
                              <SelectItem key={col.name} value={col.name}>
                                {col.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={yCol.aggregation}
                          onValueChange={(value) => {
                            const newYColumns = [...chartConfig.yColumns];
                            newYColumns[index] = {
                              ...newYColumns[index],
                              aggregation: value,
                            };
                            setChartConfig({
                              ...chartConfig,
                              yColumns: newYColumns,
                            });
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Aggregation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sum">Sum</SelectItem>
                            <SelectItem value="avg">Average</SelectItem>
                            <SelectItem value="min">Min</SelectItem>
                            <SelectItem value="max">Max</SelectItem>
                            <SelectItem value="count">Count</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newYColumns = chartConfig.yColumns.filter(
                              (_, i) => i !== index
                            );
                            setChartConfig({
                              ...chartConfig,
                              yColumns: newYColumns,
                            });
                          }}
                        >
                          -
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Stacking</Label>
                  <Select
                    value={chartConfig.stacking}
                    onValueChange={(value) =>
                      setChartConfig({ ...chartConfig, stacking: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stacking type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="percent">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Chart Preview */}
            <div className="w-2/3 border rounded-lg p-4 overflow-hidden">
              <div className="flex justify-end mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const chartElement = document.querySelector(
                      ".recharts-wrapper svg"
                    );
                    if (chartElement) {
                      const svgData = new XMLSerializer().serializeToString(
                        chartElement
                      );
                      const svgBlob = new Blob([svgData], {
                        type: "image/svg+xml;charset=utf-8",
                      });
                      const link = document.createElement("a");
                      link.href = URL.createObjectURL(svgBlob);
                      link.download = `chart_${format(
                        new Date(),
                        "yyyyMMdd_HHmmss"
                      )}.svg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Chart
                </Button>
              </div>
              {chartConfig.xColumn &&
              chartConfig.yColumns.length > 0 &&
              chartConfig.yColumns[0].column ? (
                <div className="h-full">
                  <ChartRenderer
                    chartConfig={chartConfig}
                    data={rows}
                    columns={columns}
                  />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <div className="w-24 h-24 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                  </div>
                  <p className="text-center">
                    Please choose X axis and at least one Y column to create a
                    chart.
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
