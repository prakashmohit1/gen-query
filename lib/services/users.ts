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

class UsersServiceImpl {
  private baseUrl = "/api/v1/users";

  async getUsers(): Promise<User[]> {
    const response = await fetch(this.baseUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    return response.json();
  }

  async getTeamMembers(): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}/team/members`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch team members");
    }
    return response.json();
  }

  async deleteTeamMember(userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/team/members/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete team member: ${response.statusText}`);
    }
  }

  async updateTeamName(name: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/team`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update team name: ${response.statusText}`);
    }
  }

  async inviteUsers(emails: string[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
      body: JSON.stringify({ emails }),
    });

    if (!response.ok) {
      throw new Error(`Failed to invite users: ${response.statusText}`);
    }
  }

  async signupTeam(payload: TeamSignupPayload): Promise<void> {
    const response = await fetch(`${this.baseUrl}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to update team: ${response.statusText}`);
    }
  }

  async acceptInvite(payload: AcceptInvitePayload): Promise<void> {
    const response = await fetch(`${this.baseUrl}/accept-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to accept invite: ${response.statusText}`);
    }
  }

  async getTeam(): Promise<Team> {
    const response = await fetch(`${this.baseUrl}/team`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch team details");
    }
    return response.json();
  }
}

export const usersService = new UsersServiceImpl();
