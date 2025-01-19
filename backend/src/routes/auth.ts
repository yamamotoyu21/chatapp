import express, { Request, Response } from "express";
import { UserModel } from "../models/user";

const router = express.Router();

// ユーザー登録エンドポイント
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res
      .status(400)
      .json({ message: "メールアドレスとパスワードを入力してください" });
    return;
  }

  try {
    const user = await UserModel.register(email, password);
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
  const { email, password } = req.body;

  if (!email || !password) {
    res
      .status(400)
      .json({ message: "メールアドレスとパスワードを入力してください" });
    return;
  }

  try {
    const token = await UserModel.authenticate(email, password);
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

export default router;
