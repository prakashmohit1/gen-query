"use client";

import { useState } from "react";
import { Menu, X, Home, User, Settings } from "lucide-react";
import Link from "next/link";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 text-white w-48 p-5 transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative md:w-48`}
      >
        <nav>
          <ul className="space-y-4">
            <li>
              <Link
                href="/"
                className="flex items-center space-x-2 text-black text-xs"
              >
                <Home className="w-4 h-4" />
                <span>Workplace</span>
              </Link>
            </li>
            <li>
              <Link
                href="/profile"
                className="flex items-center space-x-2 text-black text-xs"
              >
                <User className="w-4 h-4" />
                <span>SQL Editor</span>
              </Link>
            </li>
            <li>
              <Link
                href="/settings"
                className="flex items-center space-x-2 text-black text-xs"
              >
                <Settings className="w-4 h-4" />
                <span>SQL Warehouses</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
