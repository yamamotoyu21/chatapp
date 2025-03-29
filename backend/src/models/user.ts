import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db";

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;
}

export class UserModel {
  static async register(
    name: string,
    email: string,
    password: string
  ): Promise<User | null> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = `
        INSERT INTO users (name, email, password)
        VALUES($1, $2, $3)
        RETURNING *
      `;
      const values = [name, email, hashedPassword];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (e) {
      console.error("Database error during registration:", e);
      return null;
    }
  }

  static async authenticate(
    email: string,
    password: string
  ): Promise<string | null> {
    try {
      // ユーザーを検索
      const userQuery = "SELECT * FROM users WHERE email = $1";
      const userResult = await pool.query(userQuery, [email]);

      if (userResult.rows.length === 0) {
        return null;
      }

      const user = userResult.rows[0];

      // パスワードを検証
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return null;
      }

      // JWTトークンを生成
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      return token;
    } catch (error) {
      console.error("Authentication error:", error);
      return null;
    }
  }
}
