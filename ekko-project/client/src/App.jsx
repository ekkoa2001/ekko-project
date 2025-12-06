import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ShoppingBag, Video as VideoIcon, Globe, TrendingUp } from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Components
import Navbar from './components/Navbar';
import AnalyticsTracker from './components/AnalyticsTracker';
import IntroScreen from './components/IntroScreen';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';

// Pages
import Home from './pages/Home';
import CourseDetail from './pages/CourseDetail';
import TopicPage from './pages/TopicPage';
import AboutPage from './pages/AboutPage';

// Contexts & Utils
import { useConfig } from './contexts/ConfigContext';
import { api } from './utils/api';

// Topic configurations
const TOPIC_CONFIGS = {
  'shopify': {
    title: "Shopify 建站",
    subtitle: "从域名配置到高转化模版装修，打造品牌出海基石",
    bgImage: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=1600&q=80",
    filter: "独立站",
    icon: ShoppingBag
  },
  'tiktok-live': {
    title: "TikTok 直播",
    subtitle: "直播间搭建、话术拆解与主播培训全流程",
    bgImage: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&w=1600&q=80",
    filter: "直播",
    icon: VideoIcon
  },
  'tiktok-shop': {
    title: "TikTok 小店",
    subtitle: "美区/英区小店开通、选品上架与达人建联",
    bgImage: "https://images.unsplash.com/photo-1556741533-974f8e62a92d?auto=format&fit=crop&w=1600&q=80",
    filter: "小店",
    icon: ShoppingBag
  },
  'tiktok-ops': {
    title: "TikTok 运营/投放",
    subtitle: "短视频起号逻辑与 ADS 投放 ROAS 优化",
    bgImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1600&q=80",
    filter: "TikTok",
    icon: TrendingUp
  },
  'facebook': {
    title: "Facebook 投放",
    subtitle: "精准受众定位与 ROAS 优化策略",
    bgImage: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=1600&q=80",
    filter: "广告",
    icon: Globe
  }
};

export default function App() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();
  const { config } = useConfig();

  // Check for existing token
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user data");
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Fetch courses on mount and refresh periodically
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.getCourses();
        if (res.success) setCourses(res.data);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };

    // Initial load
    fetchCourses();

    // Refresh every 30 seconds
    const interval = setInterval(fetchCourses, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginClick = () => {
    setShowAuthModal(true);
  };

  const handleLoginSuccess = (data) => {
    // data expected to be { user: {...}, token: "..." }
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    navigate(`/course/${course.id}`);
    window.scrollTo(0, 0);
  };

  const handleBuy = (course) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedCourse(course);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = (orderId) => {
    toast.success(`🎉 订阅成功！订单号：${orderId}`, {
      description: '您可以去管理员后台查看订单详情。',
      duration: 5000,
    });
    setShowPaymentModal(false);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Toaster position="top-center" />
      <AnalyticsTracker />
      {showIntro && <IntroScreen onComplete={() => setShowIntro(false)} />}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        course={selectedCourse}
        user={user}
        onPaymentComplete={handlePaymentComplete}
      />

      <div className={`transition-opacity duration-1000 ${showIntro ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
        <Navbar
          user={user}
          onLoginClick={handleLoginClick}
          onLogout={handleLogout}
        />

        <Routes>
          <Route
            path="/"
            element={<Home courses={courses} onCourseClick={handleCourseClick} />}
          />
          <Route
            path="/course/:id"
            element={<CourseDetail course={selectedCourse} onStartLearning={handleBuy} />}
          />
          <Route
            path="/topic/:type"
            element={
              <TopicPage
                config={TOPIC_CONFIGS}
                courses={courses}
                onCourseClick={handleCourseClick}
              />
            }
          />
          <Route path="/about" element={<AboutPage />} />
        </Routes>

        <footer className="bg-white border-t border-slate-100 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
            <div className="font-bold text-lg text-slate-900 mb-2">
                {config.site_title || "Ekko Studio"}
            </div>
            <p className="mb-4">
                {config.site_description || "独立出海人，分享最真实的实战经验。"}
            </p>
            <div className="flex justify-center gap-6 text-xs">
              <button onClick={() => navigate('/about')} className="hover:text-slate-900">关于我</button>
            </div>
          </div>
        </footer>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}
