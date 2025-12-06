import React, { useState, useEffect, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Twitter, Youtube, Instagram, Menu, X, ChevronRight, User, LogOut } from 'lucide-react';
import Button from './Button';
import { useConfig } from '../contexts/ConfigContext';

const NAV_ITEMS = [
  { id: 'shopify', label: 'Shopify建站', path: '/topic/shopify' },
  { id: 'tiktok-live', label: 'TikTok直播', path: '/topic/tiktok-live' },
  { id: 'tiktok-shop', label: 'TikTok小店', path: '/topic/tiktok-shop' },
  { id: 'tiktok-ops', label: 'TikTok运营/投放', path: '/topic/tiktok-ops' },
  { id: 'facebook', label: 'Facebook投放', path: '/topic/facebook' },
  { id: 'about', label: '关于Ekko', path: '/about' }
];

const Navbar = memo(({ user, onLoginClick, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { config } = useConfig();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const userInitial = user?.name ? user.name[0].toUpperCase() : 'U';
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer group shrink-0 z-50 relative">
            {config.site_logo ? (
              <img src={config.site_logo} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl shadow-lg transition-transform group-hover:scale-110 ${
                scrolled || mobileMenuOpen ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
              }`}>
                E
              </div>
            )}
            <div className="flex flex-col">
              <span className={`text-xl font-black leading-none transition-colors ${
                scrolled || mobileMenuOpen ? 'text-slate-900' : 'text-white'
              }`}>
                {config.site_title || 'Ekko'}
              </span>
              <span className={`text-[10px] font-medium tracking-wider uppercase transition-colors ${
                scrolled || mobileMenuOpen ? 'text-slate-500' : 'text-white/80'
              }`}>
                Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive(item.path)
                    ? (scrolled ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-white/20 text-white font-bold')
                    : (scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white/90 hover:bg-white/10')
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <div className={`flex items-center gap-3 pr-4 border-r ${scrolled ? 'border-slate-200' : 'border-white/20'}`}>
              <Twitter size={18} className={`cursor-pointer transition-colors ${scrolled ? 'text-slate-400 hover:text-blue-400' : 'text-white/70 hover:text-white'}`} />
              <Youtube size={20} className={`cursor-pointer transition-colors ${scrolled ? 'text-slate-400 hover:text-red-500' : 'text-white/70 hover:text-white'}`} />
              <Instagram size={18} className={`cursor-pointer transition-colors ${scrolled ? 'text-slate-400 hover:text-pink-500' : 'text-white/70 hover:text-white'}`} />
            </div>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs border border-white">
                  {userInitial}
                </div>
                <button onClick={onLogout} className={`text-sm font-medium hover:underline ${scrolled ? 'text-slate-600' : 'text-white'}`}>
                  退出
                </button>
              </div>
            ) : (
              <Button 
                variant={scrolled ? 'primary' : 'secondary'} 
                className="px-5 py-2 text-sm h-9 min-h-0" 
                onClick={onLoginClick}
              >
                登录
              </Button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="lg:hidden z-50">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="text-slate-900" size={24} />
              ) : (
                <Menu className={scrolled ? 'text-slate-900' : 'text-white'} size={24} />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Side Drawer */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
        mobileMenuOpen ? 'visible' : 'invisible delay-300'
      }`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer */}
        <div className={`absolute top-0 right-0 w-[280px] h-full bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="pt-24 px-6 pb-6 flex-1 overflow-y-auto">
            {/* User Info (Mobile) */}
            <div className="mb-8 p-4 bg-slate-50 rounded-2xl">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                    {userInitial}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{user.name}</div>
                    <button onClick={onLogout} className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <LogOut size={12} /> 退出登录
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-slate-500 text-sm mb-3">登录以开始学习</p>
                  <Button variant="primary" className="w-full justify-center" onClick={() => {
                    setMobileMenuOpen(false);
                    onLoginClick();
                  }}>
                    立即登录
                  </Button>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                  {isActive(item.path) && <ChevronRight size={16} />}
                </Link>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex justify-center gap-6 text-slate-400">
                <Twitter size={20} />
                <Youtube size={20} />
                <Instagram size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default Navbar;