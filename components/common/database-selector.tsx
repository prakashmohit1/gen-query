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

export function DatabaseSelector() {
  const { databases, isLoading } = useDatabaseList();
  const { selectedConnection, selectConnection } = useSelectedDatabase();

  const activeConnections = databases.filter((conn) => conn.is_active);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (activeConnections.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500">
        <Database className="w-3.5 h-3.5" />
        <span>No active databases</span>
      </div>
    );
  }

  return (
    <Select
      value={selectedConnection?.id}
      onValueChange={(value) => selectConnection(value)}
    >
      <SelectTrigger className="w-[200px] h-9 text-sm bg-gray-50 border-gray-200">
        <SelectValue placeholder="Select database">
          {selectedConnection && (
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5" />
              <span>{selectedConnection.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {activeConnections.map((conn) => (
          <SelectItem
            key={conn.id}
            value={conn.id}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5" />
              <span>{conn.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
