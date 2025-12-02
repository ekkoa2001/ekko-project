import React, { useState, useEffect, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Twitter, Youtube, Instagram, Menu, X } from 'lucide-react';
import Button from './Button';

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const userInitial = user?.name ? user.name[0].toUpperCase() : 'U';

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 cursor-pointer group shrink-0">
          <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">E</div>
          <div className="flex flex-col">
            <span className={`text-xl font-black leading-none ${scrolled ? 'text-slate-900' : 'text-slate-900 lg:text-white'}`}>Ekko</span>
            <span className={`text-[10px] font-medium tracking-wider uppercase ${scrolled ? 'text-slate-500' : 'text-slate-500 lg:text-white/80'}`}>Studio</span>
          </div>
        </Link>

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

        <div className="hidden md:flex items-center gap-4 shrink-0">
          <div className={`flex items-center gap-3 pr-4 border-r ${scrolled ? 'border-slate-200' : 'border-white/20'}`}>
            <Twitter size={18} className={`cursor-pointer transition-colors ${scrolled ? 'text-slate-400 hover:text-blue-400' : 'text-white/70 hover:text-white'}`} />
            <Youtube size={20} className={`cursor-pointer transition-colors ${scrolled ? 'text-slate-400 hover:text-red-500' : 'text-white/70 hover:text-white'}`} />
            <Instagram size={18} className={`cursor-pointer transition-colors ${scrolled ? 'text-slate-400 hover:text-pink-500' : 'text-white/70 hover:text-white'}`} />
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs border border-white">{userInitial}</div>
              <button onClick={onLogout} className={`text-sm font-medium hover:underline ${scrolled ? 'text-slate-600' : 'text-white'}`}>退出</button>
            </div>
          ) : (
            <Button variant={scrolled ? 'primary' : 'secondary'} className="px-5 py-2 text-sm h-9 min-h-0" onClick={onLoginClick}>登录</Button>
          )}
        </div>

        <div className="lg:hidden text-slate-800">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className={scrolled ? 'text-slate-900' : 'text-white'} /> : <Menu className={scrolled ? 'text-slate-900' : 'text-white'} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-slate-100 p-4 flex flex-col gap-2">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-left px-4 py-3 rounded-xl font-medium ${
                isActive(item.path) ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
});

export default Navbar;
