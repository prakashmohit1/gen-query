import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Upload, Sparkles } from "lucide-react";
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

// Data sources configuration
const DATA_SOURCES = [
  {
    id: 1,
    name: "PostgreSQL",
    value: "postgresql",
    icon: "🐘",
  },
  {
    id: 2,
    name: "MySQL",
    value: "mysql",
    icon: "🐬",
  },
  {
    id: 3,
    name: "Google BigQuery",
    value: "bigquery",
    icon: "📊",
  },
  {
    id: 4,
    name: "Microsoft SQL Server",
    value: "mssql",
    icon: "💾",
  },
  {
    id: 5,
    name: "Oracle Database",
    value: "oracle",
    icon: "🔲",
  },
  {
    id: 6,
    name: "MongoDB",
    value: "mongodb",
    icon: "🍃",
  },
  {
    id: 7,
    name: "MariaDB",
    value: "mariadb",
    icon: "🐋",
  },
  {
    id: 8,
    name: "Snowflake",
    value: "snowflake",
    icon: "❄️",
  },
  {
    id: 9,
    name: "Amazon Athena",
    value: "athena",
    icon: "📈",
  },
  {
    id: 10,
    name: "Redshift",
    value: "redshift",
    icon: "🔴",
  },
];

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

type FormData = {
  name: string;
  description: string;
  db_type: string;
  host: string;
  port: string;
  username: string;
  default_database_name: string;
  connection_options: Record<string, any>;
  password: string;
  is_active?: boolean;
};

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
    placeholder: "Enter description",
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
    id: "default_database_name",
    label: "Default Database Name",
    type: "text",
    placeholder: "Enter default database name",
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

export default function ConnectDatabase({
  database,
  connectionData,
  isOpen,
  onSuccess,
  onClose,
}: ConnectDatabaseProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<
    (typeof DATA_SOURCES)[0] | null
  >(null);
  const [step, setStep] = useState<"select" | "connect">(
    connectionData ? "connect" : "select"
  );
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonDb, setComingSoonDb] = useState<
    (typeof DATA_SOURCES)[0] | null
  >(null);

  const form = useForm<FormData>({
    defaultValues: {
      name: connectionData?.name || "",
      description: connectionData?.description || "",
      host: connectionData?.host || "",
      port: connectionData?.port?.toString() || "",
      username: connectionData?.username || "",
      password: connectionData?.password || "",
      default_database_name: connectionData?.database_name || "",
      db_type: connectionData?.db_type || selectedDataSource?.value || "",
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
        default_database_name: connectionData.database_name,
        db_type: connectionData.db_type.toLowerCase(),
        connection_options: connectionData.connection_options || {},
        is_active: connectionData.is_active,
      });
      setOpen(true);
      setStep("connect");
    }
  }, [connectionData, form]);

  useEffect(() => {
    if (isOpen) {
      setOpen(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!open) {
      setStep("select");
      setSelectedDataSource(null);
      onClose?.();
    }
  }, [open, onClose]);

  const handleDataSourceSelect = (source: (typeof DATA_SOURCES)[0]) => {
    if (source.value !== "postgresql" && source.value !== "mysql") {
      setComingSoonDb(source);
      setShowComingSoon(true);
      return;
    }
    setSelectedDataSource(source);
    form.setValue("db_type", source.value);
    setStep("connect");
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const payload = {
        name: data.name,
        description: data.description,
        db_type: data.db_type || selectedDataSource?.value || "",
        host: data.host,
        port: parseInt(data.port),
        username: data.username,
        default_database_name: data.default_database_name,
        connection_options: data.connection_options,
        password: data.password,
      };

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
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {step === "select" && !connectionData ? (
            <>
              <DialogHeader>
                <DialogTitle>Select the type of data source</DialogTitle>
                <DialogDescription>
                  Set up a new data source to connect to DataLab.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                {DATA_SOURCES.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => handleDataSourceSelect(source)}
                    className={`flex items-center gap-3 p-4 text-left rounded-lg border transition-colors relative ${
                      source.value === "postgresql" || source.value === "mysql"
                        ? "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                        : "border-gray-100 bg-gray-50 cursor-not-allowed"
                    }`}
                  >
                    <span className="text-2xl">{source.icon}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{source.name}</span>
                      {source.value !== "postgresql" &&
                        source.value !== "mysql" && (
                          <span className="text-[11px] text-gray-500">
                            Coming Soon
                          </span>
                        )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 border-t pt-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="p-3 bg-white rounded-full">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Upload a file</h3>
                    <p className="text-sm text-gray-500">
                      Drag and drop your CSV, TXT, or XLSX files here
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>
                  {connectionData
                    ? `Update ${connectionData?.db_type} Database Connection`
                    : `Connect to ${selectedDataSource?.name}`}
                </DialogTitle>
                <DialogDescription>
                  {connectionData
                    ? "Update your database connection details below"
                    : "Enter your database connection details below"}
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
                            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            {...form.register(field.id)}
                          />
                        ) : field.type === "textarea" ? (
                          <textarea
                            id={field.id}
                            placeholder={field.placeholder}
                            disabled={loading}
                            className="w-full min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            {...form.register(field.id)}
                          />
                        ) : field.type === "password" ? (
                          <input
                            type="password"
                            id={field.id}
                            placeholder={field.placeholder}
                            disabled={loading}
                            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            {...form.register(field.id)}
                          />
                        ) : field.type === "select" ? (
                          <Select
                            value={form.watch("db_type")}
                            onValueChange={(value) =>
                              form.setValue("db_type", value)
                            }
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
                  {!connectionData && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("select")}
                      className="mr-auto"
                    >
                      Back to Data Sources
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {connectionData ? "Update Connection" : "Create Connection"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <Sparkles className="h-5 w-5" />
              Coming Soon!
            </DialogTitle>
            <DialogDescription className="pt-4">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="text-4xl mb-2">{comingSoonDb?.icon}</div>
                <h3 className="text-lg font-semibold text-gray-700">
                  {comingSoonDb?.name} Integration
                </h3>
                <p className="text-gray-500">
                  We're working hard to bring {comingSoonDb?.name} integration
                  to DataLab. Stay tuned for updates!
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowComingSoon(false)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
