// frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import './App.css';

interface Message {
  id: number;
  content: string;
  username: string;
  created_at: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const searchMessages = async () => {
    if (!searchQuery.trim()) {
      fetchMessages();
      return;
    }
    
    try {
      const response = await fetch(
        `http://localhost:3001/api/messages/search?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error searching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !username.trim()) return;

    try {
      await fetch('http://localhost:3001/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          username: username,
        }),
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Simple Chat App</h1>
        
        {/* ユーザー名入力 */}
        <div className="mb-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* 検索機能 */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={searchMessages}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>

        {/* メッセージ一覧 */}
        <div className="bg-white rounded-lg shadow p-4 mb-4 h-96 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className="mb-4 p-2 border-b">
              <div className="font-bold">{message.username}</div>
              <div>{message.content}</div>
              <div className="text-sm text-gray-500">
                {new Date(message.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* メッセージ入力フォーム */}
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;