import React, { useState } from "react";
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('')
    const [confirmationPassword, setConfirmationPassword] = useState('')
    const [error, setError] = useState('');
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        console.log('Attempting to register with:', { email, password }); // デバッグログ
      
        try {
          const response = await fetch('http://localhost:3001/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // 必要に応じて
            body: JSON.stringify({ email, password }),
          });
      
          console.log('Registration response status:', response.status); // レスポンスステータス
      
          const data = await response.json();
          console.log('Registration response data:', data); // レスポンスデータ
      
          if (response.ok) {
            // 登録成功時の処理
            console.log('Registration successful');
            // ここにリダイレクトなどの処理を追加
          } else {
            // エラー処理
            console.error('Registration failed:', data.message);
          }
        } catch (error) {
          console.error('Registration error:', error);
        }
      };
    
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-md">
                    <h2 className="text-center text-3xl font-bold text-gray-900">新規登録</h2>
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
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="パスワード"
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    required
                                    value={confirmationPassword}
                                    onChange={(e) => setConfirmationPassword(e.target.value)}
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="パスワード(確認用)"
                                />
                            </div>
                        </div>
    
                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                登録
                            </button>
                        </div>
                    </form>
                </div>
                <div className="text-center mt-4">
                    <Link
                        to="/login"
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        ログインはこちら
                    </Link>
                </div>
            </div>
        );
    };
    
    export default Register;