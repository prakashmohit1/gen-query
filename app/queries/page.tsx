"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PlusCircle, Search, ArrowUpDown } from "lucide-react";
import CreateQueryDialog from "./create-query-dialog";
import { queriesService, type Query } from "@/lib/services/queries";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export default function QueriesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [queries, setQueries] = useState<Query[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Query;
    direction: "asc" | "desc";
  } | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const data = await queriesService.getQueries();
      setQueries(data);
    } catch (error) {
      console.error("Error fetching queries:", error);
      toast({
        title: "Error",
        description: "Failed to fetch queries",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key: keyof Query) => {
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

  const filteredAndSortedQueries = queries
    .filter(
      (query) =>
        query.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
        query.database.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
        query.createdBy?.toLowerCase().includes(filterQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig) return 0;

      const { key, direction } = sortConfig;
      let aValue = key === "database" ? a[key].name : a[key];
      let bValue = key === "database" ? b[key].name : b[key];

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Saved Queries</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search queries..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="pl-9 w-[300px]"
            />
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Query
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-2 hover:text-blue-600"
                  >
                    Query Name
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSort("database")}
                    className="flex items-center gap-2 hover:text-blue-600"
                  >
                    Database
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSort("createdBy")}
                    className="flex items-center gap-2 hover:text-blue-600"
                  >
                    Created By
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center gap-2 hover:text-blue-600"
                  >
                    Created At
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading queries...
                </TableCell>
              </TableRow>
            ) : filteredAndSortedQueries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-gray-500"
                >
                  {filterQuery
                    ? "No matching queries found"
                    : "No queries available"}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedQueries.map((query) => (
                <TableRow
                  key={query.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    router.push(
                      `/db-editor?dbId=${query.databaseId}&queryName=${query.name}`
                    )
                  }
                >
                  <TableCell className="font-medium">{query.name}</TableCell>
                  <TableCell>{query.database.name}</TableCell>
                  <TableCell>{query.createdBy || "Unknown"}</TableCell>
                  <TableCell>
                    {new Date(query.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateQueryDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchQueries}
      />
    </div>
  );
}
