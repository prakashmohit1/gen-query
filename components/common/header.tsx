"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, User, Bot, Menu } from "lucide-react";
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
  const handleLogout = () => {
    console.log("Logging out...");
    deleteCookie("id_token");
    deleteCookie("refresh_token");
    signOut();
  };
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-100 via-purple-50 to-white border-b border-purple-200 shadow-sm">
        <div className="mx-auto px-4">
          <div className="flex items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                {/* Logo */}
                <div className="w-8 h-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg rotate-45 transform -translate-y-0.5 -translate-x-0.5 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg rotate-45 shadow-lg"></div>
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                    GQ
                  </span>
                </div>
                {/* Brand Name */}
                <span className="text-lg font-semibold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent">
                  Gen Query
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="ml-4 text-gray-500 hover:text-purple-600"
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
                  className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors cursor-pointer"
                >
                  <Bot
                    className={`w-5 h-5 text-purple-600 ${
                      isAIAgentOpen ? "" : "animate-pulse"
                    }`}
                  />
                </button>
              </div>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="h-8 w-8 hover:ring-2 hover:ring-purple-300 transition-all">
                    <AvatarImage src={session?.user?.image} />
                    <AvatarFallback className="bg-purple-200 text-purple-900">
                      {session?.user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white/95 backdrop-blur-sm border-purple-200 shadow-lg"
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-purple-900">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs text-purple-600/70 truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-purple-200/50" />
                  <DropdownMenuItem className="focus:bg-purple-50 focus:text-purple-900 text-purple-700 cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
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
