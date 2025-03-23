"use client";

import {
  useSelectedDatabase,
  useDatabaseList,
} from "@/contexts/database-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function DatabaseSelector() {
  const { databases, isLoading } = useDatabaseList();
  const { selectedDatabase, selectDatabase } = useSelectedDatabase();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Flatten all catalog databases from all connections
  const allCatalogDatabases = databases.flatMap((conn) =>
    (conn.catalog_databases || []).map((db) => ({
      ...db,
      connection_name: conn.name,
    }))
  );

  const handleDatabaseChange = (databaseId: string) => {
    // Update the database in context
    selectDatabase(databaseId);

    // Update URL parameters
    const params = new URLSearchParams(searchParams.toString());
    params.set("database_id", databaseId);

    // Remove queryId when changing database as it might be invalid for new database
    params.delete("queryId");

    router.replace(`/db-editor?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (allCatalogDatabases.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500">
        <Database className="w-3.5 h-3.5" />
        <span>No databases available</span>
      </div>
    );
  }

  return (
    <Select value={selectedDatabase?.id} onValueChange={handleDatabaseChange}>
      <SelectTrigger className="w-[200px] h-9 text-sm bg-gray-50 border-gray-200">
        <SelectValue placeholder="Select database">
          {selectedDatabase && (
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5" />
              <div className="flex flex-col">
                <span>{selectedDatabase.name}</span>
                <span className="text-xs text-gray-500">
                  {
                    databases.find((conn) =>
                      conn.catalog_databases?.some(
                        (db) => db.id === selectedDatabase.id
                      )
                    )?.name
                  }
                </span>
              </div>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allCatalogDatabases.map((db) => (
          <SelectItem
            key={db.id}
            value={db.id}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5" />
              <div className="flex flex-col">
                <span>{db.name}</span>
                <span className="text-xs text-gray-500">
                  {db.connection_name}
                </span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
