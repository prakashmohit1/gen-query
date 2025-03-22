import { NextRequest, NextResponse } from "next/server";
import { fetchFromApi } from "@/app/api/v1/common/service";

interface DatabaseConnection {
  name: string;
  description: string;
  db_type: string;
  host: string;
  port: number;
  username: string;
  default_database_name: string;
  connection_options: Record<string, any>;
  id: string;
  created_by_user_id: string;
  team_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  catalog_databases: Array<{
    id: string;
    name: string;
    description: string;
    team_id: string;
    database_server_connection_id: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by: string;
  }>;
}

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

export async function GET(
  req: NextRequest,
  { params }: { params: { database_id: string } }
) {
  try {
    const response = await fetchFromApi(
      `/catalog/databases/${params.database_id}`,
      {
        method: "GET",
        headers: req.headers,
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "An error occurred" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching database:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
