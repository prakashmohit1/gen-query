"use client";

import { DatabaseList } from "@/components/editor/database-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Clock,
  Database,
  Search,
  Star,
  ChevronRight,
  Table2,
  Plus,
  Pencil,
} from "lucide-react";
import { ComingSoonDialog } from "@/components/common/coming-soon-dialog";
import { useState, useEffect, use } from "react";
import {
  useDatabaseList,
  useSelectedDatabase,
} from "@/contexts/database-context";
import {
  DatabaseConnection,
  databaseService,
  DatabaseTable,
} from "@/lib/services/database.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface TableDetails {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    comment?: string;
  }>;
  owner: string;
  createdAt: string;
  connection_id: string;
  dbType: string;
}

interface Tag {
  key: string;
  value: string;
}

export default function CatalogPage() {
  const params = useParams();
  const { selectedConnection, connections } = useSelectedDatabase();
  const [activeTab, setActiveTab] = useState<"overview" | "details">(
    "overview"
  );
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [tables, setTables] = useState<TableDetails[]>([]);
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [createTableSQL, setCreateTableSQL] = useState("");
  const { databases, isLoading } = useDatabaseList();
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState<{ key: string; value: string }>({
    key: "",
    value: "",
  });
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedTableDetails, setSelectedTableDetails] =
    useState<TableDetails | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const router = useRouter();

  const getDbTables = async () => {
    setLoading(true);
    try {
      const conn = databases.find((conn) => conn.id === params.connectionId);
      const db_type = conn?.db_type || "";
      if (!conn) return;
      const table = await databaseService.getDatabaseTables(
        params.connectionId as string,
        db_type
      );
      if ((table?.rows.length || 0) > 0) {
        setTables(() =>
          [...new Set(table?.rows.map((row) => row[0]))].map((name) => ({
            name,
            columns: [],
            owner: conn.username || "System user",
            createdAt: new Date().toLocaleString(),
            connection_id: conn.id,
            dbType: conn.db_type,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDbTables();
  }, [databases]);

  const handleCreateTable = async () => {
    if (!selectedDatabase || !createTableSQL) return;

    try {
      setLoading(true);
      const selectedConn = connections?.find(
        (conn) => conn.name === selectedDatabase
      );
      if (!selectedConn) return;

      await databaseService.submitQuery(selectedConn.id, createTableSQL);
      // Refresh tables list
      await getDbTables();
      setShowCreateTable(false);
      setCreateTableSQL("");
    } catch (error) {
      console.error("Error creating table:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setLoading(loading);
  }, [isLoading]);

  const handleTableClick = async (
    table: TableDetails,
    conn_id: string,
    db_type: string
  ) => {
    setSelectedTable(table.name);
    try {
      const selectedConn = databases.find(
        (conn) => conn.name === selectedDatabase
      );
      if (!selectedConn) return;

      const description = await databaseService.getDatabaseDescription(
        conn_id,
        db_type,
        table.name
      );

      if (description) {
        setSelectedTableDetails(description);
      }
    } catch (error) {
      console.error("Error fetching table description:", error);
    }
  };

  const handleDescriptionUpdate = async () => {
    try {
      const response = await fetch(
        `/api/v1/catalog/databases/${params.connectionId}/description`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ description: newDescription }),
        }
      );

      if (!response.ok) throw new Error("Failed to update description");
      setDescription(newDescription);
      setIsEditingDescription(false);
      toast({
        title: "Success",
        description: "Database description updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update description",
        variant: "destructive",
      });
    }
  };

  const handleAddTag = async () => {
    try {
      const response = await fetch("/api/v1/catalog/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: newTag.key,
          value: newTag.value,
          entity_type: "DATABASE",
          entity_id: params.connectionId,
        }),
      });

      if (!response.ok) throw new Error("Failed to add tag");
      setTags([...tags, newTag]);
      setNewTag({ key: "", value: "" });
      setIsAddingTag(false);
      toast({
        title: "Success",
        description: "Tag added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add tag",
        variant: "destructive",
      });
    }
  };

  const renderTableContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="divide-y">
            {loading ? (
              <div className="py-8 text-center text-gray-500">
                Loading tables...
              </div>
            ) : tables.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No tables available
              </div>
            ) : (
              tables.map((table, id) => (
                <div
                  key={`${table.name}-${id}`}
                  className="grid grid-cols-12 gap-4 py-4 hover:bg-gray-50 cursor-pointer group"
                  onClick={() =>
                    handleTableClick(table, table.connection_id, table.dbType)
                  }
                >
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <Table2 className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-blue-600">{table.name}</span>
                  </div>
                  <div className="col-span-3 flex items-center text-sm text-gray-600">
                    {table.owner}
                  </div>
                  <div className="col-span-3 flex items-center text-sm text-gray-600">
                    {table.createdAt}
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case "details":
        return (
          <div className="space-y-6">
            {selectedTableDetails ? (
              <div className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">
                    {selectedTableDetails.name}
                  </h3>
                  <div className="text-sm text-gray-500">
                    Created at {selectedTableDetails.createdAt}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedTableDetails.description ||
                      "No description available"}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Columns
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Comment
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedTableDetails.columns.map((column, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {column.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {column.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {column.comment || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Additional Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Owner:</span>{" "}
                      {selectedTableDetails.owner}
                    </div>
                    <div>
                      <span className="font-medium">Connection ID:</span>{" "}
                      {selectedTableDetails.connection_id}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Select a table to view details
              </div>
            )}
          </div>
        );
    }
  };

  const renderContent = () => {
    return (
      <div className="flex-1">
        <div className="p-6 space-y-6">
          {/* Database Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Description</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditingDescription(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              {description || "No description"}
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Tags</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddingTag(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm"
                >
                  <span className="font-medium">{tag.key}:</span>
                  <span>{tag.value}</span>
                </div>
              ))}
            </div>
          </div>

          <Tabs defaultValue="tables" className="mt-6">
            <TabsList>
              <TabsTrigger value="tables">Tables ({tables.length})</TabsTrigger>
              <TabsTrigger value="models">Models (1)</TabsTrigger>
              <TabsTrigger value="functions">Functions (0)</TabsTrigger>
            </TabsList>

            <div className="my-4">
              <Input
                placeholder="Filter tables..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <TabsContent value="tables">
              <div className="divide-y">
                {loading ? (
                  <div className="py-8 text-center text-gray-500">
                    Loading tables...
                  </div>
                ) : tables.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    No tables available
                  </div>
                ) : (
                  tables.map((table, id) => (
                    <div
                      key={`${table.name}-${id}`}
                      className="grid grid-cols-12 gap-4 py-4 hover:bg-gray-50 cursor-pointer group"
                      onClick={() =>
                        handleTableClick(
                          table,
                          table.connection_id,
                          table.dbType
                        )
                      }
                    >
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <Table2 className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-blue-600">{table.name}</span>
                      </div>
                      <div className="col-span-3 flex items-center text-sm text-gray-600">
                        {table.owner}
                      </div>
                      <div className="col-span-3 flex items-center text-sm text-gray-600">
                        {table.createdAt}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="models">
              <div className="text-center py-8 text-gray-500">
                No models available
              </div>
            </TabsContent>

            <TabsContent value="functions">
              <div className="text-center py-8 text-gray-500">
                No functions available
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left side - Database List */}
      <div className="border-r flex-shrink-0">
        <DatabaseList />
      </div>

      {/* Right side - Catalog View */}
      <div className="flex-1 flex flex-col">
        {/* Breadcrumbs and Actions */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-blue-600 hover:text-blue-700"
              onClick={() => router.push("/catalog")}
            >
              {selectedConnection?.name || "Database"}
            </Button>
            {selectedTable && (
              <>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{selectedTable}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Filter tables..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setShowCreateTable(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create table
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">{renderContent()}</ScrollArea>
      </div>

      {/* Description Dialog */}
      <Dialog
        open={isEditingDescription}
        onOpenChange={setIsEditingDescription}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Description</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Enter description"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditingDescription(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleDescriptionUpdate}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Tag Dialog */}
      <Dialog open={isAddingTag} onOpenChange={setIsAddingTag}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Key</label>
              <Input
                value={newTag.key}
                onChange={(e) => setNewTag({ ...newTag, key: e.target.value })}
                placeholder="Enter tag key"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Value</label>
              <Input
                value={newTag.value}
                onChange={(e) =>
                  setNewTag({ ...newTag, value: e.target.value })
                }
                placeholder="Enter tag value"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingTag(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTag}>Add Tag</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Other existing dialogs */}
      <ComingSoonDialog
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
      />

      <Dialog open={showCreateTable} onOpenChange={setShowCreateTable}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Table</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sql">SQL Query</Label>
              <Textarea
                id="sql"
                placeholder="Enter CREATE TABLE query..."
                value={createTableSQL}
                onChange={(e) => setCreateTableSQL(e.target.value)}
                className="h-[200px] font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTable(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTable}
              disabled={!createTableSQL || loading}
            >
              {loading ? "Creating..." : "Create Table"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
