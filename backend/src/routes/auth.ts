import express, { Request, Response } from "express";
import { UserModel } from "../models/user";
import jwt from "jsonwebtoken";
import { pool } from "../db";

const router = express.Router();

// ユーザー登録エンドポイント
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "全ての項目を入力してください" });
    return;
  }

  try {
    const user = await UserModel.register(name, email, password);
    if (!user) {
      res.status(400).json({ message: "ユーザー登録に失敗しました" });
      return;
    }

    res.status(201).json({ message: "ユーザー登録が完了しました" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "内部エラーが発生しました" });
  }
});

// ユーザーログインエンドポイント
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  console.log("Login request received:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    console.log("Missing credentials:", {
      email: !!email,
      password: !!password,
    });
    res
      .status(400)
      .json({ message: "メールアドレスとパスワードを入力してください" });
    return;
  }
  try {
    const token = await UserModel.authenticate(email, password);
    console.log("Authentication result:", { success: !!token });

    if (!token) {
      res
        .status(401)
        .json({ message: "メールアドレスまたはパスワードが違います" });
      return;
    }

    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "内部エラーが発生しました" });
  }
});

router.post("/logout", async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: "認証トークンがありません" });
      return;
    }
    const token = authHeader.split(" ")[1];
    res.status(200).json({ message: "ログアウトしました" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "内部エラーが発生しました" });
  }
});

// ユーザー情報を取得するエンドポイント
router.get("/me", async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;

    const result = await pool.query(
      "SELECT id, email, name FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
