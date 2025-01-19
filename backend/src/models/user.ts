import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db";
interface User {
  id: number;
  email: string;
  password: string;
  created_at: Date;
}

export class UserModel {
  // ユーザー登録
  static async register(email: string, password: string): Promise<User | null> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = `
        INSERT INTO users (email, password)
        VALUES($1, $2)
        RETURNING *
      `;
      const values = [email, hashedPassword];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (e) {
      console.error("Database error during registration:", e); // エラーログ
      return null; // ユーザーには詳細を見せない
    }
  }

  static async authenticate(
    email: string,
    password: string
  ): Promise<string | null> {
    try {
      const query = `SELECT * FROM users WHERE email = $1`;
      const result = await pool.query(query, [email]);
      const user = result.rows[0];

      if (!user) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return null;
      }

      // JWTトークンの生成
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      return token;
    } catch (error) {
      console.error("Error authenticating user:", error);
      return null;
    }
  }
}
