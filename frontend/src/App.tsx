import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Chat from './components/chat';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* デフォルトで /login にリダイレクト */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
        {/* 404 ページ */}
        <Route path="*" element={<div>404: ページが見つかりません。</div>} />
      </Routes>
    </Router>
  );
};

export default App;
