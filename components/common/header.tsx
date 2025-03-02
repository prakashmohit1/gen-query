"use client";

import { useState } from "react";
import Link from "next/link";
import { DropdownMenu } from "radix-ui";
import ProfileDropdown from "./profile-dropdown";

const Header = ({ session }: any) => {
  return (
    <header className="flex items-center justify-between p-2 w-full">
      <h3>Gen Query</h3>
      <ProfileDropdown session={session} />
    </header>
  );
};

export default Header;
