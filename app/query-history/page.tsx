"use client";

import { useEffect, useState } from "react";
import { sqlQueriesService, type SQLQuery } from "@/lib/services/sql-queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  RefreshCcw,
  ChevronDown,
  Download,
  Trash2,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";
import { format } from "date-fns";
import { useDatabaseList } from "@/contexts/database-context";

export default function QueryHistoryPage() {
  const [queries, setQueries] = useState<SQLQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    queryId: string | null;
    queryText: string | null;
  }>({
    open: false,
    queryId: null,
    queryText: null,
  });
  const [filters, setFilters] = useState({
    user: "",
    timeRange: "last7days",
    compute: "",
    duration: "",
    status: "",
    statement: "",
    statementId: "",
  });
  const { databases } = useDatabaseList();

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const data = await sqlQueriesService.getSQLQueries();
      setQueries(data);
    } catch (error) {
      console.error("Failed to fetch queries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleRefresh = () => {
    fetchQueries();
  };

  const handleDeleteQuery = async (queryId: string) => {
    try {
      await sqlQueriesService.deleteSQLQuery(queryId);
      await fetchQueries(); // Refresh the list after deletion
      setDeleteDialog({ open: false, queryId: null, queryText: null });
    } catch (error) {
      console.error("Failed to delete query:", error);
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = [
        "Query",
        "Started at",
        "Duration",
        "Source",
        "Database",
        "Status",
      ];

      const csvData = queries.map((query) => [
        query.executed_query.replace(/"/g, '""'), // Escape quotes in query text
        format(new Date(query.created_at), "MMM d, yyyy HH:mm:ss"),
        `${query.execution_time_ms} ms`,
        query.source || "Direct Query",
        databases.find((db) => db.id === query.connection_id)?.name || "",
        query.execution_status ? "Success" : "Failed",
      ]);

      const csvContent = [
        headers.join(","),
        ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute(
        "download",
        `query_history_${format(new Date(), "yyyy-MM-dd")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to export CSV:", error);
    }
  };

  const handleExportJSON = () => {
    try {
      const jsonData = queries.map((query) => ({
        query: query.executed_query,
        started_at: query.created_at,
        duration: `${query.execution_time_ms} ms`,
        source: query.source || "Direct Query",
        database:
          databases.find((db) => db.id === query.connection_id)?.name || "",
        status: query.execution_status ? "Success" : "Failed",
      }));

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: "application/json",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute(
        "download",
        `query_history_${format(new Date(), "yyyy-MM-dd")}.json`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to export JSON:", error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Query History</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="gap-2"
          >
            <FileJson className="w-4 h-4" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-7 gap-4 mb-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">User</label>
          <Select
            value={filters.user}
            onValueChange={(value) => setFilters({ ...filters, user: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="me">Me</SelectItem>
              <SelectItem value="all">All users</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Time Range
          </label>
          <Select
            value={filters.timeRange}
            onValueChange={(value) =>
              setFilters({ ...filters, timeRange: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Compute</label>
          <Select
            value={filters.compute}
            onValueChange={(value) =>
              setFilters({ ...filters, compute: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All computes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All computes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Duration</label>
          <Select
            value={filters.duration}
            onValueChange={(value) =>
              setFilters({ ...filters, duration: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All durations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All durations</SelectItem>
              <SelectItem value="fast">&lt; 1s</SelectItem>
              <SelectItem value="medium">1s - 10s</SelectItem>
              <SelectItem value="slow">&gt; 10s</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Statement</label>
          <Select
            value={filters.statement}
            onValueChange={(value) =>
              setFilters({ ...filters, statement: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All statements" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statements</SelectItem>
              <SelectItem value="select">SELECT</SelectItem>
              <SelectItem value="insert">INSERT</SelectItem>
              <SelectItem value="update">UPDATE</SelectItem>
              <SelectItem value="delete">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Statement ID
          </label>
          <Input
            value={filters.statementId}
            onChange={(e) =>
              setFilters({ ...filters, statementId: e.target.value })
            }
            placeholder="Search by ID"
            className="h-10"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">
          {queries.length} queries found
        </div>
        <Button variant="ghost" size="sm" className="text-gray-500">
          Reset filters
        </Button>
      </div>

      {/* Query Table */}
      <div className="flex-1 border rounded-lg overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 border-b">
              <TableRow>
                <TableHead className="w-[30px]"></TableHead>
                <TableHead className="w-[300px]">Query</TableHead>
                <TableHead>Started at</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Database</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                      <span>Loading queries...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : queries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No queries found
                  </TableCell>
                </TableRow>
              ) : (
                queries.map((query) => (
                  <TableRow key={query.id}>
                    <TableCell>
                      {query.execution_status ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm max-w-[300px]">
                      <div className="overflow-x-auto whitespace-nowrap">
                        {query.executed_query}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(query.created_at),
                        "MMM d, yyyy HH:mm:ss"
                      )}
                    </TableCell>
                    <TableCell>{`${query.execution_time_ms} ms`}</TableCell>
                    <TableCell>{query.source || "Direct Query"}</TableCell>
                    <TableCell>
                      {
                        databases.find((db) => db.id === query.connection_id)
                          ?.name
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200" />
                        <span className="text-sm">Current User</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              queryId: query.id,
                              queryText: query.executed_query,
                            })
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, queryId: null, queryText: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Query</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this query? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {deleteDialog.queryText && (
            <div className="my-4 p-3 bg-gray-50 rounded-md">
              <code className="text-sm text-gray-700 whitespace-pre-wrap break-all">
                {deleteDialog.queryText}
              </code>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog({ open: false, queryId: null, queryText: null })
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteDialog.queryId && handleDeleteQuery(deleteDialog.queryId)
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
