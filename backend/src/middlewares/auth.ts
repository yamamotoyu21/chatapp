import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Socket } from "socket.io";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    name?: string;
  };
}

// HTTP リクエスト用の認証ミドルウェア
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // 明示的にvoid型を返すことを示す
  try {
    const token = (req.headers as Record<string, string>).authorization?.split(
      " "
    )[1];

    if (!token) {
      res.status(401).json({ message: "認証トークンがありません" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded as { userId: number; email: string; name?: string };
    next();
  } catch (error) {
    res.status(403).json({ message: "無効な認証トークンです" });
    return;
  }
};

// Socket.io 接続用の認証ミドルウェア
export const socketAuthMiddleware = (socket: Socket, next: any): void => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      next(new Error("Authentication error: No token provided"));
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Socket オブジェクトにユーザー情報を追加
    (socket as any).user = decoded as {
      userId: number;
      email: string;
      name?: string;
    };
    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid token"));
    return;
  }
};
