"use client";

import { use, useEffect, type ReactNode } from "react";
import Header from "@/components/common/header";
import { SideMenu } from "@/components/common/side-menu";
import AiAgent from "@/components/common/ai-agent";
import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { DatabaseProvider } from "@/contexts/database-context";
import { usePathname } from "next/navigation";
import Router from "@/app/enums/router";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

interface LayoutProps {
  children: ReactNode;
  session: any;
}

// Memoize the layout component to prevent unnecessary re-renders
const Layout = memo(function Layout({ children, session }: LayoutProps) {
  const pathname = usePathname();
  const [isAIAgentOpen, setIsAIAgentOpen] = useState(false);
  const [isSideMenuCollapsed, setIsSideMenuCollapsed] = useState(false);

  if (!session) {
    return children;
  }

  useEffect(() => {
    setIsAIAgentOpen(pathname === Router.DB__EDITOR);
  }, [pathname]);

  return (
    <DatabaseProvider>
      <div className="w-full h-screen bg-primary-50">
        <Header
          session={session}
          isAIAgentOpen={isAIAgentOpen}
          setIsAIAgentOpen={setIsAIAgentOpen}
          isSideMenuCollapsed={isSideMenuCollapsed}
          setIsSideMenuCollapsed={setIsSideMenuCollapsed}
        />
        <div className={`flex h-[calc(100vh)]`}>
          <SideMenu isCollapsed={isSideMenuCollapsed} />
          <div
            className={cn(
              `${isAIAgentOpen ? "w-[calc(100%-25rem)]" : "w-[100%]"}`,

              "transition-all duration-300 pr-[2px]"
            )}
          >
            <div className="h-full rounded-lg border border-primary-500 bg-white">
              {children}
            </div>
          </div>
          <AiAgent
            isOpen={isAIAgentOpen}
            onClose={() => setIsAIAgentOpen(false)}
          />
        </div>
      </div>
    </DatabaseProvider>
  );
});

export default Layout;
