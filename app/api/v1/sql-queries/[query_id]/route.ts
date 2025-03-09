import { NextResponse } from "next/server";
import { fetchFromApi } from "../../common/service";

export async function DELETE(
  request: Request,
  { params }: { params: { query_id: string } }
) {
  try {
    const { query_id } = (await params) || {};

    if (!query_id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const response = await fetchFromApi(`/sql-queries/${query_id}`, {
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
        { error: "Failed to delete query" },
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
