"use client";

import { type ReactNode } from "react";
import Header from "@/components/common/header";
import Sidebar from "@/components/common/side-menu";
import AiAgent from "@/components/common/ai-agent";
import { useState, memo } from "react";

interface LayoutProps {
  children: ReactNode;
  session: any;
}

// Memoize the layout component to prevent unnecessary re-renders
const Layout = memo(function Layout({ children, session }: LayoutProps) {
  const [isAIAgentOpen, setIsAIAgentOpen] = useState(false);

  if (!session) {
    return children;
  }

  return (
    <div className="w-full h-screen">
      <Header
        session={session}
        isAIAgentOpen={isAIAgentOpen}
        setIsAIAgentOpen={setIsAIAgentOpen}
      />
      <div className={`flex h-[calc(100vh)]`}>
        <Sidebar />
        <div
          className={`w-full flex-1 bg-white rounded p-4 mt-[calc(64px)] ${
            isAIAgentOpen ? "mr-80" : ""
          } transition-all duration-[1000ms]`}
        >
          {children}
        </div>
        <AiAgent
          isOpen={isAIAgentOpen}
          onClose={() => setIsAIAgentOpen(false)}
        />
      </div>
    </div>
  );
});

export default Layout;
