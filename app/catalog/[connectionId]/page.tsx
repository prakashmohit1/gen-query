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

export default function CatalogPage() {
  const params = useParams();
  const { selectedConnection, connections } = useSelectedDatabase();
  const [activeTab, setActiveTab] = useState<
    "overview" | "details" | "permissions"
  >("overview");
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [tables, setTables] = useState<TableDetails[]>([]);
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [createTableSQL, setCreateTableSQL] = useState("");
  const { databases, isLoading } = useDatabaseList();
  const [showPermissionsComingSoon, setShowPermissionsComingSoon] =
    useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedTableDetails, setSelectedTableDetails] =
    useState<TableDetails | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);

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
      case "permissions":
        return (
          <div className="flex items-center justify-center h-64">
            <Button
              variant="ghost"
              className="text-gray-500"
              onClick={() => setShowPermissionsComingSoon(true)}
            >
              Permissions management coming soon
            </Button>
          </div>
        );
    }
  };

  const renderContent = () => {
    return (
      <div className="flex-1">
        <Tabs
          value={activeTab}
          onValueChange={(value: any) => setActiveTab(value)}
        >
          <TabsList className="w-full justify-start border-b rounded-none px-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>
          <div className="p-4">{renderTableContent()}</div>
        </Tabs>
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
            {selectedDatabase && (
              <>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{selectedDatabase}</span>
              </>
            )}
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
            {selectedDatabase ? (
              <Button onClick={() => setShowCreateTable(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create table
              </Button>
            ) : (
              <Button onClick={() => setShowComingSoon(true)}>
                Create catalog
              </Button>
            )}
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

      {/* Create Table Dialog */}
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
