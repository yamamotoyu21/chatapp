import express, { Request, Response } from "express";
import authRoutes from "./routes/auth";
import messageRoutes from "./routes/message";

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
app.use("/message", messageRoutes);

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

initDB();
