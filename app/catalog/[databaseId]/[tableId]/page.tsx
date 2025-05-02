"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Table2,
  Plus,
  Pencil,
  ArrowLeft,
  Database,
  X,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
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
import { useParams, useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { catalogService } from "@/lib/services/catalog";
import { DatabaseList } from "@/components/editor/database-list";
import { Breadcrumbs } from "@/components/common/breadcrumbs";

interface Column {
  id: string;
  name: string;
  description: string;
  data_type: string;
  is_nullable: boolean;
  ordinal_position: number;
  tags?: Tag[];
}

interface Tag {
  key: string;
  value: string;
}

interface TableDetails {
  id: string;
  name: string;
  description: string;
  columns: Column[];
  tags: Tag[];
}

export default function TablePage() {
  const params = useParams();
  const router = useRouter();
  const { selectedConnection } = useSelectedDatabase();
  const { databases } = useDatabaseList();

  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");
  const [columns, setColumns] = useState<Column[]>([]);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState<Tag>({ key: "", value: "" });
  const [tableName, setTableName] = useState("");
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [isEditingColumnDescription, setIsEditingColumnDescription] =
    useState(false);
  const [newColumnDescription, setNewColumnDescription] = useState("");
  const [isAddingColumnTag, setIsAddingColumnTag] = useState(false);
  const [newColumnTag, setNewColumnTag] = useState<Tag>({ key: "", value: "" });

  // Fetch table details on mount
  useEffect(() => {
    const fetchTableDetails = async () => {
      if (!params.tableId) return;

      try {
        setLoading(true);
        const columnsData = await catalogService.getColumns(
          params.tableId as string
        );

        if (Array.isArray(columnsData?.columns))
          setColumns(columnsData.columns || []);

        if (columnsData?.id) {
          setTableName(columnsData.name);
          setDescription(columnsData.description || "");
        }

        // Fetch tags
        const tagsData = await catalogService.getTableTags(
          params.tableId as string
        );
        if (Array.isArray(tagsData)) setTags(tagsData || []);
      } catch (error) {
        console.error("Error fetching table details:", error);
        toast({
          title: "Error",
          description: "Failed to fetch table details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTableDetails();
  }, [params.tableId, databases]);

  const handleDescriptionUpdate = async () => {
    if (!params.tableId) return;

    try {
      await catalogService.updateTableDescription(params.tableId as string, {
        description: newDescription,
      });

      setDescription(newDescription);
      setIsEditingDescription(false);
      toast({
        title: "Success",
        description: "Table description updated successfully",
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
    if (!params.tableId) return;

    try {
      await catalogService.createTableTag(params.tableId as string, newTag);
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

  const handleColumnDescriptionUpdate = async () => {
    if (!selectedColumn) return;

    try {
      await catalogService.updateColumnDescription(selectedColumn.id, {
        description: newColumnDescription,
      });

      // Update the columns array with the new description
      setColumns(
        columns.map((col) =>
          col.id === selectedColumn.id
            ? { ...col, description: newColumnDescription }
            : col
        )
      );

      setSelectedColumn({
        ...selectedColumn,
        description: newColumnDescription,
      });
      setIsEditingColumnDescription(false);
      toast({
        title: "Success",
        description: "Column description updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update column description",
        variant: "destructive",
      });
    }
  };

  const handleAddColumnTag = async () => {
    if (!selectedColumn) return;

    try {
      await catalogService.createColumnTag(selectedColumn.id, newColumnTag);

      // Update the columns array with the new tag
      const updatedColumn = {
        ...selectedColumn,
        tags: [...(selectedColumn.tags || []), newColumnTag],
      };

      setColumns(
        columns.map((col) =>
          col.id === selectedColumn.id ? updatedColumn : col
        )
      );

      setSelectedColumn(updatedColumn);
      setNewColumnTag({ key: "", value: "" });
      setIsAddingColumnTag(false);
      toast({
        title: "Success",
        description: "Column tag added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add column tag",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTableTag = async (tagToDelete: Tag) => {
    if (!params.tableId) return;

    try {
      await catalogService.deleteTableTag(
        params.tableId as string,
        tagToDelete
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

  const handleDeleteColumnTag = async (columnId: string, tagToDelete: Tag) => {
    try {
      await catalogService.deleteColumnTag(columnId, tagToDelete.id);

      // Update the columns array by removing the tag
      setColumns(
        columns.map((col) => {
          if (col.id === columnId) {
            return {
              ...col,
              tags: (col.tags || []).filter(
                (tag) =>
                  !(
                    tag.key === tagToDelete.key &&
                    tag.value === tagToDelete.value
                  )
              ),
            };
          }
          return col;
        })
      );

      // Update selected column if it's the one being modified
      if (selectedColumn?.id === columnId) {
        setSelectedColumn({
          ...selectedColumn,
          tags: (selectedColumn.tags || []).filter(
            (tag) =>
              !(tag.key === tagToDelete.key && tag.value === tagToDelete.value)
          ),
        });
      }

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

  const filteredColumns = Array.isArray(columns)
    ? columns?.filter(
        (column) =>
          column.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
          column.data_type.toLowerCase().includes(filterQuery.toLowerCase()) ||
          column.description.toLowerCase().includes(filterQuery.toLowerCase())
      )
    : [];

  const renderColumnsList = () => {
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
              { label: databaseName, href: `/catalog/${params.databaseId}` },
              { label: tableName || "Table" },
            ]}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"></div>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Filter columns..."
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
                Loading columns...
              </div>
            ) : filteredColumns.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No columns available
              </div>
            ) : (
              filteredColumns.map((column) => (
                <div
                  key={column.id}
                  className="p-4 hover:bg-gray-50 group cursor-pointer"
                  onClick={() => {
                    setSelectedColumn(column);
                    setIsColumnDialogOpen(true);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <Database className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-600 font-medium">
                          {column.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {column.data_type}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 mt-1">
                        {column.description || "No description"}
                      </span>
                      {/* Column Tags */}
                      {column.tags && column.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {column.tags.map((tag, index) => (
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
                                  handleDeleteColumnTag(column.id, tag);
                                }}
                                className="opacity-0 group-hover/tag:opacity-100 hover:text-red-600 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
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

  const renderTableDetails = () => {
    return (
      <div className="w-[300px] border-l h-full flex flex-col">
        <div className="border-b p-4">
          <h1 className="text-sm font-semibold">Table Details</h1>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Table Name */}
            <div className="space-y-1">
              <h2 className="text-sm font-semibold">Name</h2>
              <p className="text-sm text-gray-600">{tableName}</p>
            </div>

            {/* Table Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Description</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    setNewDescription(description);
                    setIsEditingDescription(true);
                  }}
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
              <div className="flex items-center justify-between">
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
                      className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs group/tag"
                    >
                      <span className="text-blue-700">
                        {tag.key}: {tag.value}
                      </span>
                      <button
                        onClick={() => handleDeleteTableTag(tag)}
                        className="opacity-0 group-hover/tag:opacity-100 hover:text-red-600 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column Stats */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">Statistics</h2>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total Columns</span>
                  <span className="font-medium">{columns.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Nullable Columns</span>
                  <span className="font-medium">
                    {Array.isArray(columns) &&
                      columns?.filter((col) => col.is_nullable).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  };

  // Add Column Details Dialog
  const renderColumnDialog = () => {
    if (!selectedColumn) return null;

    return (
      <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              <span>{selectedColumn.name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Column Type */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-500">Data Type</h3>
              <p className="text-sm">{selectedColumn.data_type}</p>
            </div>

            {/* Column Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">
                  Description
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    setNewColumnDescription(selectedColumn.description);
                    setIsEditingColumnDescription(true);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
              <p className="text-sm">
                {selectedColumn.description || "No description"}
              </p>
            </div>

            {/* Column Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Tags</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={() => setIsAddingColumnTag(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tag
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {!selectedColumn.tags || selectedColumn.tags.length === 0 ? (
                  <p className="text-sm text-gray-500">No tags</p>
                ) : (
                  selectedColumn.tags.map((tag, index) => (
                    <div
                      key={`${tag.key}-${index}`}
                      className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-sm group/tag"
                    >
                      <span className="text-blue-700">
                        {tag.key}: {tag.value}
                      </span>
                      <button
                        onClick={() =>
                          handleDeleteColumnTag(selectedColumn.id, tag)
                        }
                        className="opacity-0 group-hover/tag:opacity-100 hover:text-red-600 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">
                Additional Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ordinal Position</p>
                  <p className="text-sm">{selectedColumn.ordinal_position}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nullable</p>
                  <p className="text-sm">
                    {selectedColumn.is_nullable ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="flex h-screen">
      <DatabaseList />
      <div className="flex flex-1">
        {/* Main content - Column List */}
        {renderColumnsList()}

        {/* Right side - Table Details */}
        {renderTableDetails()}

        {renderColumnDialog()}

        {/* Edit Description Dialog */}
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
                  onChange={(e) =>
                    setNewTag({ ...newTag, key: e.target.value })
                  }
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

        {/* Edit Column Description Dialog */}
        <Dialog
          open={isEditingColumnDescription}
          onOpenChange={setIsEditingColumnDescription}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Column Description</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={newColumnDescription}
                onChange={(e) => setNewColumnDescription(e.target.value)}
                placeholder="Enter column description"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditingColumnDescription(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleColumnDescriptionUpdate}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Column Tag Dialog */}
        <Dialog open={isAddingColumnTag} onOpenChange={setIsAddingColumnTag}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Column Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Key</label>
                <Input
                  value={newColumnTag.key}
                  onChange={(e) =>
                    setNewColumnTag({ ...newColumnTag, key: e.target.value })
                  }
                  placeholder="Enter tag key"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Value</label>
                <Input
                  value={newColumnTag.value}
                  onChange={(e) =>
                    setNewColumnTag({ ...newColumnTag, value: e.target.value })
                  }
                  placeholder="Enter tag value"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingColumnTag(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddColumnTag}>Add Tag</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
