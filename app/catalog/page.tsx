"use client";

import { DatabaseList } from "@/components/editor/database-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, Search } from "lucide-react";
import { ComingSoonDialog } from "@/components/common/coming-soon-dialog";
import { useState } from "react";
import { useDatabaseList } from "@/contexts/database-context";
import { DatabaseConnection } from "@/lib/services/database.service";
import { useRouter } from "next/navigation";

export default function CatalogPage() {
  const router = useRouter();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const { databases, isLoading } = useDatabaseList();
  const [showPermissionsComingSoon, setShowPermissionsComingSoon] =
    useState(false);

  const handleDatabaseClick = async (conn: DatabaseConnection) => {
    router.push(`/catalog/${conn.id}`);
  };

  const renderContent = () => {
    return (
      <div className="divide-y">
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">
            Loading databases...
          </div>
        ) : databases.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            {filterQuery
              ? "No matching databases found"
              : "No databases available"}
          </div>
        ) : (
          databases.map((conn) => (
            <div
              key={conn.id}
              className="grid grid-cols-12 gap-4 py-4 hover:bg-gray-50 cursor-pointer group"
              onClick={() => handleDatabaseClick(conn)}
            >
              <div className="col-span-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <Database className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-blue-600">{conn.name}</span>
              </div>
              <div className="col-span-3 flex items-center text-sm text-gray-600">
                {conn.username || "System user"}
              </div>
              <div className="col-span-3 flex items-center text-sm text-gray-600">
                {new Date().toLocaleString()}
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

      {/* Right side - Catalog View */}
      <div className="flex-1 flex flex-col">
        {/* Breadcrumbs and Actions */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-blue-600 hover:text-blue-700"
              onClick={() => setSelectedDatabase(null)}
            >
              Catalogs
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder={
                  selectedDatabase ? "Filter tables..." : "Filter catalogs..."
                }
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setShowComingSoon(true)}>
              Create catalog
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="min-w-full">{renderContent()}</div>
          </div>
        </ScrollArea>
      </div>

      {/* Coming Soon Dialogs */}
      <ComingSoonDialog
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
      />
      <ComingSoonDialog
        isOpen={showPermissionsComingSoon}
        onClose={() => setShowPermissionsComingSoon(false)}
      />
    </div>
  );
}
