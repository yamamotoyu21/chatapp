import { pool } from "../db";

interface Message {
  id: number;
  content: string;
  username: string;
  created_at: Date;
}

export class MessageModel {
  static async getAllMessages(): Promise<Message[]> {
    try {
      const query = `
                SELECT * FROM messages
                ORDER BY created_at DESC
            `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  }

  static async searchMessages(searchQuery: string): Promise<Message[]> {
    try {
      const query = `
                SELECT * FROM messages
                WHERE content ILIKE $1
                ORDER BY created_at DESC
            `;

      const values = [`%${searchQuery}%`];
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error("Error searching messages", error);
      return [];
    }
  }

  static async createMessage(
    content: string,
    username: string
  ): Promise<Message | null> {
    try {
      const query = `
              INSERT INTO messages (content, username, created_at)
              VALUES($1, $2, NOW())
              RETURNING *
            `;
      const values = [content, username];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating message:", error);
      return null;
    }
  }
}
