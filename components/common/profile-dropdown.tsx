import * as React from "react";
import { DropdownMenu } from "radix-ui";
import { logout } from "@/lib/actions";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const ProfileDropdown = ({ session }: any) => {
  const { user = null } = session || {};
  const router = useRouter();

  const handleLogout = async () => {
    logout();
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="IconButton" aria-label="Customise options">
          <div className="w-7 h-7 flex items-center justify-center bg-primary-500 text-white rounded-full">
            {user?.name.slice(0, 1)}
          </div>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="DropdownMenuContent p-2 bg-white shadow-lg rounded-md"
          sideOffset={5}
        >
          <DropdownMenu.Item
            className="DropdownMenuItem text-gray-500  p-2"
            disabled
          >
            {user?.email}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="DropdownMenuSeparator" />
          <DropdownMenu.Item className="DropdownMenuItem p-2">
            {"Settings"}
          </DropdownMenu.Item>
          <DropdownMenu.Item className="DropdownMenuItem p-2" disabled>
            {"Privacy Policy"}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="DropdownMenuSeparator" />
          <DropdownMenu.Item className="DropdownMenuItem p-2" disabled>
            {"Send Feedback"}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="DropdownMenuSeparator" />
          <DropdownMenu.Item
            className="DropdownMenuItem p-2 cursor-pointer"
            onClick={handleLogout}
          >
            {"Logout"}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ProfileDropdown;
