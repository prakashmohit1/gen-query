import { getCookie } from "../utils";

export interface User {
  id: string;
  email: string;
  name?: string;
  status: "active" | "pending";
  role?: string;
  team_id?: string;
  team_name?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  members_count: number;
}

export interface TeamSignupPayload {
  team_name: string;
  email?: string;
  name?: string;
}

export interface AcceptInvitePayload {
  name: string;
  token: string;
}

class AuthServiceImpl {
  private baseUrl = "/api/auth";

  async signout(): Promise<Team> {
    const response = await fetch(`${this.baseUrl}/signout`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch team details");
    }
    return response.json();
  }
}

export const authService = new AuthServiceImpl();
