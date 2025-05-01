import { NextResponse } from "next/server";
import { fetchFromApi } from "../common/service";

export async function GET(request: Request) {
  try {
    const response = await fetchFromApi("/sql-queries/", {
      method: "GET",
      headers: request.headers,
    });

    // Handle 204 No Content response
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    // Handle unauthorized access
    if (response.status === 401) {
      return NextResponse.json({ error: response.detail }, { status: 401 });
    }

    // Try to parse JSON for all other responses
    try {
      const data = await response.json();
      if (!response.ok) {
        return NextResponse.json(
          { error: data.detail || "An error occurred" },
          { status: response.status }
        );
      }
      return NextResponse.json(data);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      const text = await response.text();
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
