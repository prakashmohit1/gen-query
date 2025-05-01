import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Get the current session
    const session = await getServerSession();

    console.log("Session:", session);
    const allCookies = cookies(); // get cookies from the request

    if (session) {
      // Clear the session
      const response = new NextResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });

      (await allCookies).getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, "", {
          expires: new Date(0),
          path: "/", // clear from root path
        });
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

      response.cookies.set("__Secure-next-auth.session-token", "", {
        path: "/",
        expires: new Date(0),
        secure: true,
        httpOnly: true,
        sameSite: "lax",
        domain: "yourdomain.com", // match exactly what was set
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
      response.cookies.set(cookie.name, "", {
        expires: new Date(0),
        path: "/", // clear from root path
      });
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
