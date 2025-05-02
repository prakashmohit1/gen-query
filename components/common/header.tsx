"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, User, Bot, Menu, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { deleteCookie } from "@/lib/utils";
import { Button } from "../ui/button";

const Header = ({
  session,
  isAIAgentOpen,
  setIsAIAgentOpen,
  isSideMenuCollapsed,
  setIsSideMenuCollapsed,
}: any) => {
  const router = useRouter();
  const handleLogout = async () => {
    deleteCookie("id_token");
    deleteCookie("refresh_token");
    await signOut({ redirect: false });
    window.location.href = "/";
  };
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-100 via-blue-50 to-white border-b border-blue-200 shadow-sm">
        <div className="mx-auto px-4">
          <div className="flex items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                {/* Logo */}
                <div className="w-8 h-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg rotate-45 transform -translate-y-0.5 -translate-x-0.5 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg rotate-45 shadow-lg"></div>
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                    GQ
                  </span>
                </div>
                {/* Brand Name */}
                <span className="text-lg font-semibold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                  Gen Query
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="ml-4 text-gray-500 hover:text-blue-600"
                onClick={() => setIsSideMenuCollapsed(!isSideMenuCollapsed)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* AI Agent Icon */}
              <div className="relative group">
                <button
                  onClick={() => setIsAIAgentOpen(!isAIAgentOpen)}
                  className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors cursor-pointer"
                >
                  <Bot
                    className={`w-5 h-5 text-blue-600 ${
                      isAIAgentOpen ? "" : "animate-pulse"
                    }`}
                  />
                </button>
              </div>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="h-8 w-8 hover:ring-2 hover:ring-blue-300 transition-all">
                    <AvatarImage src={session?.user?.image} />
                    <AvatarFallback className="bg-blue-200 text-blue-900">
                      {session?.user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white/95 backdrop-blur-sm border-blue-200 shadow-lg"
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-blue-900">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs text-blue-600/70 truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-blue-200/50" />
                  <DropdownMenuItem
                    onClick={() => router.push("/settings/profile")}
                    className="focus:bg-blue-50 focus:text-blue-900 text-blue-700 cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="focus:bg-red-50 focus:text-red-600 text-red-500 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
