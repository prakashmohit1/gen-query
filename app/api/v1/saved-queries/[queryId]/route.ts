import { NextResponse } from "next/server";
import { fetchFromApi } from "../../common/service";

export async function GET(
  request: Request,
  { params }: { params: { queryId: string } }
) {
  try {
    const response = await fetchFromApi(`/saved-queries/${params.queryId}`, {
      method: "GET",
      headers: request.headers,
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

export async function PUT(
  request: Request,
  { params }: { params: { queryId: string } }
) {
  try {
    const body = await request.json();
    const { queryId } = (await params) || {};

    if (!queryId) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const response = await fetchFromApi(`/saved-queries/${queryId}`, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: request.headers,
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

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
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { queryId: string } }
) {
  try {
    const { queryId } = (await params) || {};

    if (!queryId) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const response = await fetchFromApi(`/saved-queries/${queryId}`, {
      method: "DELETE",
      headers: request.headers,
    });

    // Handle 204 No Content response
    if (response instanceof Response && response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    // If response is already JSON (from fetchFromApi)
    if (!(response instanceof Response)) {
      return NextResponse.json(response);
    }

    // Handle error responses
    if (!response.ok) {
      return NextResponse.json(
        { error: response || "Failed to delete query" },
        { status: response.status }
      );
    }

    // Try to parse JSON response if present
    try {
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      // If no content or invalid JSON, return success with 204
      return new NextResponse(null, { status: 204 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
