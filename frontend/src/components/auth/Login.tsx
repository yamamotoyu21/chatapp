import React, { useState } from "react";
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log('Attempting login with:', { email, password });
            
            const response = await axios.post('http://localhost:3001/auth/login', {
                email,
                password,
            }, {
                withCredentials: true // CORSの認証情報を含める
            });
    
            console.log('Login response:', response.data);
    
            const { token } = response.data;
            localStorage.setItem('token', token);
    
            navigate('/chat');
        } catch (error: any) {
            console.error('Login error:', error.response?.data || error.message);
            setError(error.response?.data?.message || 'ログインに失敗しました。認証情報を確認してください。');
        }

    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
                <h2 className="text-center text-3xl font-bold text-gray-900">ログイン</h2>
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded">
                        {error}
                    </div>
                )}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="メールアドレス"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="パスワード"
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            ログイン
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <Link
                        to="/register"
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        新規登録はこちら
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
