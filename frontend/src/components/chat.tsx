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
            const response = await fetch("http://localhost:3001/api/messages", {
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
                `http://localhost:3001/api/messages/search?query=${encodeURIComponent(searchQuery)}`,
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
            const response = await fetch("http://localhost:3001/api/messages", {
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
                // リクエストが成功した場合のみ入力をクリア
                setNewMessage("");
                // レスポンスを待ってからメッセージを再取得
                await fetchMessages();
                console.log("Message sent and messages refreshed");
            } else {
                console.error("Failed to send message:", await response.text());
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };
    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 data-testid=""className="text-2xl font-bold">Simple Chat App</h1>
                    <div className="text-sm text-gray-600">
                        Logged in as: {user.name}
                    </div>
                </div>

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
};

export default Chat;


// import React, { useState, useEffect } from "react";

// interface Message {
//     id: number;
//     content: string;
//     username: string;
//     created_at: string;
// }

// const Chat: React.FC = () => {
//     const [messages, setMessages] = useState<Message[]>([]);
//     const [newMessage, setNewMessage] = useState("");
//     const [username, setUsername] = useState("");
//     const [searchQuery, setSearchQuery] = useState("");

//     useEffect(() => {
//         fetchMessages()
//     }, []);

//     const fetchMessages = async () => {
//         try {
//             const response = await fetch("http://localhost:3001/api/messages");
//             const data = await response.json();
//             setMessages(data);
//         } catch (error) {
//             console.error("Error fetching messages:", error);
//         }
//     };

//     const searchMessages = async () => {
//         if (!searchQuery.trim()) {
//             fetchMessages();
//             return;
//         }

//         try {
//             const response = await fetch(
//                 `http://localhost:3001/api/messages/search?query=${encodeURIComponent(searchQuery)}`
//             );
//             const data = await response.json();
//             setMessages(data);
//         } catch (error) {
//             console.error("Error searching messages:", error);
//         }
//     };

//     const sendMessage = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!newMessage.trim() || !username.trim()) return;

//         try {
//             await fetch("http://localhost:3001/api/messages", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     content: newMessage,
//                     username: username,
//                 }),
//             });
//             setNewMessage("");
//             fetchMessages();
//         } catch (error) {
//             console.error("Error sending message:", error);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gray-100 p-4">
//             <div className="max-w-3xl mx-auto">
//                 <h1 className="text-2xl font-bold mb-4">Simple Chat App</h1>

//                 <div className="mb-4">
//                     <input
//                         type="text"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         placeholder="Enter your username"
//                         className="w-full p-2 border rounded"
//                     />
//                 </div>

//                 <div className="mb-4 flex gap-2">
//                     <input
//                         type="text"
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                         placeholder="Search messages..."
//                         className="flex-1 p-2 border rounded"
//                     />
//                     <button
//                         onClick={searchMessages}
//                         className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//                     >
//                         Search
//                     </button>
//                 </div>

//                 <div className="bg-white rounded-lg shadow p-4 mb-4 h-96 overflow-y-auto">
//                     {messages.map((message) => (
//                         <div key={message.id} className="mb-4 p-2 border-b">
//                             <div className="font-bold">{message.username}</div>
//                             <div>{message.content}</div>
//                             <div className="text-sm text-gray-500">
//                                 {new Date(message.created_at).toLocaleString()}
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 <form onSubmit={sendMessage} className="flex gap-2">
//                     <input
//                         type="text"
//                         value={newMessage}
//                         onChange={(e) => setNewMessage(e.target.value)}
//                         placeholder="Type a message..."
//                         className="flex-1 p-2 border rounded"
//                     />
//                     <button
//                         type="submit"
//                         className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//                     >
//                         Send
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default Chat;
