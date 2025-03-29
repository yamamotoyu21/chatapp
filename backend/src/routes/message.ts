import express, { Request, Response, NextFunction } from "express";
import { MessageModel } from "../models/message";
import jwt from "jsonwebtoken";

const router = express.Router();

// 認証ミドルウェア（メッセージルーター専用）
const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "認証トークンがありません" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "無効な認証トークンです" });
  }
};

// すべてのメッセージを取得
router.get("/", verifyToken, (req: Request, res: Response): void => {
  MessageModel.getAllMessages()
    .then((messages) => {
      res.json(messages);
    })
    .catch((error) => {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "メッセージの取得に失敗しました" });
    });
});

// メッセージを検索
router.get("/search", verifyToken, (req: Request, res: Response): void => {
  const query = req.query.query as string;

  if (!query) {
    res.status(400).json({ message: "検索キーワードが必要です" });
    return;
  }

  MessageModel.searchMessages(query)
    .then((messages) => {
      res.json(messages);
    })
    .catch((error) => {
      console.error("Error searching messages:", error);
      res.status(500).json({ message: "メッセージの検索に失敗しました" });
    });
});

// 新しいメッセージを作成
router.post("/", verifyToken, (req: Request, res: Response): void => {
  const { content, username } = req.body;

  if (!content || !username) {
    res.status(400).json({ message: "内容とユーザー名を入力してください" });
    return;
  }

  MessageModel.createMessage(content, username)
    .then((newMessage) => {
      if (!newMessage) {
        res.status(500).json({ message: "メッセージの作成に失敗しました" });
        return;
      }

      res.status(201).json(newMessage);
    })
    .catch((error) => {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "メッセージの作成に失敗しました" });
    });
});

export default router;
