import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://gen-query-ai.onrender.com/api/v1";

async function fetchFromApi(path: string, init?: RequestInit) {
  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token");

  if (!idToken?.value) {
    throw new Error("No authentication token found");
  }

  const headers = new Headers(init?.headers);
  console.log("headers11", headers.get("Authorization"));
  headers.set("Content-Type", "application/json");
  // headers.set("Authorization", `Bearer ${headers.values}`);

  console.log("Request headers:", Object.fromEntries(headers.entries()));

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  // Log response status and headers for debugging
  console.log("Response status:", response.status);
  console.log(
    "Response headers:",
    Object.fromEntries(response.headers.entries())
  );

  return response;
}

export async function GET(request: Request) {
  try {
    const response = await fetchFromApi("/database-connections", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${request.headers.get("Authorization")}`,
      },
    });

    // Handle 204 No Content response
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    // Handle unauthorized access
    if (response.status === 401) {
      return NextResponse.json(
        { error: "Unauthorized access. Please login again." },
        { status: 401 }
      );
    }

    // Try to parse JSON for all other responses
    try {
      const data = await response.json();
      if (!response.ok) {
        return NextResponse.json(
          { error: data.message || "An error occurred" },
          { status: response.status }
        );
      }
      return NextResponse.json(data);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      const text = await response.text();
      console.log("Raw response:", text);
      return NextResponse.json(
        { error: "Invalid JSON response from server" },
        { status: 500 }
      );
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "No authentication token found"
    ) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetchFromApi("/database-connections", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${request.headers.get("Authorization")}`,
      },
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    try {
      const data = await response.json();
      if (!response.ok) {
        return NextResponse.json(
          { error: data.message || "An error occurred" },
          { status: response.status }
        );
      }
      return NextResponse.json(data);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      const text = await response.text();
      console.log("Raw response:", text);
      return NextResponse.json(
        { error: "Invalid JSON response from server" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const response = await fetchFromApi(`/database-connections/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${request.headers.get("Authorization")}`,
      },
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    try {
      const data = await response.json();
      if (!response.ok) {
        return NextResponse.json(
          { error: data.message || "An error occurred" },
          { status: response.status }
        );
      }
      return NextResponse.json(data);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      const text = await response.text();
      console.log("Raw response:", text);
      return NextResponse.json(
        { error: "Invalid JSON response from server" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const response = await fetchFromApi(`/database-connections/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${request.headers.get("Authorization")}`,
      },
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    try {
      const data = await response.json();
      if (!response.ok) {
        return NextResponse.json(
          { error: data.message || "An error occurred" },
          { status: response.status }
        );
      }
      return NextResponse.json(data);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      const text = await response.text();
      console.log("Raw response:", text);
      return NextResponse.json(
        { error: "Invalid JSON response from server" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
