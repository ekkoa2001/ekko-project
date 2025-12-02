import React, { useState, useEffect } from 'react';
import {
  Play, Zap, Heart, MessageCircle, Share, ShoppingBag,
  BookOpen, MousePointer, Check, Headphones, ArrowRight
} from 'lucide-react';

// Mock orders data for scrolling animation
const BASE_ORDERS = [
  { amount: '42.90', time: '刚刚', location: 'New York' },
  { amount: '128.50', time: '1m ago', location: 'London' },
  { amount: '35.00', time: '2m ago', location: 'Toronto' },
  { amount: '79.99', time: '3m ago', location: 'Sydney' },
  { amount: '210.00', time: '5m ago', location: 'Paris' },
  { amount: '55.40', time: '8m ago', location: 'Berlin' },
  { amount: '19.99', time: '10m ago', location: 'Tokyo' },
  { amount: '88.00', time: '12m ago', location: 'Dubai' },
];
const MOCK_ORDERS = [...BASE_ORDERS, ...BASE_ORDERS, ...BASE_ORDERS];

export default function IntroScreen({ onComplete }) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [views, setViews] = useState(12400);
  const [likes, setLikes] = useState(340);
  const [checkList, setCheckList] = useState([false, false, false]);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      let viewAdd = Math.floor(Math.random() * 50 + 10);
      let likeAdd = 0;
      if (hoveredCard === 0) {
        viewAdd = Math.floor(Math.random() * 2000 + 500);
        likeAdd = Math.floor(Math.random() * 50 + 5);
      }
      setViews(v => v > 999000 ? 999000 : v + viewAdd);
      setLikes(l => l + likeAdd);
    }, 50);
    return () => clearInterval(interval);
  }, [hoveredCard]);

  useEffect(() => {
    let timers = [];
    if (hoveredCard === 2) {
      setCheckList([false, false, false]);
      timers = [200, 700, 1200].map((delay, idx) =>
        setTimeout(() => setCheckList(prev => { const n = [...prev]; n[idx] = true; return n; }), delay)
      );
    } else {
      setCheckList([false, false, false]);
    }
    return () => timers.forEach(clearTimeout);
  }, [hoveredCard]);

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col items-center justify-center p-4 overflow-hidden font-sans">
      <style>{`
        @keyframes scroll-vertical { 0% { transform: translateY(0); } 100% { transform: translateY(-33.33%); } }
        .animate-scroll-vertical { animation: scroll-vertical 12s linear infinite; }
        .group:hover .animate-scroll-vertical { animation-duration: 4s; }
      `}</style>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[100px] opacity-60 animate-pulse"></div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center px-4">
        <div className="text-center mb-12 animate-in slide-in-from-top-10 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-bold mb-6 shadow-sm"><Zap size={14} className="text-yellow-500 fill-yellow-500" /> 2024 跨境实战风口</div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-4 tracking-tight">Ekko 出海课堂</h1>
          <p className="text-slate-500 text-lg font-medium">看得见的增长 · 学得会的实操</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-12">
          {/* Card 1 - TikTok */}
          <div className="relative group cursor-pointer perspective-1000" onMouseEnter={() => setHoveredCard(0)} onMouseLeave={() => setHoveredCard(null)}>
            <div className={`relative mx-auto w-full max-w-[280px] aspect-[9/18] bg-black rounded-[2.5rem] border-[8px] border-slate-900 shadow-2xl shadow-slate-300 overflow-hidden transition-all duration-300 ${hoveredCard === 0 ? 'scale-105 -translate-y-2 shadow-blue-500/20' : ''}`}>
              <img src="https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=600&q=80" className="absolute inset-0 w-full h-full object-cover opacity-90" alt="TikTok"/>
              <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${hoveredCard === 0 ? 'opacity-100' : 'opacity-0'}`}><Heart size={100} className="text-white/30 fill-white animate-ping" /></div>
              <div className="absolute right-2 bottom-16 flex flex-col gap-4 items-center z-10">
                <div className="flex flex-col items-center gap-1"><div className="w-10 h-10 rounded-full bg-slate-800/50 backdrop-blur flex items-center justify-center"><Heart size={20} fill="#ef4444" className="text-red-500" /></div><span className="text-white text-xs font-bold">{(likes/1000).toFixed(1)}k</span></div>
                <div className="flex flex-col items-center gap-1"><div className="w-10 h-10 rounded-full bg-slate-800/50 backdrop-blur flex items-center justify-center"><MessageCircle size={20} fill="white" /></div><span className="text-white text-xs font-bold">2.4k</span></div>
                <div className="w-10 h-10 rounded-full bg-slate-800/50 backdrop-blur flex items-center justify-center"><Share size={20} fill="white" /></div>
              </div>
              <div className="absolute bottom-6 left-4 z-10 text-white">
                <div className="font-bold mb-1 text-sm">@Ekko_Official</div>
                <div className="text-xs opacity-90 mb-2">🔥 零基础起号实战...</div>
                <div className={`flex items-center gap-2 text-xs font-mono px-2 py-1 rounded backdrop-blur border border-white/10 w-fit transition-colors ${hoveredCard === 0 ? 'bg-green-500/80 border-green-400' : 'bg-black/40'}`}><Play size={10} fill="currentColor" /> {(views/1000).toFixed(1)}k views</div>
              </div>
            </div>
          </div>

          {/* Card 2 - Shopify */}
          <div className="relative group cursor-pointer" onMouseEnter={() => setHoveredCard(1)} onMouseLeave={() => setHoveredCard(null)}>
            <div className={`relative mx-auto w-full max-w-[280px] aspect-[9/18] bg-slate-100 rounded-[2.5rem] border-[8px] border-slate-900 shadow-2xl shadow-slate-300 overflow-hidden bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=600&q=80')] bg-cover transition-all duration-300 ${hoveredCard === 1 ? 'scale-105 -translate-y-2 shadow-green-500/20' : ''}`}>
              <div className="h-8 w-full flex justify-between px-6 pt-3 items-center z-20 relative bg-white/30 backdrop-blur-sm">
                <span className="text-xs font-bold text-slate-800">9:41</span>
                <div className="flex gap-1"><div className="w-4 h-2 bg-slate-800 rounded-sm"></div></div>
              </div>
              <div className="absolute top-10 left-0 w-full h-full overflow-hidden px-3 pt-2">
                <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-white/80 to-transparent z-10"></div>
                <div className="animate-scroll-vertical flex flex-col gap-3">
                  {MOCK_ORDERS.map((n, i) => (
                    <div key={i} className="bg-white/90 backdrop-blur-md shadow-sm rounded-xl p-3 flex gap-3 border border-slate-100/50 w-full shrink-0">
                      <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center shrink-0 shadow-sm"><ShoppingBag size={18} className="text-[#95BF47]" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5"><span className="font-bold text-[10px] text-slate-900 uppercase">SHOPIFY</span><span className="text-[9px] text-slate-500">{n.time}</span></div>
                        <div className="text-xs font-medium text-slate-800 truncate">收入: <span className="text-green-600 font-bold text-sm">+${n.amount}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white/90 to-transparent z-10"></div>
              </div>
            </div>
          </div>

          {/* Card 3 - Features */}
          <div className="relative group cursor-pointer" onMouseEnter={() => setHoveredCard(2)} onMouseLeave={() => setHoveredCard(null)}>
            <div className={`relative mx-auto w-full max-w-[280px] aspect-[9/18] bg-white rounded-[2.5rem] border-[8px] border-slate-900 shadow-2xl shadow-slate-300 overflow-hidden flex flex-col px-5 py-12 relative transition-all duration-300 ${hoveredCard === 2 ? 'scale-105 -translate-y-2 shadow-blue-500/20' : ''}`}>
              <div className="relative z-10 flex flex-col gap-6 h-full justify-center">
                {['简单理解', '实操经验', '全程售后'].map((text, idx) => (
                  <div key={idx} className="transform transition-all duration-300">
                    <div className={`bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-3 transition-all duration-500 ${checkList[idx] ? 'border-green-400 bg-green-50/20 scale-105' : 'border-slate-100'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${idx===0?'bg-blue-100 text-blue-600':idx===1?'bg-purple-100 text-purple-600':'bg-green-100 text-green-600'}`}>
                        {idx===0?<BookOpen size={20}/>:idx===1?<MousePointer size={20}/>:<Headphones size={20}/>}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-900">{text}</div>
                        <div className="text-[10px] text-slate-600">{idx===0?'小白也能听懂':idx===1?'只有落地干货':'陪跑答疑直到闭环'}</div>
                      </div>
                      <div className={`transition-all duration-300 transform ${checkList[idx] ? 'scale-100 opacity-100 text-green-600' : 'scale-0 opacity-0'}`}><Check size={18} strokeWidth={4} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={`transition-all duration-1000 ease-out transform ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <button onClick={onComplete} className="group relative px-12 py-4 bg-slate-900 text-white rounded-full font-bold text-lg shadow-2xl shadow-slate-900/40 hover:shadow-blue-900/40 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <span className="relative z-10">进入课堂</span>
            <div className="bg-white/20 p-1.5 rounded-full group-hover:translate-x-1 transition-transform"><ArrowRight size={18} /></div>
          </button>
        </div>
      </div>
    </div>
  );
}
