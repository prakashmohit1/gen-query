import { NextResponse } from "next/server";
import { fetchFromApi } from "../../common/service";

export async function PUT(
  request: Request,
  { params }: { params: { conversation_id: string } }
) {
  try {
    const body = await request.json();
    const response = await fetchFromApi(
      `/chat-conversations/${params.conversation_id}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
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

export async function DELETE(
  request: Request,
  { params }: { params: { conversation_id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!params.conversation_id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const response = await fetchFromApi(
      `/chat-conversations/${params.conversation_id}`,
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
