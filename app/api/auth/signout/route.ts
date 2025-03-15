import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function POST() {
  try {
    // Get the current session
    const session = await getServerSession();

    if (session) {
      // Clear the session
      const response = new NextResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
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

      return response;
    }

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
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
