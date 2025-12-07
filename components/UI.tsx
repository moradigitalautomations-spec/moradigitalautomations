import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  to?: string;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', to, className = '', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center px-8 py-3 text-sm font-medium tracking-wide transition-all duration-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 focus:ring-offset-navy-900 uppercase";
  const variants = {
    primary: "bg-gradient-to-r from-gold-600 to-gold-400 text-navy-900 hover:from-gold-500 hover:to-gold-300 shadow-lg shadow-gold-900/20",
    secondary: "bg-navy-800 text-gold-400 border border-gold-600/30 hover:bg-navy-700 hover:border-gold-500",
    outline: "bg-transparent border border-white/20 text-slate-200 hover:bg-white/5 hover:border-white/40"
  };
  const combinedClasses = `${baseStyles} ${variants[variant]} ${className}`;

  if (to) return <Link to={to} className={combinedClasses}>{children}</Link>;
  return <button className={combinedClasses} {...props}>{children}</button>;
};

export const Input: React.FC<any> = ({ label, error, className = '', ...props }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">{label} {props.required && <span className="text-gold-500">*</span>}</label>
    <input className={`bg-navy-800/50 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-sm px-4 py-3 text-slate-100 placeholder-slate-600 focus:border-gold-500 focus:outline-none transition-colors`} {...props} />
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
);

export const Select: React.FC<any> = ({ label, options, error, placeholder, className = '', ...props }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">{label} {props.required && <span className="text-gold-500">*</span>}</label>
    <select className={`w-full bg-navy-800/50 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-sm px-4 py-3 text-slate-100 focus:border-gold-500 focus:outline-none`} {...props}>
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map((opt: string) => <option key={opt} value={opt} className="bg-navy-900 text-slate-200">{opt}</option>)}
    </select>
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
);

export const Textarea: React.FC<any> = ({ label, error, className = '', ...props }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">{label} {props.required && <span className="text-gold-500">*</span>}</label>
    <textarea className={`bg-navy-800/50 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-sm px-4 py-3 text-slate-100 placeholder-slate-600 focus:border-gold-500 focus:outline-none min-h-[120px]`} {...props} />
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-navy-800/40 backdrop-blur-sm border border-white/5 p-6 md:p-8 hover:border-gold-500/30 transition-all duration-300 ${className}`}>{children}</div>
);

export const SectionHeading: React.FC<{ title: string; subtitle?: string; align?: 'left' | 'center' }> = ({ title, subtitle, align = 'center' }) => (
  <div className={`mb-16 ${align === 'center' ? 'text-center' : 'text-left'}`}>
    {subtitle && <span className="text-gold-500 uppercase tracking-[0.2em] text-sm font-semibold mb-3 block">{subtitle}</span>}
    <h2 className="text-4xl md:text-5xl font-serif text-slate-100 leading-tight">{title}</h2>
    <div className={`mt-6 h-1 w-20 bg-gold-500 ${align === 'center' ? 'mx-auto' : ''}`}></div>
  </div>
);
