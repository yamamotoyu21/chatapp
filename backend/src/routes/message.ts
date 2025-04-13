import express, { Request, Response } from "express";
import { MessageModel } from "../models/message";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import { Server } from "socket.io";

const router = express.Router();
let io: Server | null = null;

// Socket.ioインスタンスを設定するための関数
export const setSocketIo = (socketIo: Server) => {
  io = socketIo;
};

// すべてのメッセージを取得
router.get("/", authMiddleware, (req: AuthRequest, res: Response) => {
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
router.get("/search", authMiddleware, (req: AuthRequest, res: Response) => {
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
router.post("/", authMiddleware, (req: AuthRequest, res: Response) => {
  const { content, username } = req.body;
  const userId = req.user?.userId;

  if (!content) {
    res.status(400).json({ message: "メッセージ内容を入力してください" });
    return;
  }

  // HTTPリクエストでもユーザーID情報を利用
  const actualUsername = username || req.user?.email || "unknown";

  MessageModel.createMessage(content, actualUsername)
    .then((newMessage) => {
      if (!newMessage) {
        res.status(500).json({ message: "メッセージの作成に失敗しました" });
        return;
      }

      // Socket.ioが設定されている場合、新しいメッセージをブロードキャスト
      if (io) {
        io.emit("newMessage", newMessage);
      }

      res.status(201).json(newMessage);
    })
    .catch((error) => {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "メッセージの作成に失敗しました" });
    });
});

export default router;
