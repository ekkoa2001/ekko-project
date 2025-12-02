import React, { useState, useEffect } from 'react';
import {
  X, User, Mail, Lock, Loader2, ArrowRight, AlertCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (isOpen) {
      setError('');
      setIsLoading(false);
      setFormData({ name: '', email: '', password: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = isRegister ? '/register' : '/login';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (data.success) {
        // Store token if provided
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        onLoginSuccess(data.user);
        onClose();
      } else {
        setError(data.message || '操作失败');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('网络错误，请检查后端服务是否启动');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="h-32 bg-slate-900 relative overflow-hidden flex items-center justify-center">
          <div className="absolute top-[-50%] left-[-20%] w-64 h-64 bg-blue-600/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-50%] right-[-20%] w-64 h-64 bg-purple-600/30 rounded-full blur-3xl"></div>
          <h2 className="text-3xl font-black text-white relative z-10 tracking-tight">{isRegister ? '加入 Ekko' : '欢迎回来'}</h2>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/10 p-2 rounded-full backdrop-blur-md"><X size={20} /></button>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100"><AlertCircle size={16} /> {error}</div>}
            {isRegister && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">昵称</label>
                <div className="relative"><User className="absolute left-4 top-3.5 text-slate-400" size={18} /><input type="text" placeholder="怎么称呼您？" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">账号</label>
              <div className="relative"><Mail className="absolute left-4 top-3.5 text-slate-400" size={18} /><input type="email" placeholder="name@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">密码</label>
              <div className="relative"><Lock className="absolute left-4 top-3.5 text-slate-400" size={18} /><input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
              {isLoading ? '处理中...' : (isRegister ? '立即注册' : '立即登录')}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-500">
            {isRegister ? '已有账号？' : '还没有账号？'}
            <button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); }} className="ml-2 font-bold text-slate-900 hover:underline">{isRegister ? '去登录' : '去注册'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
