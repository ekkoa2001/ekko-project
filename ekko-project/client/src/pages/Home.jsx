import React from 'react';
import Header from '../components/Header';
import CourseCard from '../components/CourseCard';

const HomeHero = ({ onExplore }) => (
  <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
    <div className="absolute top-0 right-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-[0.03] -z-20"></div>
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight">从 0 到 1<br />出海实战课堂</h1>
      <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">TikTok · Shopify · Facebook Ads<br />真实案例 · 可复制方法论</p>
      <button onClick={onExplore} className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold text-lg shadow-2xl shadow-slate-900/30 hover:scale-105 active:scale-95 transition-all duration-300">探索课程</button>
    </div>
  </div>
);

export default function Home({ courses, onCourseClick }) {
  return (
    <>
      <Header title="课程主页" />
      <HomeHero onExplore={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })} />
      <div id="courses" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-between items-end mb-10 px-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">实战课程</h2>
            <p className="text-slate-500 mt-1 text-sm">我正在用的方法论，都在这里了</p>
          </div>
        </div>
        {courses.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">加载课程中...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} onClick={onCourseClick} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
