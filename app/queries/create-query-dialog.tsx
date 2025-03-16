"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queriesService } from "@/lib/services/queries";
import { useToast } from "@/components/ui/use-toast";
import { DatabaseSelector } from "@/components/common/database-selector";
import { useSelectedDatabase } from "@/contexts/database-context";

interface CreateQueryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateQueryDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateQueryDialogProps) {
  const router = useRouter();
  const [queryName, setQueryName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { selectedConnection } = useSelectedDatabase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryName || !selectedConnection) {
      toast({
        title: "Error",
        description: "Please enter a query name and select a database",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await queriesService.createQuery({
        name: queryName,
        databaseId: selectedConnection.id,
      });
      onOpenChange(false);
      onSuccess?.();
      router.push(
        `/db-editor?dbId=${selectedConnection.id}&queryName=${queryName}`
      );
      toast({
        title: "Success",
        description: "Query created successfully",
      });
    } catch (error) {
      console.error("Error creating query:", error);
      toast({
        title: "Error",
        description: "Failed to create query",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Query</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Query Name</label>
            <Input
              value={queryName}
              onChange={(e) => setQueryName(e.target.value)}
              placeholder="Enter query name"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Database</label>
            <DatabaseSelector />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
