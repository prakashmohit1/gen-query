import * as React from "react";
import { Dialog } from "radix-ui";
import { Loader2 } from "lucide-react";
import { databaseService } from "@/lib/services/database.service";

interface Database {
  id: number;
  name: string;
  value: string;
  icon: string;
}

interface ConnectDatabaseProps {
  database: Database | undefined;
  onSuccess?: () => void;
}

const FormField = [
  {
    label: "Name",
    placeholder: "Enter compute name",
    id: "name",
    type: "input",
  },
  {
    label: "Description",
    placeholder: "Enter database description",
    id: "description",
    type: "textarea",
  },
  {
    label: "Host",
    placeholder: "Enter host",
    id: "host",
    type: "input",
  },
  {
    label: "Port",
    placeholder: "Enter port",
    id: "port",
    type: "input",
  },
  {
    label: "Username",
    placeholder: "Enter username",
    id: "username",
    type: "input",
  },
  {
    label: "Password",
    placeholder: "Enter password",
    id: "password",
    type: "password",
  },
  {
    label: "Database Name",
    placeholder: "Enter database name",
    id: "databaseName",
    type: "input",
  },
];

const ConnectDatabase = ({ database, onSuccess }: ConnectDatabaseProps) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const payload = {
        name: formData.get("name")?.toString() || "",
        description: formData.get("description")?.toString() || "",
        db_type: database?.value || "",
        host: formData.get("host")?.toString() || "",
        port: parseInt(formData.get("port")?.toString() || "0", 10),
        username: formData.get("username")?.toString() || "",
        password: formData.get("password")?.toString() || "",
        database_name: formData.get("databaseName")?.toString() || "",
        connection_options: {},
      };

      await databaseService.createDatabaseConnection(payload);
      setIsOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create database connection"
      );
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button className="h-[30px] bg-purple-600 hover:bg-purple-700 rounded text-white text-[13px] px-4 transition-colors">
          {`Connect ${database?.name} Database`}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-[25px] shadow-lg focus:outline-none data-[state=open]:animate-contentShow overflow-y-auto">
          <Dialog.Title className="m-0 text-[17px] font-medium text-purple-900 mb-4">
            {`Connect ${database?.name} Database`}
          </Dialog.Title>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
              {error}
            </div>
          )}
          <form onSubmit={onFormSubmit}>
            {FormField.map((field) => (
              <fieldset
                key={field.id}
                className="mb-[15px] flex items-center gap-5"
              >
                <label
                  className="w-[160px] text-right text-[15px] text-gray-700"
                  htmlFor={field.id}
                >
                  {field.label}
                </label>
                {field.type === "input" ? (
                  <input
                    className="inline-flex h-[35px] w-full items-center justify-center rounded px-2.5 text-[15px] leading-none outline-none border border-gray-200 bg-white focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                    id={field.id}
                    name={field.id}
                    placeholder={field.placeholder}
                    disabled={isLoading}
                    required
                  />
                ) : field.type === "textarea" ? (
                  <textarea
                    className="inline-flex w-full items-center py-2 h-[100px] justify-center rounded px-2.5 text-[15px] leading-none text-gray-900 outline-none border border-gray-200 bg-white focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                    id={field.id}
                    name={field.id}
                    placeholder={field.placeholder}
                    disabled={isLoading}
                  />
                ) : field.type === "password" ? (
                  <input
                    className="inline-flex h-[35px] w-full items-center justify-center rounded px-2.5 text-[15px] leading-none text-gray-900 outline-none border border-gray-200 bg-white focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                    id={field.id}
                    name={field.id}
                    placeholder={field.placeholder}
                    type="password"
                    disabled={isLoading}
                    required
                  />
                ) : null}
              </fieldset>
            ))}
            <div className="mt-[25px] flex justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="h-[35px] border border-gray-200 hover:bg-gray-50 rounded text-gray-700 text-[13px] px-4 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="h-[35px] bg-purple-600 hover:bg-purple-700 rounded text-white text-[13px] px-4 transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConnectDatabase;
