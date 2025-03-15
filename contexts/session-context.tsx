"use client";

import React, { createContext, useContext } from "react";

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  team_name?: string | null;
  team_id?: string | null;
  role?: string | null;
}

interface ExtendedSession {
  user?: SessionUser;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  team_name?: string | null;
  team_id?: string | null;
  role?: string | null;
}

interface SessionContextType {
  session: ExtendedSession | null;
}

const SessionContext = createContext<SessionContextType>({
  session: null,
});

export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: ExtendedSession | null;
}) {
  return (
    <SessionContext.Provider
      value={{
        session,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
