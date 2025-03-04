"use client";
import ConnectDatabase from "@/components/computes/connect-database";
import {
  EllipsisVertical,
  Menu,
  Play,
  Search,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Tabs } from "radix-ui";
import { useState, useEffect } from "react";
import {
  databaseService,
  DatabaseConnection,
} from "@/lib/services/database.service";

export default function ComputePage() {
  const [selectedDb, setSelectedDb] = useState("postgresql");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const DATABASES = [
    {
      id: 1,
      name: "PostgreSQL",
      value: "postgresql",
      icon: "https://www.postgresql.org/favicon.ico",
    },
    {
      id: 2,
      name: "TursoDB",
      value: "tursodb",
      icon: "https://www.postgresql.org/favicon.ico",
    },
    {
      id: 3,
      name: "MySQL",
      value: "mysql",
      icon: "https://www.postgresql.org/favicon.ico",
    },
    {
      id: 4,
      name: "ClickHouse",
      value: "clickhouse",
      icon: "https://www.postgresql.org/favicon.ico",
    },
    {
      id: 5,
      name: "MongoDB",
      value: "mongodb",
      icon: "https://www.postgresql.org/favicon.ico",
    },
  ];

  useEffect(() => {
    console.log("fetchDatabaseConnections");
    fetchDatabaseConnections();
  }, []);

  const fetchDatabaseConnections = async () => {
    try {
      setLoading(true);
      const data = await databaseService.getDatabaseConnections();
      setConnections(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch database connections");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredConnections = connections.filter(
    (conn) =>
      conn.type.toLowerCase() === selectedDb.toLowerCase() &&
      (searchTerm === "" ||
        conn.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const onTabChange = (e: string) => {
    setSelectedDb(e);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm">
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
              <ConnectDatabase
                database={DATABASES.find((db) => db.value === selectedDb)}
              />
            </div>
          </div>

          {DATABASES.map((database) => (
            <Tabs.Content
              className="TabsContent p-4"
              value={database.value}
              key={database.id}
            >
              {loading ? (
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
                            Created By
                          </th>
                          <th className="font-medium text-purple-900">Size</th>
                          <th className="font-medium text-purple-900">
                            Active / Max
                          </th>
                          <th className="font-medium text-purple-900">Type</th>
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
                                <ShieldCheck
                                  className={`w-4 ${
                                    conn.status === "active"
                                      ? "text-green-500"
                                      : "text-gray-400"
                                  }`}
                                />
                              </td>
                              <td>{conn.name}</td>
                              <td>{conn.createdBy}</td>
                              <td>{conn.size}</td>
                              <td>
                                {conn.activeConnections}/{conn.maxConnections}
                              </td>
                              <td>{conn.connectionType}</td>
                              <td className="space-x-2">
                                <button className="hover:bg-purple-50 p-1 rounded">
                                  <Play className="w-3 h-3 text-purple-600" />
                                </button>
                                <button className="hover:bg-purple-50 p-1 rounded">
                                  <EllipsisVertical className="w-4 h-4 text-purple-600" />
                                </button>
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
    </div>
  );
}
