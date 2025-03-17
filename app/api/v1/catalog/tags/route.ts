import { NextRequest, NextResponse } from "next/server";
import { fetchFromApi } from "@/app/api/v1/common/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value, entity_type, entity_id } = body;

    // Validate request body
    if (!key || !value || !entity_type || !entity_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (
      typeof key !== "string" ||
      typeof value !== "string" ||
      typeof entity_type !== "string" ||
      typeof entity_id !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid field types" },
        { status: 400 }
      );
    }

    const response = await fetchFromApi("/catalog/tags", {
      method: "POST",
      body: JSON.stringify({ key, value, entity_type, entity_id }),
      headers: req.headers,
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
      return NextResponse.json(
        { error: "Invalid JSON response from server" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
