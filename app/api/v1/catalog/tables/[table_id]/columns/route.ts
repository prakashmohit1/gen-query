import { NextRequest, NextResponse } from "next/server";
import { fetchFromApi } from "@/app/api/v1/common/service";

export async function GET(
  req: NextRequest,
  { params }: { params: { table_id: string } }
) {
  try {
    const response = await fetchFromApi(
      `/catalog/tables/${params.table_id}/columns`,
      {
        method: "GET",
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
