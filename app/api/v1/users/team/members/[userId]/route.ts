import { NextResponse } from "next/server";
import { fetchFromApi } from "../../../../common/service";

export async function DELETE(
  request: Request,
  { params }: { params: { route: string; userId: string } }
) {
  try {
    const response = await fetchFromApi(
      `/users/team/members/${params.userId}`,
      {
        method: "DELETE",
        headers: request.headers,
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
