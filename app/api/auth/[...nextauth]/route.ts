import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { cookies } from "next/headers"; // ✅ Next.js cookie handler

async function refreshAccessToken(refreshToken: string) {
  const url = "https://oauth2.googleapis.com/token";
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const refreshedTokens = await response.json();
  if (!response.ok) {
    throw refreshedTokens;
  }

  return refreshedTokens;
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
    async jwt({ token, account, user }) {
      console.log("account", account);
      if (account) {
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.expiresAt = Math.floor(Date.now() / 1000) + account.expires_in; // Expiry Time
        token.user = {
          id: user.id || account.providerAccountId,
          name: user.name,
          email: user.email,
          image: user.image,
        };

        // Check if token is expired
        if (Date.now() > token.expiresAt) {
          console.log("Access Token Expired! Refreshing...");
          try {
            const refreshedTokens = await refreshAccessToken(
              token.refreshToken
            );
            return {
              ...token,
              accessToken: refreshedTokens.access_token,
              expiresAt: Date.now() + refreshedTokens.expires_in * 1000, // Refresh token expiry
              refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Keep old refresh_token if new one is not provided
            };
          } catch (error) {
            console.error("Error refreshing access token", error);
            return { ...token, error: "RefreshAccessTokenError" };
          }
        }

        // ✅ Store tokens in cookies
        cookies().set("id_token", token.idToken, {
          httpOnly: true, // ✅ Prevent XSS
          secure: process.env.NODE_ENV === "production", // ✅ Secure in production
          sameSite: "strict",
          path: "/",
          maxAge: account.expires_in, // Set to token expiry
        });
        cookies().set("refresh_token", token.refreshToken, {
          httpOnly: true, // ✅ Prevent XSS
          secure: process.env.NODE_ENV === "production", // ✅ Secure in production
          sameSite: "strict",
          path: "/",
          maxAge: account.expires_in, // Set to token expiry
        });
      }
      return token;
    },

    async session({ session, token }) {
      session.user = token.user;
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresAt = token.expiresAt;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
