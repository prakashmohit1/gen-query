import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import AuthProvider from "@/components/auth/session-provider";
import Header from "@/components/common/header";
import Sidebar from "@/components/common/side-menu";
import { redirect } from "next/navigation";
import LoginPage from "./login/page";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col bg-gray-200">
          <main className="flex-1 flex">
            <AuthProvider session={session}>
              {session ? (
                <div className="w-full h-screen">
                  <Header session={session} />
                  <div className="flex h-[calc(100vh-48px)] flex-1">
                    <Sidebar />
                    {children}
                  </div>
                </div>
              ) : (
                <LoginPage />
              )}
            </AuthProvider>
          </main>
        </div>
      </body>
    </html>
  );
}
