import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

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

interface UserStatus {
    userId: number;
    status: "online" | "offline";
}

interface UserTyping {
    userId: number;
    username: string;
}

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [user, setUser] = useState<User | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
    const [typingUsers, setTypingUsers] = useState<UserTyping[]>([]);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // メッセージリストの最下部に自動スクロール
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    // ユーザー情報取得後にSocket接続とメッセージ取得を行う
    useEffect(() => {
        if (user) {
            fetchMessages();
            initSocket();
        }
        
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [user]);
    
    // メッセージが更新されたら自動スクロール
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initSocket = () => {
        const token = localStorage.getItem('token');
        if (!token || !user) return;

        // Socket.io接続の確立
        socketRef.current = io("http://localhost:3001", {
            auth: { token }
        });

        // 新しいメッセージを受信したときのイベントハンドラ
        socketRef.current.on("newMessage", (message: Message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        });

        // ユーザーのオンライン/オフラインステータスを受信
        socketRef.current.on("userStatus", (data: UserStatus) => {
            if (data.status === "online") {
                setOnlineUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
            } else {
                setOnlineUsers(prev => prev.filter(id => id !== data.userId));
            }
        });

        // ユーザーのタイピング状態を受信
        socketRef.current.on("userTyping", (data: UserTyping) => {
            setTypingUsers(prev => {
                if (!prev.some(user => user.userId === data.userId)) {
                    return [...prev, data];
                }
                return prev;
            });
        });

        // ユーザーのタイピング停止を受信
        socketRef.current.on("userStopTyping", (data: { userId: number }) => {
            setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
        });

        // 接続エラーハンドラ
        socketRef.current.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            if (error.message.includes("Authentication error")) {
                localStorage.removeItem("token");
                window.location.href = '/login';
            }
        });
    };

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

    const handleTyping = () => {
        if (socketRef.current) {
            socketRef.current.emit("typing");
            
            // タイピング停止の通知を遅延させる
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            
            typingTimeoutRef.current = setTimeout(() => {
                if (socketRef.current) {
                    socketRef.current.emit("stopTyping");
                }
            }, 2000); // 2秒間タイピングがなければ停止と判断
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        try {
            // タイピング状態をクリア
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (socketRef.current) {
                socketRef.current.emit("stopTyping");
            }

            // WebSocketを使ってメッセージ送信
            if (socketRef.current) {
                socketRef.current.emit("sendMessage", {
                    content: newMessage
                });
                setNewMessage("");
            } else {
                // フォールバック：WebSocket接続がない場合は従来のHTTPを使用
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

            // ソケット接続を切断
            if (socketRef.current) {
                socketRef.current.disconnect();
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
                    <h1 className="text-3xl font-semibold text-indigo-700">Real-Time Chat</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                            Logged in as: <span className="font-medium">{user.name}</span>
                        </div>
                        <div className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            Online ({onlineUsers.length} users)
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
                    {typingUsers.length > 0 && (
                        <div className="text-sm text-gray-500 italic">
                            {typingUsers.length === 1 
                                ? `${typingUsers[0].username} is typing...` 
                                : `${typingUsers.length} people are typing...`}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
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