export interface DatabaseConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  database: string;
  db_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTable {
  name: string;
  schema: string;
  columns: DatabaseColumn[];
}

export interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  defaultValue?: string;
}

export interface SQLQueryResult {
  rows: any[];
  fields: {
    name: string;
    type: string;
  }[];
  rowCount: number;
  command: string;
}
