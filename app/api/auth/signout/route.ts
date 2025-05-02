import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Get the current session
    const session = await getServerSession();

    console.log("Session:", session);
    const allCookies = cookies(); // get cookies from the request

    const cookieOptions = {
      path: "/",
      expires: new Date(0),
      secure: true,
      httpOnly: true,
      sameSite: "lax",
      domain: "gen-query.vercel.app", // match exactly what was set
    };

    const cookiesToClear = [
      "__Secure-next-auth.state",
      "__Secure-next-auth.session-token",
      "__Secure-next-auth.pkce.code_verifier",
      "__Secure-next-auth.callback-url",
      "__Host-next-auth.csrf-token",
    ];

    if (session) {
      // Clear the session
      const response = new NextResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });

      (await allCookies).getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, "", cookieOptions);
      });

      cookiesToClear.forEach((name) => {
        response.cookies.set(name, "", cookieOptions);
      });

      // Clear the session cookie
      response.cookies.set("next-auth.session-token", "", {
        expires: new Date(0),
        path: "/",
      });

      // Clear the CSRF token cookie if it exists
      response.cookies.set("next-auth.csrf-token", "", {
        expires: new Date(0),
        path: "/",
      });

      response.cookies.set("next-auth.callback-url", "", {
        expires: new Date(0),
        path: "/",
      });

      response.cookies.set("__next_hmr_refresh_hash__", "", {
        expires: new Date(0),
        path: "/",
      });

      return response;
    }

    const response = new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
    (await allCookies).getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, "", cookieOptions);
    });

    cookiesToClear.forEach((name) => {
      response.cookies.set(name, "", cookieOptions);
    });
    return response;
  } catch (error) {
    console.error("Error signing out:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to sign out" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
