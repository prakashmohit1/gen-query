"use client";

import { useState } from "react";
import { Menu, X, Home, User, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Router from "@/app/enums/router";

const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  console.log("router", pathname);

  const SideMenus = [
    {
      id: 1,
      name: "Workplace",
      icon: "Home",
      link: "/",
    },
    {
      id: 2,
      name: "DB Editor",
      icon: "User",
      link: "/db-editor",
    },
    {
      id: 3,
      name: "DB Computes",
      icon: "Settings",
      link: Router.COMPUTES,
    },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 text-white w-48 p-2 transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative md:w-48`}
      >
        <nav>
          <ul className="space-y-4">
            {SideMenus.map((menu) => (
              <li key={menu.id}>
                <Link
                  href={menu.link}
                  className={`flex items-center space-x-2 text-black text-xs px-3 py-2 ${
                    pathname === menu.link ? "bg-gray-300 rounded" : ""
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>{menu.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
