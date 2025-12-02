import React from 'react';
import { Mail, Twitter, Youtube, Instagram } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-20 animate-in slide-in-from-bottom-5 duration-500">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-black text-slate-900 mb-6">关于 Ekko</h1>
        <div className="prose prose-slate max-w-none">
          <p className="text-xl text-slate-600 leading-relaxed mb-8">
            我是一名独立出海人，专注于 TikTok、Shopify 和 Facebook Ads 的实战运营。
          </p>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            这个平台分享的都是我正在用的方法论，没有理论，只有实战。每一门课程都来自真实项目的经验总结。
          </p>
          <div className="bg-slate-50 rounded-2xl p-8 my-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">为什么创建这个平台？</h3>
            <p className="text-slate-600 leading-relaxed">
              市面上太多课程都是"纸上谈兵"，讲的都是别人的案例。我想做的是把自己正在用的、验证过的方法分享出来，帮助更多人少走弯路。
            </p>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">联系方式</h3>
          <div className="flex gap-6 text-slate-600">
            <a href="mailto:hello@ekko.com" className="flex items-center gap-2 hover:text-slate-900 transition-colors">
              <Mail size={20} />
              <span>hello@ekko.com</span>
            </a>
            <a href="#" className="flex items-center gap-2 hover:text-blue-500 transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="flex items-center gap-2 hover:text-red-500 transition-colors">
              <Youtube size={20} />
            </a>
            <a href="#" className="flex items-center gap-2 hover:text-pink-500 transition-colors">
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
