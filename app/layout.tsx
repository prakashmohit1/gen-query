import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import AuthProvider from "@/components/auth/session-provider";
import Layout from "@/components/common/layout";
import { SessionProvider } from "@/contexts/session-context";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  console.info(">>>> session", session);



  return (
    <html lang="en">
      <body className={`overflow-hidden ${inter.className}`}>
        <SessionProvider session={session}>
          <AuthProvider session={session}>
            {session ? (
              <div className="flex min-h-screen flex-col bg-white">
                <main className="flex-1 flex">
                  <Layout session={session} children={children} />
                </main>
              </div>
            ) : (
              children
            )}
          </AuthProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
