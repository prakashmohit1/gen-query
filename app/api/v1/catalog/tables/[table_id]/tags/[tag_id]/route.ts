import { NextRequest, NextResponse } from "next/server";
import { fetchFromApi } from "@/app/api/v1/common/service";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { table_id: string; tag_id: string } }
) {
  try {
    const response = await fetchFromApi(
      `/catalog/tables/${params.table_id}/tags/${params.tag_id}`,
      {
        method: "DELETE",
        headers: req.headers,
      }
    );

    return new NextResponse(response.body);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
