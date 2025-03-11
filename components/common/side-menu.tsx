"use client";

import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Menu, Database, Code, History, Blocks } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Catalog",
    href: "/catalog",
    icon: Blocks,
  },
  {
    title: "Databases",
    href: "/computes",
    icon: Database,
  },
  {
    title: "DB Editor",
    href: "/db-editor",
    icon: Code,
  },
  {
    title: "Query History",
    href: "/query-history",
    icon: History,
  },
];

interface SideMenuProps {
  isCollapsed: boolean;
}

export function SideMenu({ isCollapsed }: SideMenuProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Menu */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-40 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </DrawerTrigger>
        <DrawerContent side="left" className="p-0 w-[200px]">
          <DrawerHeader className="border-b px-4 py-4">
            <DrawerTitle>Menu</DrawerTitle>
          </DrawerHeader>
          <nav className="flex flex-col p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-blue-50 text-blue-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </DrawerContent>
      </Drawer>

      {/* Desktop Menu */}
      <div
        className={cn(
          "hidden md:flex flex-col border-r bg-white transition-all duration-300",
          isCollapsed ? "w-[70px]" : "w-[200px]"
        )}
      >
        <div className="border-b px-4 py-4">
          <h2
            className={cn(
              "text-lg font-semibold transition-opacity",
              isCollapsed && "opacity-0"
            )}
          >
            Menu
          </h2>
        </div>
        <nav className="flex flex-col p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === item.href
                    ? "bg-blue-50 text-blue-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0 mr-2" />
                <span
                  className={cn(
                    "transition-all duration-300",
                    isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                  )}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
