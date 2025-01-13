import express, { Request, Response } from "express";
import { Pool } from "pg";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3001;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "my_project_db",
  password: "5963michael",
  port: 5432,
});

app.use(cors());
app.use(express.json());
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        username VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_content 
      ON messages USING gin(to_tsvector('english', content))
    `);

    console.log(`Database initialized successfully`);
  } catch (e) {
    console.log(`Error initializing database`, e);
  }
}

initDB();

app.post("/api/messages", async (req: Request, res: Response) => {
  const { content, username } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO messages (content, username) VALUES ($1, $2) RETURNING *`,
      [content, username] // クエリ文字列とパラメータ配列をカンマで区切る
    );
    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error sending message" });
  }
});

// メッセージ取得エンドポイント
app.get("/api/messages", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM messages ORDER BY created_at DESC LIMIT 50"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
});

// メッセージ検索エンドポイント
app.get("/api/messages/search", async (req, res) => {
  const { query } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE to_tsvector('english', content) @@ plainto_tsquery('english', $1)
       ORDER BY created_at DESC`,
      [query]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error searching messages" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
