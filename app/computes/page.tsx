"use client";
import ConnectDatabase from "@/components/computes/connect-database";
import {
  EllipsisVertical,
  Menu,
  Play,
  Search,
  Loader2,
  Pencil,
  Trash2,
  Circle,
  Pause,
} from "lucide-react";
import { Tabs } from "radix-ui";
import { useState, useEffect } from "react";
import {
  databaseService,
  DatabaseConnection,
} from "@/lib/services/database.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DATABASES } from "../constants";
import { useDatabaseList } from "@/contexts/database-context";

export default function ComputePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConnection, setSelectedConnection] =
    useState<DatabaseConnection | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deletingConnection, setDeletingConnection] =
    useState<DatabaseConnection | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { databases, isLoading, error, refreshConnections } = useDatabaseList();

  const filteredConnections = databases.filter(
    (conn) =>
      searchTerm === "" ||
      conn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conn.db_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group connections by database type
  const groupedConnections = filteredConnections.reduce((acc, conn) => {
    const type = conn.db_type.toLowerCase();
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(conn);
    return acc;
  }, {} as Record<string, DatabaseConnection[]>);

  const handleEdit = async (connection: DatabaseConnection) => {
    try {
      setIsEditModalOpen(true);
      setSelectedConnection(null);
      const data = await databaseService.getDatabaseConnection(connection.id);
      setSelectedConnection(data);
    } catch (err) {
      console.error("Error fetching connection details:", err);
    }
  };

  const handleDelete = async (connectionId: string) => {
    try {
      await databaseService.deleteDatabaseConnection(connectionId);
      refreshConnections(); // Refresh the list
      setDeletingConnection(null);
    } catch (err) {
      console.error("Error deleting connection:", err);
    }
  };

  const handleToggleStatus = async (connection: DatabaseConnection) => {
    try {
      setUpdatingStatus(connection.id);
      const data = await databaseService.updateDatabaseConnection(
        connection.id,
        {
          is_active: !connection.is_active,
        }
      );
      refreshConnections(); // Refresh the list
    } catch (err) {
      console.error("Error updating connection status:", err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-col space-y-2">
        <div className="text-xl font-semibold text-blue-900">Databases</div>

        <div className="flex p-4 w-full items-center">
          <div className="flex filter items-center border border-gray-200 rounded h-[30px] px-2">
            <Search className="text-gray-400 w-[18px] h-[18px]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search databases..."
              className="outline-none text-[13px] px-2"
            />
          </div>
          <div className="flex-1 flex justify-end">
            <Button
              size="sm"
              className="text-[13px] h-[30px] bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
              onClick={() => {
                setIsEditModalOpen(true);
                setIsOpen(true);
              }}
            >
              Connect Database
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : filteredConnections.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No database connections found
          </div>
        ) : (
          <div className="flex flex-col space-y-6">
            {Object.entries(groupedConnections).map(([type, connections]) => (
              <div key={type} className="flex flex-col space-y-2">
                <div className="flex items-center gap-2 px-2">
                  <h3 className="text-sm font-medium text-gray-900 capitalize">
                    {type} Connections
                  </h3>
                  <div className="text-xs text-gray-500">
                    ({connections.length})
                  </div>
                </div>
                <div className="text-[13px] tracking-tight">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 h-[30px] text-left">
                        <th className="font-medium text-blue-900">Status</th>
                        <th className="font-medium text-blue-900">Name</th>
                        <th className="font-medium text-blue-900">
                          Database Name
                        </th>
                        <th className="font-medium text-blue-900">Username</th>
                        <th className="font-medium text-blue-900">Host</th>
                        <th className="font-medium text-blue-900">Port</th>
                        <th className="font-medium text-blue-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {connections.map((conn) => (
                        <tr
                          key={conn.id}
                          className="border-b border-gray-200 h-[30px]"
                        >
                          <td>
                            <div className="flex items-center">
                              {conn.is_active ? (
                                <Circle className="w-3 h-3 text-green-500 fill-current" />
                              ) : (
                                <Circle className="w-3 h-3 text-red-500 fill-current" />
                              )}
                            </div>
                          </td>
                          <td>{conn.name}</td>
                          <td>{conn.default_database_name}</td>
                          <td>{conn.username}</td>
                          <td>{conn.host}</td>
                          <td>{conn.port}</td>
                          <td className="space-x-2">
                            <button
                              className="hover:bg-blue-50 p-1 rounded"
                              onClick={() => handleToggleStatus(conn)}
                              disabled={updatingStatus === conn.id}
                            >
                              {updatingStatus === conn.id ? (
                                <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                              ) : conn.is_active ? (
                                <Pause className="w-3 h-3 text-blue-600" />
                              ) : (
                                <Play className="w-3 h-3 text-blue-600" />
                              )}
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="hover:bg-blue-50 p-1 rounded">
                                  <EllipsisVertical className="w-4 h-4 text-blue-600" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem
                                  onClick={() => handleEdit(conn)}
                                >
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeletingConnection(conn)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConnectDatabase
        database={undefined}
        isOpen={isOpen}
        onSuccess={() => {
          setIsOpen(false);
          refreshConnections();
        }}
        onClose={() => {
          setIsOpen(false);
        }}
      />

      {/* Add ConnectDatabase modal for editing */}
      {isEditModalOpen && selectedConnection && (
        <ConnectDatabase
          database={DATABASES.find(
            (db) => db.value === selectedConnection.db_type
          )}
          connectionData={selectedConnection}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setSelectedConnection(null);
            refreshConnections();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingConnection}
        onOpenChange={() => setDeletingConnection(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              database connection{" "}
              <span className="font-semibold">{deletingConnection?.name}</span>{" "}
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              onClick={() => setDeletingConnection(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
              onClick={() =>
                deletingConnection?.id && handleDelete(deletingConnection.id)
              }
            >
              Delete Connection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
