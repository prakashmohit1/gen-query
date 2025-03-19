import { NextResponse } from "next/server";
import { fetchFromApi } from "../../common/service";

export async function GET() {
  try {
    const response = await fetchFromApi("/api/users/team");
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch team details" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
