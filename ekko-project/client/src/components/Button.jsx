import React, { memo } from 'react';

const Button = memo(({ children, variant = 'primary', className, onClick, icon: Icon }) => {
  const baseStyle = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-slate-900 text-white shadow-lg shadow-slate-500/30 hover:-translate-y-0.5 hover:bg-slate-800",
    secondary: "bg-white text-slate-800 border border-slate-200 hover:border-slate-400 hover:bg-slate-50 shadow-sm",
    outline: "border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm",
  };
  
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant] || variants.primary} ${className || ''}`}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
});

export default Button;
