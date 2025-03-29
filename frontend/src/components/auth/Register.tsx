import React, { useState } from "react";
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmationPassword, setConfirmationPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmationPassword) {
            setError("パスワードと確認用パスワードが一致しません。");
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/auth/register', {
                name,
                email,
                password,
            }, {
                withCredentials: true
            });

            console.log('Registration response:', response.data);

            navigate('/login');
        } catch (error: any) {
            console.error('Registration error:', error.response?.data || error.message);
            setError(error.response?.data?.message || '登録に失敗しました。');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-md">
                <h2 className="text-center text-3xl font-bold text-gray-900">新規登録</h2>
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded">
                        {error}
                    </div>
                )}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="ユーザーネーム(ニックネーム可)"
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="メールアドレス"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="パスワード"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                value={confirmationPassword}
                                onChange={(e) => setConfirmationPassword(e.target.value)}
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="パスワード(確認用)"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            登録
                        </button>
                    </div>
                </form>
                <div className="text-center mt-6">
                    <Link
                        to="/login"
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        ログインはこちら
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;