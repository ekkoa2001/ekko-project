import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Award, Clock, Users } from 'lucide-react';

const API_URL = "http://localhost:3001/api";

export default function CourseDetail({ course: propCourse, onStartLearning }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(propCourse);
  const [loading, setLoading] = useState(!propCourse);

  useEffect(() => {
    if (!propCourse && id) {
      // Fetch course by ID if not provided via props
      setLoading(true);
      fetch(`${API_URL}/courses/${id}`)
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            setCourse(res.data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch course", err);
          setLoading(false);
        });
    } else if (propCourse) {
      setCourse(propCourse);
    }
  }, [id, propCourse]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">加载中...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">课程未找到</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 animate-in slide-in-from-bottom-5 duration-500">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">返回</span>
        </button>
        
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-slate-200 mb-6 bg-slate-100">
              <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2"><Users size={16} /> {course.sales} 人已学</div>
              <div className="flex items-center gap-2"><Clock size={16} /> 永久有效</div>
              <div className="flex items-center gap-2"><Award size={16} /> 实战案例</div>
            </div>
          </div>

          <div>
            <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold mb-4">{course.category}</div>
            <h1 className="text-4xl font-black text-slate-900 mb-6 leading-tight">{course.title}</h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">{course.description || '这是一门实战课程，包含真实案例和可复制的方法论。'}</p>
            
            <div className="bg-slate-50 rounded-2xl p-8 mb-8">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-black text-slate-900">¥{course.price}</span>
                <span className="text-slate-500 line-through">¥{Math.floor(course.price * 1.5)}</span>
              </div>
              <button onClick={() => onStartLearning(course)} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20">
                <Play size={20} fill="currentColor" />
                立即订阅
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                <div><strong className="text-slate-900">永久访问</strong><br />一次购买，终身学习</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                <div><strong className="text-slate-900">实战案例</strong><br />真实项目，可复制方法</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                <div><strong className="text-slate-900">社群答疑</strong><br />专属社群，随时提问</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
