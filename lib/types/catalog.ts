export type EntityType = "DATABASE" | "TABLE" | "COLUMN";

export interface Tag {
  key: string;
  value: string;
  entity_type: EntityType;
  entity_id: string;
}

export interface Database {
  id: string;
  name: string;
  description?: string;
  tables: Table[];
  tags: Tag[];
}

export interface Table {
  name: string;
  owner: string;
  created_at: string;
  popularity: number;
  description?: string;
  tags: Tag[];
}

export interface Column {
  name: string;
  type: string;
  description?: string;
  tags: Tag[];
}
