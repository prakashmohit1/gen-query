"use client";
import ConnectDatabase from "@/components/computes/connect-database";
import {
  EllipsisVertical,
  Menu,
  Play,
  Search,
  ShieldCheck,
  Loader2,
  Pencil,
  Trash2,
  Circle,
  PauseCircle,
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
  const [selectedDb, setSelectedDb] = useState("postgresql");
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
      conn?.db_type?.toLowerCase() === selectedDb?.toLowerCase() &&
      (searchTerm === "" ||
        conn.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const onTabChange = (e: string) => {
    setSelectedDb(e);
  };

  const setEmptyConnection = () => {
    setSelectedConnection({
      id: "",
      name: "",
      database_name: "",
      username: "",
      host: "",
      port: "",
      db_type: "",
      is_active: false,
    });
  };

  const handleEdit = async (connection: DatabaseConnection) => {
    try {
      setIsEditModalOpen(true);
      setEmptyConnection();
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
      console.log("data11", data);
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
        <div className="text-xl font-semibold text-purple-900">Databases</div>
        <Tabs.Root
          className="flex flex-col"
          defaultValue="postgresql"
          onValueChange={onTabChange}
        >
          <Tabs.List
            className="flex border-b gap-4"
            aria-label="Database Types"
          >
            {DATABASES.map((database) => (
              <Tabs.Trigger
                key={database.id}
                className="flex h-[30px] cursor-default select-none items-center gap-4 text-[13px] leading-none outline-none first:rounded-tl-md last:rounded-tr-md hover:text-purple-700 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-900"
                value={database.value}
              >
                {database.name}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <div className="flex p-4 w-full items-center">
            <div className="flex filter items-center border border-gray-200 rounded h-[30px] px-2">
              <Search className="text-gray-400 w-[18px] h-[18px]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter Database"
                className="outline-none text-[13px] px-2"
              />
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                size="sm"
                className="text-[13px] h-[30px] bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  setIsEditModalOpen(true);
                  setIsOpen(true);
                }}
              >
                {"Connect Database"}
              </Button>
              <ConnectDatabase
                database={DATABASES.find((db) => db.value === selectedDb)}
                isOpen={isOpen}
                onSuccess={() => {
                  setIsOpen(false);
                  refreshConnections();
                }}
                onClose={() => {
                  setIsOpen(false);
                }}
              />
            </div>
          </div>

          {DATABASES.map((database) => (
            <Tabs.Content
              className="TabsContent p-4"
              value={database.value}
              key={database.id}
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <div className="text-[13px] tracking-tight">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 h-[30px] text-left">
                          <th className="font-medium text-purple-900">
                            Status
                          </th>
                          <th className="font-medium text-purple-900">Name</th>
                          <th className="font-medium text-purple-900">
                            Database Name
                          </th>
                          <th className="font-medium text-purple-900">
                            Username
                          </th>
                          <th className="font-medium text-purple-900">Host</th>
                          <th className="font-medium text-purple-900">Port</th>
                          <th className="font-medium text-purple-900">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredConnections.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="text-center py-4 text-gray-500"
                            >
                              No database connections found
                            </td>
                          </tr>
                        ) : (
                          filteredConnections.map((conn) => (
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
                              <td>{conn.database_name}</td>
                              <td>{conn.username}</td>
                              <td>{conn.host}</td>
                              <td>{conn.port}</td>
                              <td className="space-x-2">
                                <button
                                  className="hover:bg-purple-50 p-1 rounded"
                                  onClick={() => handleToggleStatus(conn)}
                                  disabled={updatingStatus === conn.id}
                                >
                                  {updatingStatus === conn.id ? (
                                    <Loader2 className="w-3 h-3 text-purple-600 animate-spin" />
                                  ) : conn.is_active ? (
                                    <Pause className="w-3 h-3 text-purple-600" />
                                  ) : (
                                    <Play className="w-3 h-3 text-purple-600" />
                                  )}
                                </button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="hover:bg-purple-50 p-1 rounded">
                                      <EllipsisVertical className="w-4 h-4 text-purple-600" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-32"
                                  >
                                    <DropdownMenuItem
                                      onClick={() => handleEdit(conn)}
                                    >
                                      <Pencil className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setDeletingConnection(conn)
                                      }
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </div>

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
            <AlertDialogCancel onClick={() => setDeletingConnection(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
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
