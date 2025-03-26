import { getCookie } from "@/lib/utils";

interface UpdateDescriptionPayload {
  description: string;
}

interface CreateTagPayload {
  key: string;
  value: string;
}

interface Tag {
  key: string;
  value: string;
}

interface TableResponse {
  id: string;
  name: string;
  description: string;
  tables: Array<{
    id: string;
    name: string;
    description: string;
    owner: string;
    created_at: string;
    columns: Array<{
      name: string;
      type: string;
      comment?: string;
    }>;
    tags: Tag[];
  }>;
}

class CatalogService {
  private baseUrl = "/api/v1/catalog";

  async updateDatabaseDescription(
    databaseId: string,
    payload: UpdateDescriptionPayload
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/databases/${databaseId}/description`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("id_token")}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update database description");
    }

    return response.json();
  }

  async createTag(
    databaseId: string,
    payload: CreateTagPayload
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/databases/${databaseId}/tags`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("id_token")}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create tag");
    }

    return response.json();
  }

  async getTags(databaseId: string): Promise<Tag[]> {
    const response = await fetch(
      `${this.baseUrl}/databases/${databaseId}/tags`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("id_token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get tags");
    }

    return response.json();
  }

  async deleteTag(databaseId: string, tagId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/databases/${databaseId}/tags/${tagId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("id_token")}`,
        },
      }
    );
    if (response.status === 200) return { message: "Tag deleted successfully" };
    return response.json();
  }

  async getTables(databaseId: string): Promise<TableResponse> {
    const response = await fetch(
      `${this.baseUrl}/databases/${databaseId}/tables/columns`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("id_token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get tables");
    }

    return response.json();
  }

  async updateTableDescription(
    tableId: string,
    payload: UpdateDescriptionPayload
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/tables/${tableId}/description`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("id_token")}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update table description");
    }

    return response.json();
  }

  async createTableTag(
    tableId: string,
    payload: CreateTagPayload
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tables/${tableId}/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to create table tag");
    }

    return response.json();
  }

  async getTableTags(tableId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tables/${tableId}/tags`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
    });
    return response.json();
  }

  async deleteTableTag(tableId: string, tagId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/tables/${tableId}/tags/${tagId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("id_token")}`,
        },
      }
    );
    if (response.status === 200) return { message: "Tag deleted successfully" };
    return response.json();
  }

  async getColumns(tableId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/tables/${tableId}/columns`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get columns");
    }

    return response.json();
  }

  async updateColumnDescription(
    columnId: string,
    payload: UpdateDescriptionPayload
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/columns/${columnId}/description`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("id_token")}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update column description");
    }

    return response.json();
  }

  async createColumnTag(
    columnId: string,
    payload: CreateTagPayload
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/columns/${columnId}/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to create column tag");
    }

    return response.json();
  }

  async getColumnTags(columnId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/columns/${columnId}/tags`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("id_token")}`,
      },
    });
    return response.json();
  }

  async deleteColumnTag(columnId: string, tagId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/columns/${columnId}/tags/${tagId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("id_token")}`,
        },
      }
    );
    if (response.status === 200) return { message: "Tag deleted successfully" };
    return response.json();
  }
}

export const catalogService = new CatalogService();
