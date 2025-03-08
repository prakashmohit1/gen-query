import NextAuth, { DefaultSession, Account, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { cookies } from "next/headers"; // ✅ Next.js cookie handler

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
  };
}

interface ExtendedSession extends DefaultSession {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
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
    }) {
      if (account && user) {
        token.refreshToken = account.refresh_token as string;
        token.idToken = account.id_token as string;
        token.expiresAt =
          Math.floor(Date.now() / 1000) + (account.expires_in as number);
        token.user = {
          id: user.id || account.providerAccountId,
          name: user.name,
          email: user.email,
          image: user.image,
        };

        // ✅ Store tokens in cookies
        const cookieStore = await cookies();
        cookieStore.set("id_token", token.idToken, {
          path: "/",
          maxAge: account.expires_in as number, // Set to token expiry
        });
        cookieStore.set("refresh_token", token.refreshToken, {
          path: "/",
          maxAge: account.expires_in as number, // Set to token expiry
        });
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
      if (token.user) {
        session.user = token.user;
        session.refreshToken = token.refreshToken;
        session.expiresAt = token.expiresAt;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
