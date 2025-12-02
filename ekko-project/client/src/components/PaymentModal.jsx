import React, { useState, useEffect } from 'react';
import {
  X, Check, MessageCircle, Zap, CreditCard,
  Loader2, Lock, ShieldCheck
} from 'lucide-react';

const API_URL = "http://localhost:3001/api";

export default function PaymentModal({ isOpen, onClose, course, user, onPaymentComplete }) {
  const [method, setMethod] = useState('wechat'); // wechat, alipay, card
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(false);
      setMethod('wechat');
    }
  }, [isOpen]);

  if (!isOpen || !course) return null;

  const handlePay = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Request backend to create order
      const res = await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          courseId: course.id,
          amount: course.price,
          paymentMethod: method
        })
      });
      const data = await res.json();

      if (data.success) {
        // Simulate payment gateway processing
        setTimeout(() => {
          setLoading(false);
          onPaymentComplete(data.order.id);
          onClose();
        }, 1500);
      } else {
        alert('支付失败: ' + (data.message || '未知错误'));
        setLoading(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('网络错误，请检查后端服务是否启动');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 font-sans">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Payment card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-green-500" size={18} /> 安全收银台
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-400 hover:text-slate-900"/></button>
        </div>

        <div className="p-6">
          {/* Product info */}
          <div className="flex gap-4 mb-8 bg-white border border-slate-100 p-3 rounded-2xl shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative">
              <img src={course.image} className="w-full h-full object-cover" alt="Course" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wide bg-blue-50 px-2 py-0.5 rounded-full w-fit mb-1">订阅课程</div>
              <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1 line-clamp-2">{course.title}</h4>
              <div className="text-lg font-black text-slate-900">¥{course.price}</div>
            </div>
          </div>

          {/* Payment method selection */}
          <div className="space-y-3 mb-8">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">选择支付方式</div>

            <button
              onClick={() => setMethod('wechat')}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${method === 'wechat' ? 'border-green-500 bg-green-50/50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#09BB07] flex items-center justify-center text-white shadow-sm"><MessageCircle size={18} fill="white"/></div>
                <span className="font-bold text-slate-700">微信支付</span>
              </div>
              {method === 'wechat' && <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"><Check size={12} className="text-white" strokeWidth={3} /></div>}
            </button>

            <button
              onClick={() => setMethod('alipay')}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${method === 'alipay' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1677FF] flex items-center justify-center text-white shadow-sm"><Zap size={18} fill="white"/></div>
                <span className="font-bold text-slate-700">支付宝</span>
              </div>
              {method === 'alipay' && <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"><Check size={12} className="text-white" strokeWidth={3} /></div>}
            </button>

            <button
              onClick={() => setMethod('card')}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${method === 'card' ? 'border-purple-500 bg-purple-50/50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white shadow-sm"><CreditCard size={16} /></div>
                <span className="font-bold text-slate-700">信用卡 / Stripe</span>
              </div>
              {method === 'card' && <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center"><Check size={12} className="text-white" strokeWidth={3} /></div>}
            </button>
          </div>

          {/* Payment button */}
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-xl shadow-slate-200"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Lock size={18} />}
            {loading ? '安全支付处理中...' : `确认支付 ¥${course.price}`}
          </button>

          <div className="mt-4 text-center">
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck size={10} /> 256-bit SSL 加密 · 资金安全保障
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
