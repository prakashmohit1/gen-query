"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PlusCircle, Search, Info, Trash2, ArrowUpDown } from "lucide-react";
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
import { savedQueriesService } from "@/lib/services/saved-queries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { useSelectedDatabase } from "@/contexts/database-context";

// API response type
interface APIQuery {
  id?: string;
  name: string;
  query_text: string;
  description: string;
  database_id?: string;
  user_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Local type with required is_active
interface SavedQuery {
  id?: string;
  name: string;
  query_text: string;
  description: string;
  database_id?: string;
  user_id?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function QueriesPage() {
  const [queries, setQueries] = useState<SavedQuery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedQueryDetails, setSelectedQueryDetails] =
    useState<SavedQuery | null>(null);
  const [queryToDelete, setQueryToDelete] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof SavedQuery;
    direction: "asc" | "desc";
  } | null>(null);

  const router = useRouter();
  const { toast } = useToast();
  const { selectedDatabase } = useSelectedDatabase();

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const data = await savedQueriesService.getSavedQueries();
      if (data) {
        // Convert API response to SavedQuery type with guaranteed is_active
        const queriesWithActive: SavedQuery[] = (data as APIQuery[]).map(
          (query) => ({
            ...query,
            is_active: query.is_active ?? true,
          })
        );
        setQueries(queriesWithActive);
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

  const handleSort = (key: keyof SavedQuery) => {
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

  const handleDeleteQuery = async (queryId: string) => {
    try {
      await savedQueriesService.deleteSavedQuery(queryId);
      await fetchQueries();
      toast({
        title: "Success",
        description: "Query deleted successfully",
      });
    } catch (error) {
    } finally {
      setQueryToDelete(null);
    }
  };

  const handleCreateQuery = () => {
    if (!selectedDatabase?.id) {
      toast({
        title: "Error",
        description: "Please select a database first",
        variant: "destructive",
      });
      return;
    }
    router.push(`/db-editor?database_id=${selectedDatabase.id}`);
  };

  const filteredQueries = queries.filter(
    (query) =>
      query.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      query.query_text.toLowerCase().includes(filterQuery.toLowerCase()) ||
      query.description?.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const sortedQueries = [...filteredQueries].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (!aValue || !bValue) return 0;

    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortConfig.direction === "asc" ? comparison : -comparison;
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
          <Button onClick={handleCreateQuery}>
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
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-2 hover:text-primary-600"
                >
                  Name
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </TableHead>
              <TableHead>Query</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("is_active")}
                  className="flex items-center gap-2 hover:text-primary-600"
                >
                  Status
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("created_at")}
                  className="flex items-center gap-2 hover:text-primary-600"
                >
                  Created At
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading queries...
                </TableCell>
              </TableRow>
            ) : sortedQueries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  {filterQuery
                    ? "No matching queries found"
                    : "No queries available"}
                </TableCell>
              </TableRow>
            ) : (
              sortedQueries.map((query) => (
                <TableRow
                  key={query.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    router.push(
                      `/db-editor?database_id=${query.database_id}&query_id=${query.id}`
                    )
                  }
                >
                  <TableCell className="font-medium">{query.name}</TableCell>
                  <TableCell className="max-w-[300px]">
                    <p className="truncate">{query.query_text}</p>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        query.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {query.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {query.created_at
                      ? format(new Date(query.created_at), "MMM d, yyyy HH:mm")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className="flex justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setSelectedQueryDetails(query)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setQueryToDelete(query.id || "")}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Query Details Dialog */}
      <Dialog
        open={!!selectedQueryDetails}
        onOpenChange={() => setSelectedQueryDetails(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Query Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Name</h4>
              <p>{selectedQueryDetails?.name}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Description</h4>
              <p>{selectedQueryDetails?.description || "-"}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Query</h4>
              <pre className="bg-gray-50 p-3 rounded-md overflow-auto max-h-[200px]">
                {selectedQueryDetails?.query_text}
              </pre>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Created At</h4>
                <p>
                  {selectedQueryDetails?.created_at
                    ? format(
                        new Date(selectedQueryDetails.created_at),
                        "MMM d, yyyy HH:mm"
                      )
                    : "-"}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Updated At</h4>
                <p>
                  {selectedQueryDetails?.updated_at
                    ? format(
                        new Date(selectedQueryDetails.updated_at),
                        "MMM d, yyyy HH:mm"
                      )
                    : "-"}
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-1">Status</h4>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  selectedQueryDetails?.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {selectedQueryDetails?.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!queryToDelete}
        onOpenChange={() => setQueryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              query.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => queryToDelete && handleDeleteQuery(queryToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
