import React, { useState, useEffect } from "react";

interface Message {
    id: number;
    content: string;
    username: string;
    created_at: string;
}

interface User {
    id: number;
    email: string;
    name: string;
}

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        fetchMessages();
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch("http://localhost:3001/auth/me", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                window.location.href = '/login';
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
            window.location.href = '/login';
        }
    };

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch("http://localhost:3001/message", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const searchMessages = async () => {
        if (!searchQuery.trim()) {
            fetchMessages();
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:3001/message/search?query=${encodeURIComponent(searchQuery)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error("Error searching messages:", error);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch("http://localhost:3001/message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: newMessage,
                    username: user.name
                }),
            });

            if (response.ok) {
                setNewMessage("");
                await fetchMessages();
                console.log("Message sent and messages refreshed");
            } else {
                console.error("Failed to send message:", await response.text());
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch("http://localhost:3001/auth/logout", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            localStorage.removeItem("token");
            setUser(null);
            window.location.href = '/login';
        } catch (error) {
            console.error("Error during logout:", error);
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    };

    if (!user) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 p-4">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-semibold text-indigo-700">Simple Chat App</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                            Logged in as: <span className="font-medium">{user.name}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div className="mb-6 flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search messages..."
                        className="flex-1 p-3 border rounded-md focus:ring focus:ring-indigo-200"
                    />
                    <button
                        onClick={searchMessages}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Search
                    </button>
                </div>

                <div className="bg-gray-50 rounded-lg shadow-inner p-4 mb-6 h-96 overflow-y-auto">
                    {messages.map((message) => (
                        <div key={message.id} className="mb-4 p-3 border-b border-gray-200 last:border-b-0">
                            <div className="font-semibold text-indigo-800">{message.username}</div>
                            <div className="text-gray-700">{message.content}</div>
                            <div className="text-sm text-gray-500 mt-1">
                                {new Date(message.created_at).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-3 border rounded-md focus:ring focus:ring-indigo-200"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;