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
import {
  savedQueriesService,
  type SavedQuery,
} from "@/lib/services/saved-queries";

export default function QueriesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [queries, setQueries] = useState<SavedQuery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof SavedQuery;
    direction: "asc" | "desc";
  } | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const data = await savedQueriesService.getSavedQueries();
      console.log("data", data);
      if (data) {
        setQueries(data);
      }
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
                    Query
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
                    Description
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
            ) : queries.length === 0 ? (
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
              queries.map((query) => (
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
                  <TableCell>{query.query_text}</TableCell>
                  <TableCell>{query.description || ""}</TableCell>
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
