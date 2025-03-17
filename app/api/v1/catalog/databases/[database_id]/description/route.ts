import { NextRequest, NextResponse } from "next/server";
import { fetchFromApi } from "@/app/api/v1/common/service";

export async function PUT(
  req: NextRequest,
  { params }: { params: { database_id: string } }
) {
  try {
    const body = await req.json();
    const { description } = body;

    if (typeof description !== "string") {
      return new NextResponse("Invalid description", { status: 400 });
    }

    const response = await fetchFromApi(
      `/catalog/databases/${params.database_id}/description`,
      {
        method: "PUT",
        body: JSON.stringify({ description }),
        headers: req.headers,
      }
    );

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
    console.error("Error updating database description:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
