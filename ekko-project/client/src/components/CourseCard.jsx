import React, { memo } from 'react';
import { User } from 'lucide-react';

const CourseCard = memo(({ course, onClick }) => (
  <div onClick={() => onClick(course)} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer flex flex-col h-full transform hover:-translate-y-1">
    <div className="relative h-48 overflow-hidden bg-slate-100">
      <img src={course.image} alt={course.title} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply" />
      <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm uppercase tracking-wider">{course.category}</div>
    </div>
    <div className="p-5 flex-1 flex flex-col">
      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors">{course.title}</h3>
      <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-1 text-slate-500"><User size={14} /><span className="text-xs font-medium">{course.sales} 人已加入</span></div>
        <span className="text-lg font-bold text-slate-900">¥{course.price}</span>
      </div>
    </div>
  </div>
));

export default CourseCard;
