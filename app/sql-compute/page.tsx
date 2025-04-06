"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Play, Pause, MoreVertical, History, Edit, Trash2, Shield } from "lucide-react";

interface WarehouseData {
  status: string;
  name: string;
  createdBy: string;
  size: string;
  active: boolean;
  type: string;
  isRunning: boolean;
}

export default function SQLComputePage() {
  const [activeTab, setActiveTab] = useState("sql-compute");
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([
    {
      status: "Running",
      name: "warehouse-1",
      createdBy: "John Doe",
      size: "X-Large",
      active: true,
      type: "Serverless",
      isRunning: true,
    },
    // Add more mock data as needed
  ]);

  const toggleWarehouseState = (index: number) => {
    setWarehouses(prevWarehouses => 
      prevWarehouses.map((warehouse, i) => 
        i === index 
          ? { ...warehouse, isRunning: !warehouse.isRunning, status: warehouse.isRunning ? "Stopped" : "Running" }
          : warehouse
      )
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">SQL Compute</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create SQL Warehouse</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>New SQL warehouse</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input placeholder="SQL warehouse name" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Cluster size</Label>
                  <InfoCircledIcon className="h-4 w-4 text-gray-500" />
                </div>
                <Select defaultValue="x-large">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="x-large">X-Large (80 DBU/h)</SelectItem>
                    <SelectItem value="large">Large (40 DBU/h)</SelectItem>
                    <SelectItem value="medium">Medium (20 DBU/h)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Auto stop</Label>
                <div className="flex items-center gap-4">
                  <Switch defaultChecked />
                  <span>After</span>
                  <Input type="number" className="w-20" defaultValue={10} />
                  <span>minutes of inactivity</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Scaling</Label>
                  <InfoCircledIcon className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex items-center gap-4">
                  <span>Min.</span>
                  <Input type="number" className="w-20" defaultValue={1} />
                  <span>Max.</span>
                  <Input type="number" className="w-20" defaultValue={1} />
                  <span>clusters (80 DBU)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="serverless"
                      defaultChecked
                    />
                    <span>Serverless</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" name="type" value="pro" />
                    <span>Pro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" name="type" value="classic" />
                    <span>Classic</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Advanced options</Label>
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Tags</Label>
                      <InfoCircledIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex gap-4">
                      <Input placeholder="Key" />
                      <Input placeholder="Value" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Unity Catalog</Label>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Channel</Label>
                      <InfoCircledIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="channel"
                          value="current"
                          defaultChecked
                        />
                        <span>Current</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="radio" name="channel" value="preview" />
                        <span>Preview</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline">Cancel</Button>
              <Button>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        {/* <TabsList>
          <TabsTrigger value="all-purpose">All Purpose Compute</TabsTrigger>
          <TabsTrigger value="job-compute">Job Compute</TabsTrigger>
          <TabsTrigger value="sql-compute">SQL Compute</TabsTrigger>
          <TabsTrigger value="vector-search">Vector Search</TabsTrigger>
          <TabsTrigger value="pools">Pools</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList> */}

        {/* <TabsContent value="sql-compute"> */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.createdBy}</TableCell>
                <TableCell>{row.size}</TableCell>
                <TableCell>{row.active ? "Yes" : "No"}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleWarehouseState(index)}
                    >
                      {row.isRunning ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" />
                          Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <History className="h-4 w-4 mr-2" />
                          Query History
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* </TabsContent> */}

        {/* Add other tab contents as needed */}
      </Tabs>
    </div>
  );
}
