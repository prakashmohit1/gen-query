"use client";

import { DatabaseList } from "@/components/editor/database-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Table2, Plus, Pencil, X } from "lucide-react";
import { ComingSoonDialog } from "@/components/common/coming-soon-dialog";
import { useState, useEffect, useMemo } from "react";
import {
  useDatabaseList,
  useSelectedDatabase,
} from "@/contexts/database-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useParams } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { catalogService } from "@/lib/services/catalog";
import { Breadcrumbs } from "@/components/common/breadcrumbs";

interface TableDetails {
  id: string;
  name: string;
  description: string;
  owner: string;
  created_at: string;
  columns: Array<{
    name: string;
    type: string;
    comment?: string;
  }>;
  tags: Tag[];
}

interface Tag {
  key: string;
  value: string;
}

export default function CatalogPage() {
  const params = useParams();
  const { selectedConnection } = useSelectedDatabase();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<TableDetails[]>([]);
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
  const router = useRouter();

  // Add memoized filtered tables
  const filteredTables = useMemo(() => {
    return tables.filter(
      (table) =>
        table.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
        table.description?.toLowerCase().includes(filterQuery.toLowerCase()) ||
        table.owner?.toLowerCase().includes(filterQuery.toLowerCase()) ||
        table.tags?.some(
          (tag) =>
            tag.key.toLowerCase().includes(filterQuery.toLowerCase()) ||
            tag.value.toLowerCase().includes(filterQuery.toLowerCase())
        )
    );
  }, [tables, filterQuery]);

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
        const fetchedTags = await catalogService.getTags(
          params.databaseId as string
        );
        setTags(fetchedTags || []);
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

  useEffect(() => {
    setLoading(loading);
  }, [isLoading]);

  useEffect(() => {
    getTables();
  }, []);

  const getTables = async () => {
    setLoading(true);
    try {
      const res = await catalogService.getTables(params.databaseId as string);
      console.log("tables", res, selectedConnection);
      if (Array.isArray(res?.tables)) setTables(res.tables);
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = async (table: TableDetails) => {
    router.push(`/catalog/${params.databaseId}/${table.id}`);
  };

  const handleDescriptionUpdate = async () => {
    try {
      await catalogService.updateDatabaseDescription(
        params.databaseId as string,
        { description: newDescription }
      );

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
      await catalogService.createTag(params.databaseId as string, {
          key: newTag.key,
          value: newTag.value,
      });

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

  const handleDeleteDatabaseTag = async (tagToDelete: Tag) => {
    if (!params.databaseId) return;

    try {
      await catalogService.deleteTag(
        params.databaseId as string,
        tagToDelete.id
      );
      setTags(
        tags.filter(
          (tag) =>
            !(tag.key === tagToDelete.key && tag.value === tagToDelete.value)
        )
      );
      toast({
        title: "Success",
        description: "Tag deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive",
      });
    }
  };

  const renderTableList = () => {
    const databaseName =
      databases
        ?.find((conn) =>
          conn.catalog_databases?.some((db) => db.id === params.databaseId)
        )
        ?.catalog_databases?.find((db) => db.id === params.databaseId)?.name ||
      "Database";

        return (
      <div className="flex-1 h-full flex flex-col">
        <div className="border-b p-4 flex flex justify-between gap-4">
          <Breadcrumbs
            items={[
              { label: "Catalog", href: "/catalog" },
              { label: databaseName },
            ]}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"></div>
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
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="divide-y">
            {loading ? (
              <div className="py-8 text-center text-gray-500">
                Loading tables...
              </div>
            ) : filteredTables.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                {filterQuery
                  ? "No matching tables found"
                  : "No tables available"}
              </div>
            ) : (
              filteredTables.map((table, id) => (
                <div
                  key={`${table.name}-${id}`}
                  className="p-4 hover:bg-gray-50 cursor-pointer group"
                  onClick={() => handleTableClick(table)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <Table2 className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-600 font-medium">
                          {table.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {table.columns?.length || 0} columns
                        </span>
                      </div>
                      {/* Table Description */}
                      <span className="text-sm text-gray-500 mt-1">
                        {table.description || "No description"}
                      </span>
                      {/* Table Tags */}
                      {table.tags && table.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {table.tags.map((tag, index) => (
                            <div
                              key={`${tag.key}-${index}`}
                              className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs group/tag"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="text-blue-700">
                                {tag.key}: {tag.value}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDatabaseTag(tag);
                                }}
                                className="opacity-0 group-hover/tag:opacity-100 hover:text-red-600 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Additional Details */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {table.owner && (
                          <div className="flex items-center gap-1">
                            <span>Owner:</span>
                            <span className="text-gray-900">{table.owner}</span>
                          </div>
                        )}
                        {table.created_at && (
                          <div className="flex items-center gap-1">
                            <span>Created:</span>
                            <span className="text-gray-900">
                              {new Date(table.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                  </div>
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
                      className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs group/tag"
                    >
                      <span className="text-blue-700">
                        {tag.key}: {tag.value}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDatabaseTag(tag);
                        }}
                        className="opacity-0 group-hover/tag:opacity-100 hover:text-red-600 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
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

      <ComingSoonDialog
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
      />
    </div>
  );
}
