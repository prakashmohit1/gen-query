"use client";

import { useState } from "react";
import { Menu, X, Home, Database, Calculator } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Router from "@/app/enums/router";

const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const SideMenus = [
    {
      id: 1,
      name: "Workplace",
      icon: Home,
      link: "/",
    },
    {
      id: 2,
      name: "DB Editor",
      icon: Database,
      link: "/db-editor",
    },
    {
      id: 3,
      name: "DB Computes",
      icon: Calculator,
      link: Router.COMPUTES,
    },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-48 bg-gradient-to-b from-purple-100 via-purple-50 to-white border-r border-purple-200 shadow-lg transition-transform transform pt-16 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative`}
      >
        <nav className="p-4">
          <ul className="space-y-2">
            {SideMenus.map((menu) => {
              const Icon = menu.icon;
              return (
                <li key={menu.id}>
                  <Link
                    href={menu.link}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group
                      ${
                        pathname === menu.link
                          ? "bg-purple-200/80 text-purple-900"
                          : "text-purple-700/70 hover:bg-purple-100 hover:text-purple-900"
                      }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        pathname === menu.link
                          ? "text-purple-900"
                          : "text-purple-600/70 group-hover:text-purple-900"
                      }`}
                    />
                    <span className="text-sm font-medium">{menu.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-purple-200 text-purple-900 hover:bg-purple-300 transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
