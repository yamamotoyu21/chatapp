import express, { Request, Response } from "express";
import authRoutes from "./routes/auth";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "./db";

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // これを追加
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json()); // リクエストボディを解析するためのミドルウェア
app.use("/auth", authRoutes); // "/auth" でルートを登録

async function initDB() {
  try {
    // 既存のusersテーブルを削除
    await pool.query(`DROP TABLE IF EXISTS users;`);

    // 正しい構造でusersテーブルを再作成
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Users table recreated successfully");

    // テーブル構造の確認
    const result = await pool.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    await checkTableStructure();
    console.log("New Users table structure:");
    console.table(result.rows);

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (e) {
    console.error("Error recreating table:", e);
  }
}

async function checkTableStructure() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log("Users table structure:");
    console.table(result.rows);
    console.log(`Database initialized successfully`);
  } catch (e) {
    console.error("Error checking table structure:", e);
  }
}

// async function initDB() {
//   try {
//     // メッセージテーブルの作成
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS messages (
//         id SERIAL PRIMARY KEY,
//         content TEXT NOT NULL,
//         username VARCHAR(100) NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     await pool.query(`
//       CREATE INDEX IF NOT EXISTS idx_messages_content
//       ON messages USING gin(to_tsvector('english', content))
//     `);

//     // ユーザーテーブルの作成
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS users (
//         id SERIAL PRIMARY KEY,
//         email VARCHAR(255) UNIQUE NOT NULL,
//         password VARCHAR(255) NOT NULL,
//         username VARCHAR(100) UNIQUE NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     app.listen(port, () => {
//       console.log(`Server is running on http://localhost:${port}`);
//     });
//     console.log(`Database initialized successfully`);
//   } catch (e) {
//     console.log(`Error initializing database`, e);
//   }
// }

initDB();
