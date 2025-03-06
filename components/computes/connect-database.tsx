import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import {
  databaseService,
  DatabaseConnection,
} from "@/lib/services/database.service";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DATABASES } from "@/app/constants";

interface ConnectDatabaseProps {
  database:
    | {
        id: number;
        name: string;
        value: string;
        icon: string;
      }
    | undefined;
  connectionData?: DatabaseConnection;
  isOpen?: boolean;
  onSuccess?: () => void;
  onClose?: () => void;
}

interface FormFieldType {
  id: keyof FormData;
  label: string;
  type: "text" | "textarea" | "password" | "switch" | "select";
  placeholder?: string;
  showOnlyOnUpdate?: boolean;
}

const FormField: FormFieldType[] = [
  {
    id: "name",
    label: "Connection Name",
    type: "text",
    placeholder: "Enter connection name",
  },
  {
    id: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter description (optional)",
  },
  {
    id: "database_name",
    label: "Database Name",
    type: "text",
    placeholder: "Enter database name",
  },
  {
    id: "db_type",
    label: "Database Type",
    type: "select",
    placeholder: "Select database type",
    showOnlyOnUpdate: true,
  },
  {
    id: "host",
    label: "Host",
    type: "text",
    placeholder: "Enter host",
  },
  {
    id: "port",
    label: "Port",
    type: "text",
    placeholder: "Enter port",
  },
  {
    id: "username",
    label: "Username",
    type: "text",
    placeholder: "Enter username",
  },
  {
    id: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter password",
  },
  {
    id: "is_active",
    label: "Active Connection",
    type: "switch",
  },
];

type FormData = {
  name: string;
  description: string;
  database_name: string;
  host: string;
  port: string;
  username: string;
  password: string;
  db_type: string;
  connection_options: Record<string, any>;
  is_active: boolean;
};

export default function ConnectDatabase({
  database,
  connectionData,
  isOpen,
  onSuccess,
  onClose,
}: ConnectDatabaseProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      name: connectionData?.name || "",
      description: connectionData?.description || "",
      host: connectionData?.host || "",
      port: connectionData?.port?.toString() || "",
      username: connectionData?.username || "",
      password: connectionData?.password || "",
      database_name: connectionData?.database_name || "",
      db_type: database?.name.toLowerCase() || "",
      connection_options: connectionData?.connection_options || {},
      is_active: connectionData?.is_active ?? true,
    },
  });

  useEffect(() => {
    if (connectionData) {
      form.reset({
        name: connectionData.name,
        description: connectionData.description || "",
        host: connectionData.host,
        port: connectionData.port.toString(),
        username: connectionData.username,
        password: connectionData.password || "",
        database_name: connectionData.database_name,
        db_type: connectionData.db_type.toLowerCase(),
        connection_options: connectionData.connection_options || {},
        is_active: connectionData.is_active,
      });
      setOpen(true);
    }
  }, [connectionData, form]);

  useEffect(() => {
    if (isOpen) {
      setOpen(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!open) {
      onClose?.();
    }
  }, [open, onClose]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const payload = {
        ...data,
        port: parseInt(data.port, 10),
        db_type:
          data.db_type?.toLowerCase() || database?.name?.toLowerCase() || "",
      };

      console.log("payload", payload);
      if (connectionData?.id) {
        await databaseService.updateDatabaseConnection(
          connectionData.id,
          payload
        );
      } else {
        await databaseService.createDatabaseConnection(payload);
      }
      setOpen(false);
      onSuccess?.();
      form.reset();
    } catch (error) {
      console.error("Error saving database connection:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {connectionData
              ? `Update ${connectionData?.db_type} Database Connection`
              : `Connect to ${database?.name} Database`}
          </DialogTitle>
          <DialogDescription>
            {connectionData
              ? "Update your database connection details below"
              : "Enter your database connection details below"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {FormField.map((field) => {
            if (field.showOnlyOnUpdate && !connectionData) {
              return null;
            }

            return (
              <fieldset
                key={field.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              >
                <label
                  htmlFor={field.id}
                  className="text-[13px] font-medium text-gray-700 sm:w-[160px] sm:text-right"
                >
                  {field.label}
                </label>
                <div className="flex-1">
                  {field.type === "text" ? (
                    <input
                      type="text"
                      id={field.id}
                      placeholder={field.placeholder}
                      disabled={loading}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      {...form.register(field.id)}
                    />
                  ) : field.type === "textarea" ? (
                    <textarea
                      id={field.id}
                      placeholder={field.placeholder}
                      disabled={loading}
                      className="w-full min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      {...form.register(field.id)}
                    />
                  ) : field.type === "password" ? (
                    <input
                      type="password"
                      id={field.id}
                      placeholder={field.placeholder}
                      disabled={loading}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      {...form.register(field.id)}
                    />
                  ) : field.type === "select" ? (
                    <Select
                      value={form.watch("db_type")}
                      onValueChange={(value) => form.setValue("db_type", value)}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {DATABASES.map((db) => (
                          <SelectItem key={db.value} value={db.value}>
                            {db.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "switch" ? (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={field.id}
                        checked={form.watch("is_active")}
                        onCheckedChange={(checked) =>
                          form.setValue("is_active", checked)
                        }
                        disabled={loading}
                      />
                      <span className="text-sm text-gray-500">
                        {form.watch("is_active") ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ) : null}
                </div>
              </fieldset>
            );
          })}
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {connectionData ? "Update Connection" : "Create Connection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
