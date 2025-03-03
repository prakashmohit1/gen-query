"use client";
import ConnectDatabase from "@/components/computes/connect-database";
import {
  EllipsisVertical,
  Menu,
  Play,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Tabs } from "radix-ui";
import { useState } from "react";

export default function LoginPage() {
  const [selectedDb, setSelectedDb] = useState("postgresql");
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

  const onTabChange = (e: string) => {
    console.log("e", e);
    setSelectedDb(e);
  };
  return (
    <div className="w-full flex-1 bg-white rounded p-4">
      <div className="flex flex-col space-y-2 text-center">
        <div className="text-l font-semibold tracking-tight text-left">
          Databases
        </div>
        <Tabs.Root
          className="flex flex-col"
          defaultValue="postgresql"
          onValueChange={onTabChange}
        >
          <Tabs.List
            className="flex border-b gap-4"
            aria-label="Manage your account"
          >
            {DATABASES.map((database) => (
              <Tabs.Trigger
                key={database.id}
                className="flex h-[30px] cursor-default select-none items-center gap-4 text-[13px] leading-none outline-none first:rounded-tl-md last:rounded-tr-md hover:text-violet11 data-[state=active]:border-b-2 data-[state=active]:border-black"
                value={database.value}
              >
                {database.name}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <div className="flex p-2 w-full items-center">
            <div className="flex filter items-center border border-gray-200 rounded h-[30px] px-2">
              <Search className="text-gray-400 w-[18px] h-[18px]" />
              <input
                type="text"
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
              <div className="flex flex-col space-y-2 text-center">
                <div className="text-[13px] tracking-tight text-left">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 h-[30px]">
                        <th>Status</th>
                        <th>Name</th>
                        <th>Created By</th>
                        <th>Size</th>
                        <th>Active / Max</th>
                        <th>Type</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200 h-[30px]">
                        <td>
                          <ShieldCheck className="w-4" />
                        </td>
                        <td>Serverless DB</td>
                        <td>Mohit Prakash</td>
                        <td>Small</td>
                        <td>0/1</td>
                        <td>Serverless</td>
                        <td>
                          <button>
                            <Play className="w-3" />
                          </button>
                          <button>
                            <EllipsisVertical className="w-4" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </div>
    </div>
  );
}
