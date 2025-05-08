"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  Users,
  Palette,
  Shield,
  Cpu,
  Code,
  Bell,
  Cog,
  User,
  Sliders,
  Terminal,
  Link2,
  BellRing,
} from "lucide-react";

const sidebarItems = [
  {
    title: "Team Settings",
    items: [
      { name: "Identity and access", href: "/settings/identity", icon: Users },
      { name: "Security", href: "/settings/security", icon: Shield },
      { name: "Billing", href: "/settings/billing", icon: Cpu },
      { name: "Integrations", href: "/settings/integrations", icon: Link2 },
      { name: "Notifications", href: "/settings/notifications", icon: Bell },
    ],
  },
  {
    title: "Personal Settings",
    items: [
      { name: "Profile", href: "/settings/profile", icon: User },
      { name: "Preferences", href: "/settings/preferences", icon: Sliders },
      { name: "Appearance", href: "/settings/appearance", icon: Palette },
    ],
  },
  {
    title: "Developer",
    items: [
      { name: "API Keys", href: "/settings/developer", icon: Terminal },
      { name: "Advanced", href: "/settings/advanced", icon: Cog },
    ],
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
          <nav className="mt-6 space-y-6">
            {sidebarItems.map((section) => (
              <div key={section.title}>
                <h2 className="text-sm font-medium text-gray-500 mb-2">
                  {section.title}
                </h2>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                            pathname === item.href
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto py-8 px-6">{children}</div>
      </div>
    </div>
  );
}
