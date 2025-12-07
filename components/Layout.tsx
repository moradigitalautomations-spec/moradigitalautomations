import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';
import { Button } from './UI';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-navy-900/90 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="text-2xl font-serif font-bold text-slate-100 tracking-tight">MORA<span className="text-gold-500">.</span></Link>
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `text-sm uppercase tracking-widest transition-colors hover:text-gold-400 ${isActive ? 'text-gold-500 font-medium' : 'text-slate-300'}`}>{item.label}</NavLink>
          ))}
          <Button to="/contact" variant="primary" className="!py-2 !px-6 !text-xs">Get Started</Button>
        </div>
      </div>
    </nav>
  );
};

export const Footer: React.FC = () => (
  <footer className="bg-navy-900 border-t border-white/5 py-12">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Mora Digital Automations. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar /><main className="flex-grow pt-20">{children}</main><Footer />
  </div>
);
