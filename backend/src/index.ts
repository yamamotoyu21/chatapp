import express, { Request, Response } from "express";
import authRoutes from "./routes/auth";
import messageRoutes, { setSocketIo } from "./routes/message";
import http from "http";
import { socketAuthMiddleware } from "./middlewares/auth";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "./db";

import { Server } from "socket.io";

const app = express();
const port = process.env.PORT || 3001;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/message", messageRoutes);

// Socket.io 認証ミドルウェアを使用
io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  console.log(`User connected: ${(socket as any).user.email}`);

  // ユーザーがオンラインになったことを全員に通知
  io.emit("userStatus", {
    userId: (socket as any).user.userId,
    status: "online",
  });

  // メッセージ受信時のイベント
  socket.on("sendMessage", async (messageData) => {
    try {
      const { content } = messageData;
      const user = (socket as any).user;

      // データベースにメッセージを保存
      const result = await pool.query(
        "INSERT INTO messages (content, username, user_id) VALUES ($1, $2, $3) RETURNING *",
        [content, user.name || user.email, user.userId]
      );

      const newMessage = result.rows[0];

      // 全クライアントにメッセージをブロードキャスト
      io.emit("newMessage", newMessage);
    } catch (error) {
      console.error("Error handling message:", error);
      socket.emit("error", { message: "メッセージの送信に失敗しました" });
    }
  });

  // タイピング中のステータス通知
  socket.on("typing", () => {
    socket.broadcast.emit("userTyping", {
      userId: (socket as any).user.userId,
      username: (socket as any).user.name || (socket as any).user.email,
    });
  });

  // タイピング終了の通知
  socket.on("stopTyping", () => {
    socket.broadcast.emit("userStopTyping", {
      userId: (socket as any).user.userId,
    });
  });

  // 切断時のイベント
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${(socket as any).user.email}`);

    // ユーザーがオフラインになったことを全員に通知
    io.emit("userStatus", {
      userId: (socket as any).user.userId,
      status: "offline",
    });
  });
});

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

    // app.listenではなくserver.listenを使用
    server.listen(port, () => {
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
