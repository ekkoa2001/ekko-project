import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import CourseCard from '../components/CourseCard';

export default function TopicPage({ config, courses, onCourseClick }) {
  const { type } = useParams();
  const topicConfig = config[type];
  
  if (!topicConfig) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-400">专题未找到</p>
    </div>;
  }
  
  const { title, subtitle, bgImage, filter, icon: Icon } = topicConfig;
  
  const filteredCourses = useMemo(() => 
    courses.filter(c => c.category?.includes(filter) || c.title?.includes(filter)),
    [courses, filter]
  );

  return (
    <div className="min-h-screen bg-white pt-20 animate-in slide-in-from-bottom-5 duration-500">
      <div className="relative h-80 overflow-hidden bg-slate-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${bgImage})` }}></div>
        <div className="relative z-10 text-center text-white px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-md mb-6">
            <Icon size={32} />
          </div>
          <h1 className="text-5xl font-black mb-4">{title}</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">{subtitle}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-between items-end mb-10 px-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">相关课程</h2>
            <p className="text-slate-500 mt-1 text-sm">共 {filteredCourses.length} 门课程</p>
          </div>
        </div>
        
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">暂无相关课程</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} onClick={onCourseClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
