"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Sidebar from "@/components/common/side-menu";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { logout } from "@/lib/actions";
import { signOut } from "next-auth/react";
import { cookies } from "next/headers";

export default function DashboardPage({ session }) {
  const { user = null } = session || {};
  console.log("session", session);

  const handleLogout = () => {
    logout();
    signOut();
  };

  return <Sidebar />;
  return (
    <div className="container py-10">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>You are logged in!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">User Information</h3>
              <img src={user?.image} alt="User profile" className="rounded" />
              <p className="text-sm text-muted-foreground">
                Email: {user?.email}
              </p>
              {user?.name && (
                <p className="text-sm text-muted-foreground">
                  Name: {user?.name}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
