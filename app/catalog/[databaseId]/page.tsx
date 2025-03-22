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
import { catalogService } from "@/lib/services/catalog";

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

  useEffect(() => {
    const fetchDatabaseDescription = () => {
      if (!params.databaseId || !databases) return;

      const connection = databases.find((conn) =>
        conn.catalog_databases?.some((db) => db.id === params.databaseId)
      );

      if (!connection) return;

      const catalogDb = connection.catalog_databases?.find(
        (db) => db.id === params.databaseId
      );

      if (catalogDb) {
        setDescription(catalogDb.description || "");
      }
    };

    fetchDatabaseDescription();
  }, [params.databaseId, databases]);

  useEffect(() => {
    const fetchTags = async () => {
      if (!params.databaseId) return;

      try {
        const response = await catalogService.getTags(
          params.databaseId as string
        );
        if (response) {
          setTags(response);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
        toast({
          title: "Error",
          description: "Failed to fetch tags",
          variant: "destructive",
        });
      }
    };

    fetchTags();
  }, [params.databaseId]);

  const getDbTables = async () => {
    setLoading(true);
    try {
      const conn = databases.find((conn) => conn.id === params.databaseId);
      const db_type = conn?.db_type || "";
      if (!conn) return;
      const table = await databaseService.getDatabaseTables(
        params.databaseId as string,
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
        params.databaseId as string,
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
      const response = await catalogService.updateDatabaseDescription(
        params.databaseId as string,
        { description: newDescription }
      );

      if (!response.id) throw new Error("Failed to update description");
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
      const response = await catalogService.createTag(
        params.databaseId as string,
        {
          key: newTag.key,
          value: newTag.value,
        }
      );

      if (!response.id) throw new Error("Failed to add tag");
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

  const renderTableList = () => {
    return (
      <div className="flex-1 h-full flex flex-col">
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-blue-600 hover:text-blue-700"
              onClick={() => router.push("/catalog")}
            >
              {selectedConnection?.name || "Database"}
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
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

        <ScrollArea className="flex-1">
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
                  className="p-4 hover:bg-gray-50 cursor-pointer group"
                  onClick={() =>
                    handleTableClick(table, table.connection_id, table.dbType)
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <Table2 className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-blue-600 font-medium">
                        {table.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {table.owner}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderDatabaseDetails = () => {
    return (
      <div className="w-[250px] border-l h-full flex flex-col">
        <div className="border-b p-4">
          <h1 className="text-sm font-semibold">Database Details</h1>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Database Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">Description</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsEditingDescription(true)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-gray-600">
                {description || "No description"}
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">Tags</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsAddingTag(true)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.length === 0 ? (
                  <p className="text-xs text-gray-500">No tags added yet</p>
                ) : (
                  tags.map((tag, index) => (
                    <div
                      key={`${tag.key}-${index}`}
                      className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs"
                    >
                      <span className="font-medium">{tag.key}:</span>
                      <span>{tag.value}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Database Connection Details */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">Connection Details</h2>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Type</p>
                  <p className="text-xs">
                    {selectedConnection?.db_type || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Host</p>
                  <p className="text-xs">{selectedConnection?.host || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Port</p>
                  <p className="text-xs">{selectedConnection?.port || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Username</p>
                  <p className="text-xs">
                    {selectedConnection?.username || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Database</p>
                  <p className="text-xs">
                    {selectedConnection?.default_database_name || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">
                    Created At
                  </p>
                  <p className="text-xs">
                    {selectedConnection?.created_at
                      ? new Date(
                          selectedConnection.created_at
                        ).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left side - Database List */}
      <div className="border-r flex-shrink-0">
        <DatabaseList />
      </div>

      {/* Middle - Table List */}
      {renderTableList()}

      {/* Right side - Database Details */}
      {renderDatabaseDetails()}

      {/* Existing Dialogs */}
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

      <ComingSoonDialog
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
      />
    </div>
  );
}
