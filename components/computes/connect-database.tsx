import * as React from "react";
import { Dialog } from "radix-ui";
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

const ConnectDatabase = ({ database }) => {
  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission

    const formData = new FormData(e.currentTarget); // Get form data
    const formValues: Record<string, string> = {}; // Store key-value pairs

    formData.forEach((value, key) => {
      formValues[key] = value.toString(); // Convert FormData values to strings
    });

    console.log("Form submitted with values:", formValues);
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="h-[30px] bg-black rounded text-white text-[13px] px-4">
          {`Connect ${database?.name} Database`}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-blackA6 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-gray1 p-[25px] shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow overflow-y-auto">
          <Dialog.Title className="m-0 text-[17px] font-medium text-black mb-4">
            {`Connect ${database?.name} Database`}
          </Dialog.Title>
          <form onSubmit={onFormSubmit}>
            {FormField.map((field) => (
              <fieldset
                key={field.id}
                className="mb-[15px] flex items-center gap-5"
              >
                <label
                  className="w-[160px] text-right text-[15px] text-black"
                  htmlFor={field.id}
                >
                  {field.label}
                </label>
                {field.type === "input" ? (
                  <input
                    className="inline-flex h-[28px] w-full items-center justify-center rounded px-2.5 text-[15px] leading-none outline-none border border-gray-300 bg-white"
                    id={field.id}
                    name={field.id} // 👈 Add name attribute
                    placeholder={field.placeholder}
                  />
                ) : field.type === "textarea" ? (
                  <textarea
                    className="inline-flex w-full items-center py-2 h-[100px] justify-center rounded px-2.5 text-[15px] leading-none text-black outline-none border border-gray-300 bg-white"
                    id={field.id}
                    name={field.id} // 👈 Add name attribute
                    placeholder={field.placeholder}
                  />
                ) : field.type === "password" ? (
                  <input
                    className="inline-flex h-[28px] w-full items-center justify-center rounded px-2.5 text-[15px] leading-none text-black outline-non border border-gray-300 bg-white"
                    id={field.id}
                    name={field.id} // 👈 Add name attribute
                    placeholder={field.placeholder}
                    type="password"
                  />
                ) : null}
              </fieldset>
            ))}
            <div className="mt-[25px] flex justify-end">
              <button
                type="submit"
                className="h-[30px] bg-black rounded text-white text-[13px] px-4"
              >
                Save changes
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConnectDatabase;
