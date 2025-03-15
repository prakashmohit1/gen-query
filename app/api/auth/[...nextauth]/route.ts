import NextAuth, { DefaultSession, Account, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { cookies } from "next/headers"; // ✅ Next.js cookie handler
import { fetchFromApi } from "../../v1/common/service";
import { signOut } from "next-auth/react";

interface ExtendedToken extends JWT {
  refreshToken?: string;
  idToken?: string;
  expiresAt?: number;
  accessToken?: string;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    team_name?: string | null;
    team_id?: string | null;
    role?: string | null;
  };
}

interface ExtendedSession extends DefaultSession {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  team_name?: string | null;
  team_id?: string | null;
  role?: string | null;
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        url: "https://accounts.google.com/o/oauth2/auth",
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
          access_type: "offline", // 👈 Important to get a refresh token
          prompt: "consent", // 👈 Ensures we always get a refresh token
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({
      token,
      account,
      user,
    }: {
      token: ExtendedToken;
      account: Account | null;
      user: User | null;
    }): Promise<JWT> {
      if (account && user) {
        try {
          // Only set tokens if signup was successful
          const newToken: ExtendedToken = {
            ...token,
            refreshToken: account.refresh_token as string,
            idToken: account.id_token as string,
            expiresAt:
              Math.floor(Date.now() / 1000) + (account.expires_in as number),
            user: {
              id: user.id || account.providerAccountId,
              name: user.name,
              email: user.email,
              image: user.image,
            },
          };
          const cookieStore = await cookies();
          cookieStore.set("id_token", newToken.idToken as string, {
            path: "/",
            maxAge: account.expires_in as number, // Set to token expiry
          });
          cookieStore.set("refresh_token", newToken.refreshToken as string, {
            path: "/",
            maxAge: account.expires_in as number, // Set to token expiry
          });

          const response = await fetchFromApi("/users/team", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${account.id_token}`,
            },
          });

          try {
            const data = await response.json();
            if (data.id) {
              console.log("data", data, newToken.user);
              if (newToken.user) {
                newToken.user.team_name = data.name || null;
                newToken.user.team_id = data.id || null;
              }
            } else {
              throw new Error("Team not found");
            }
          } catch (error) {
            // Try to sign up the user with their Google info
            const response = await fetchFromApi("/users/signup", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${account.id_token}`,
              },
              body: JSON.stringify({
                team_name: "My Organization", // Default team name
              }),
            });
            if (response.status === 200) {
              const data = await response.json();
              if (data.id) {
                if (newToken.user) {
                  newToken.user.team_name = data.team_name;
                  newToken.user.team_id = data.team_id;
                  newToken.user.role = data.role;
                }
              }
            }
            if (response.status !== 209) {
              throw new Error("Team signup failed");
            }
          }

          console.log("newToken", newToken);
          return newToken;
        } catch (error) {
          console.error("Team signup failed:", error);
          throw error; // This will prevent the session from being created
        }
      }
      return token;
    },

    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: ExtendedToken;
    }) {
      if (token?.user) {
        session.user = token.user;
        session.refreshToken = token.refreshToken;
        session.expiresAt = token.expiresAt;
        session.team_name = token.user.team_name;
        session.team_id = token.user.team_id;
        session.role = token.user.role;
      }
      console.log("session", session);
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
