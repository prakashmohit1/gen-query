"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Database,
  ChevronRight,
  Plus,
  Check,
  X,
  List,
  Table as TableIcon,
  Search,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useDatabaseList } from "@/contexts/database-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function ChatWithGenQuery() {
  // Get databases from database context
  const router = useRouter();
  const { databases, isLoading, fetchTableColumns } = useDatabaseList();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<any>(null);
  const [selectedDatabase, setSelectedDatabase] = useState<any>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<
    "connections" | "databases" | "tables"
  >("connections");
  const [searchQuery, setSearchQuery] = useState("");

  const handleNewClick = () => {
    setIsDialogOpen(true);
    setCurrentView("connections");
    setSelectedConnection(null);
    setSelectedDatabase(null);
    setSelectedTables([]);
    setSearchQuery("");
  };

  const handleConnectionSelect = (connection: any) => {
    setSelectedConnection(connection);
    setCurrentView("databases");
    setSearchQuery("");
  };

  const handleDatabaseSelect = (database: any) => {
    setCurrentView("tables");
    setSearchQuery("");
    fetchTableColumns(database.id);
    console.log("Database selected:", databases);
    setSelectedDatabase(database);
  };

  const handleTableToggle = (tableName: string) => {
    setSelectedTables((prev) =>
      prev.includes(tableName)
        ? prev.filter((t) => t !== tableName)
        : [...prev, tableName]
    );
  };

  const handleBack = () => {
    if (currentView === "tables") {
      setCurrentView("databases");
      setSelectedTables([]);
    } else if (currentView === "databases") {
      setCurrentView("connections");
      setSelectedDatabase(null);
    }
    setSearchQuery("");
  };

  const handleSubmit = () => {
    // Handle submission logic here
    console.log({
      connection: selectedConnection,
      database: selectedDatabase,
      tables: selectedTables,
    });
    router.push(
      `/talk-to-data/chat/${selectedConnection.id}/${selectedDatabase.id}`
    );
    setIsDialogOpen(false);
  };

  useEffect(() => {
    if (selectedConnection && selectedDatabase) {
      const db =
        Array.isArray(databases) &&
        databases
          ?.find((db) => db?.id === selectedConnection?.id)
          ?.catalog_databases?.find((db) => db?.id === selectedDatabase?.id);

      setSelectedDatabase(db);
    }
  }, [databases]);

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Talk to Data</h1>
          <p className="text-muted-foreground">
            Select a database to start asking questions
          </p>
        </div>
        <Button onClick={handleNewClick} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          New
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary-500 animate-pulse"></div>
            <div className="h-2 w-2 rounded-full bg-primary-500 animate-pulse delay-150"></div>
            <div className="h-2 w-2 rounded-full bg-primary-500 animate-pulse delay-300"></div>
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs w-1/4">Name</TableHead>
                <TableHead className="text-xs w-1/3">Description</TableHead>
                <TableHead className="text-xs w-1/6">Type</TableHead>
                <TableHead className="text-xs w-1/6">Last Modified</TableHead>
                <TableHead className="text-xs w-16">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* {filteredDatabases.length > 0 ? (
                filteredDatabases.map((connection) => (
                  <TableRow
                    key={connection.id}
                    className="hover:bg-muted cursor-pointer"
                  >
                    <TableCell className="text-xs font-medium">
                      <Link
                        href={`/gen-query/chat/${connection.connectionId}/${connection.id}`}
                        className="flex items-center"
                      >
                        <Database className="h-3 w-3 mr-2 text-muted-foreground" />
                        {connection.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {connection.description}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {connection.db_type}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {connection.last_modify}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={connection.is_active ? "default" : "outline"}
                        className={`text-[10px] px-2 py-0 ${
                          connection.is_active ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {connection.is_active ? "Online" : "Offline"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <p className="text-xs text-muted-foreground">
                      No databases found
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add a database connection to Talk to Data
                    </p>
                  </TableCell>
                </TableRow>
              )} */}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg h-[550px] flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Connect your data</h2>
            <p className="text-xs text-muted-foreground">
              Genie spaces empower you to uncover meaningful insights from your
              data. Just upload your datasets, provide instructions, and simply
              ask your data questions.
            </p>
          </div>

          <div className="flex flex-col space-y-3 flex-1 overflow-hidden">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center text-xs">
              <span
                className={`${
                  currentView === "connections"
                    ? "text-primary-600 font-medium"
                    : "text-gray-500 cursor-pointer hover:text-primary-600"
                }`}
                onClick={() => {
                  if (currentView !== "connections") {
                    setCurrentView("connections");
                    setSelectedDatabase(null);
                    setSelectedTables([]);
                  }
                }}
              >
                Connections
              </span>

              {(currentView === "databases" || currentView === "tables") && (
                <>
                  <ChevronRight className="h-3 w-3 mx-1 text-gray-400" />
                  <span
                    className={`${
                      currentView === "databases"
                        ? "text-primary-600 font-medium"
                        : "text-gray-500 cursor-pointer hover:text-primary-600"
                    }`}
                    onClick={() => {
                      if (currentView === "tables") {
                        setCurrentView("databases");
                        setSelectedTables([]);
                      }
                    }}
                  >
                    {selectedConnection?.name || "Database"}
                  </span>
                </>
              )}

              {currentView === "tables" && (
                <>
                  <ChevronRight className="h-3 w-3 mx-1 text-gray-400" />
                  <span className="text-primary-600 font-medium">
                    {selectedDatabase?.name || "Tables"}
                  </span>
                </>
              )}
            </div>

            {/* Search Box */}
            <div className="relative flex-shrink-0">
              <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-gray-500" />
              <Input
                type="text"
                placeholder={`Search ${
                  currentView === "connections"
                    ? "connections"
                    : currentView === "databases"
                    ? "databases"
                    : "tables"
                }...`}
                className="pl-8 text-xs h-8 outline-0 outline-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {currentView === "connections" && (
              <div className="flex-1 overflow-y-auto pr-1 space-y-1">
                {databases?.length ? (
                  databases.map((connection) => (
                    <div
                      key={connection.id}
                      onClick={() => handleConnectionSelect(connection)}
                      className="flex items-center justify-between p-2 rounded-md border hover:border-primary-200 hover:bg-primary-50/30 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="p-1.5 bg-primary-50 rounded-md mr-2">
                          <Database className="h-3 w-3 text-primary-600" />
                        </div>
                        <p className="text-xs">{connection.name}</p>
                      </div>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 border rounded-md">
                    <p className="text-xs text-muted-foreground">
                      No connections found
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentView === "databases" && selectedConnection && (
              <div className="flex-1 overflow-y-auto pr-1 space-y-1">
                {(selectedConnection?.catalog_databases ?? [])?.length ? (
                  (selectedConnection?.catalog_databases ?? []).map(
                    (db: any) => (
                      <div
                        key={db.id}
                        onClick={() => handleDatabaseSelect(db)}
                        className="flex items-center justify-between p-2 rounded-md border hover:border-primary-200 hover:bg-primary-50/30 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="p-1.5 bg-green-50 rounded-md mr-2">
                            <List className="h-3 w-3 text-green-600" />
                          </div>
                          <p className="text-xs">{db.name}</p>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )
                  )
                ) : (
                  <div className="text-center p-8 border rounded-md">
                    <p className="text-xs text-muted-foreground">
                      No databases found
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentView === "tables" &&
              selectedConnection &&
              selectedDatabase && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Tables List */}
                  <div className="overflow-y-auto pr-1 space-y-1 flex-1">
                    {selectedDatabase?.tables?.length ? (
                      selectedDatabase?.tables.map((table: any) => (
                        <div
                          key={table.name}
                          className="flex items-center justify-between p-2 rounded-md border hover:border-primary-200 hover:bg-primary-50/30 cursor-pointer transition-colors"
                          onClick={() => handleTableToggle(table.name)}
                        >
                          <div className="flex items-center">
                            <TableIcon className="h-3 w-3 mr-2 text-muted-foreground" />
                            <p className="text-xs">{table.name}</p>
                          </div>
                          <Checkbox
                            checked={selectedTables.includes(table.name)}
                            className="text-primary-600 p-2 flex items-center justify-center"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-8 border rounded-md">
                        <p className="text-xs text-muted-foreground">
                          No tables found
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>

          <DialogFooter className="mt-4 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="mr-2 text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={currentView !== "tables" || selectedTables.length === 0}
              className="text-xs h-8"
            >
              Create Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
