import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL =
  "https://gen-query-backend-bag7czgnecb2gub9.centralindia-01.azurewebsites.net/api/v1";

interface RefreshedTokens {
  id_token: string;
  expires_in: number;
  refresh_token?: string;
}

async function refreshIdToken(refreshToken: string): Promise<RefreshedTokens> {
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

  console.log("Response from refreshIdToken:", response);

  const refreshedTokens = await response.json();

  console.log("Response from refreshedTokens:", refreshedTokens);
  if (!response.ok) {
    throw refreshedTokens;
  }

  return refreshedTokens;
}

let retryCount = 0;
export async function fetchFromApi(path: string, init?: RequestInit) {
  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token");
  const headers = new Headers(init?.headers);
  headers.delete("content-length");
  const refreshToken = cookieStore.get("refresh_token")?.value ?? "";

  if (!refreshToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!idToken?.value) {
    const refreshedTokens = await refreshIdToken(refreshToken);
    headers.set("Authorization", `Bearer ${refreshedTokens.id_token}`);

    cookieStore.set("id_token", refreshedTokens.id_token, {
      path: "/",
      maxAge: refreshedTokens.expires_in,
    });

    if (refreshedTokens.refresh_token) {
      cookieStore.set("refresh_token", refreshedTokens.refresh_token, {
        path: "/",
        maxAge: refreshedTokens.expires_in,
      });
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    try {
      const refreshedTokens = await refreshIdToken(
        cookieStore.get("refresh_token")?.value ?? ""
      );

      cookieStore.set("id_token", refreshedTokens.id_token, {
        path: "/",
        maxAge: refreshedTokens.expires_in,
      });

      if (refreshedTokens.refresh_token) {
        cookieStore.set("refresh_token", refreshedTokens.refresh_token, {
          path: "/",
          maxAge: refreshedTokens.expires_in,
        });
      }
      if (retryCount < 3) {
        retryCount++;
        return fetchFromApi(path, init);
      }

      const data = await response.json();
      data.status = response.status;
      return data;
    } catch (error) {
      console.error("Error refreshing access token", error);
      return { error: "RefreshAccessTokenError" };
    }
  }

  return response;
}
