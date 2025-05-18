"use client";

import { DatabaseList } from "@/components/editor/database-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, Search, Plus, Pencil } from "lucide-react";
import { ComingSoonDialog } from "@/components/common/coming-soon-dialog";
import { useState, useMemo } from "react";
import {
  useDatabaseList,
  DatabaseConnection,
} from "@/contexts/database-context";
import { catalogService } from "@/lib/services/catalog";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Breadcrumbs } from "@/components/common/breadcrumbs";

export default function CatalogPage() {
  const router = useRouter();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const { databases, isLoading } = useDatabaseList();
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<any>(null);
  const [newDescription, setNewDescription] = useState("");

  // Get all catalog databases from all connections
  const allCatalogDatabases = useMemo(() => {
    return databases
      .filter((conn) => conn.is_active)
      .flatMap((connection) =>
        (connection.catalog_databases || []).map((db) => ({
          ...db,
          connectionName: connection.name,
          connectionId: connection.id,
        }))
      );
  }, [databases]);

  // Filter catalog databases based on search query
  const filteredDatabases = useMemo(() => {
    return allCatalogDatabases.filter(
      (db) =>
        db.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
        db.connectionName.toLowerCase().includes(filterQuery.toLowerCase()) ||
        (db.description || "").toLowerCase().includes(filterQuery.toLowerCase())
    );
  }, [allCatalogDatabases, filterQuery]);

  const handleDatabaseClick = (database: any) => {
    router.push(`/catalog/${database.id}`);
  };

  const handleDescriptionUpdate = async () => {
    if (!selectedDatabase) return;

    try {
      await catalogService.updateDatabaseDescription(
        selectedDatabase.connectionId,
        {
          description: newDescription,
        }
      );

      toast({
        title: "Success",
        description: "Database description updated successfully",
      });
      setIsEditingDescription(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update description",
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    return (
      <div className="divide-y">
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">
            Loading databases...
          </div>
        ) : filteredDatabases.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            {filterQuery
              ? "No matching databases found"
              : "No databases available"}
          </div>
        ) : (
          filteredDatabases.map((db) => (
            <div
              key={`${db.connectionId}-${db.name}`}
              className="grid grid-cols-12 gap-4 py-4 hover:bg-gray-50 cursor-pointer group"
              onClick={() => handleDatabaseClick(db)}
            >
              <div className="col-span-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <Database className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-primary-600 font-medium">
                    {db.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {db.connectionName}
                  </span>
                </div>
              </div>
              <div className="col-span-3 flex items-center text-sm text-gray-600">
                {db.description || "No description"}
              </div>
              <div className="col-span-3 flex items-center text-sm text-gray-600">
                {new Date(db.created_at).toLocaleDateString()}
              </div>
              <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDatabase(db);
                    setNewDescription(db.description || "");
                    setIsEditingDescription(true);
                  }}
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit Description
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left side - Database List */}
      <div className="border-r flex-shrink-0">
        <DatabaseList />
      </div>

      {/* Main content */}
      <div className="flex-1 h-full flex flex-col">
        <div className="border-b p-4 flex flex justify-between gap-4">
          <Breadcrumbs items={[{ label: "Catalog" }]} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"></div>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Filter databases..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="min-w-full">{renderContent()}</div>
          </div>
        </ScrollArea>
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

      {/* Coming Soon Dialog */}
      <ComingSoonDialog
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
      />
    </div>
  );
}
