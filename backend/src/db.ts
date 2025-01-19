import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "my_project_db",
  password: "5963michael",
  port: 5432,
});
