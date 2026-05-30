/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Landmark } from 'lucide-react';
import { RouteState } from '../lib/router';
import { Category } from '../types';
import { getCategories } from '../lib/supabase';

interface NavbarProps {
  currentRoute: RouteState;
  onNavigate: (route: RouteState) => void;
}

export default function Navbar({ currentRoute, onNavigate }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Load categories for navbar dropdown/links
    getCategories().then((data) => setCategories(data));

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'الرئيسية', route: { path: 'home' } },
    ...categories.map((cat) => ({
      name: cat.name,
      route: { path: 'category', slug: cat.name },
    })),
  ];

  const handleItemClick = (route: RouteState) => {
    onNavigate(route);
    setIsOpen(false);
  };

  return (
    <header
      id="main-nav-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-blue-600/15 py-3.5 shadow-[0_10px_35px_rgba(29,78,216,0.05)]'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo with elegant royal blue emblem */}
          <div 
            id="logo-brand" 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleItemClick({ path: 'home' })}
          >
            <div className="relative">
              {/* Royal blue pulsing ring */}
              <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-11 w-11 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-blue-600 flex items-center justify-center shadow-[0_4px_12px_rgba(29,78,216,0.2)]">
                <Landmark className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            {/* Elegant luxury brand name with professional decorative ornaments, royal blue themes and animations */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col text-right relative select-none pr-3 border-r-2 border-blue-600/35"
            >
              {/* Luxury gold/blue micro decorative dot ornament */}
              <div className="absolute top-1 right-[-4px] h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(29,78,216,0.8)] animate-pulse" />
              
              <div className="flex items-center gap-1.5">
                <span className="font-display text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-none drop-shadow-[0_2px_4px_rgba(29,78,216,0.06)] relative group-hover:text-blue-700 transition-colors duration-300">
                  تـيـك
                  <span className="relative inline-block text-blue-600 mr-1.5">
                    سـتـارت
                    {/* Royal blue breathing glow effect */}
                    <span className="absolute -inset-1 rounded bg-blue-600/5 blur-sm opacity-70 group-hover:opacity-100 transition-opacity duration-300 scale-105" />
                  </span>
                </span>
              </div>
              
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[8px] sm:text-[9.5px] text-slate-400 font-mono tracking-[0.25em] font-bold uppercase">
                  TECH <span className="text-blue-500 font-extrabold">START</span>
                </span>
                <span className="h-1 w-8 bg-gradient-to-l from-blue-600/60 to-transparent rounded-full" />
              </div>
            </motion.div>
          </div>

          {/* Desktop Navigation Links */}
          <nav id="desktop-nav" className="hidden md:flex items-center gap-1.5 bg-white/60 p-1 rounded-full border border-blue-600/10 backdrop-blur-sm">
            {navItems.map((item, idx) => {
              const isActive =
                item.route.path === currentRoute.path &&
                (!item.route.slug || item.route.slug === currentRoute.slug);

              return (
                <button
                  key={idx}
                  onClick={() => handleItemClick(item.route)}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-slate-900 to-blue-700 shadow-[0_4px_15px_rgba(29,78,216,0.25)]'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/50'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Right spacer for desktop alignment */}
          <div className="hidden md:block w-36" />

          {/* Mobile hamburger menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-white border border-blue-100 text-slate-600 hover:text-slate-950 focus:outline-none cursor-pointer shadow-sm"
            >
              {isOpen ? <X className="h-5 w-5 text-blue-600" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Slide Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-b border-blue-100 shadow-xl"
          >
            <div className="px-4 pt-2.5 pb-6 space-y-2">
              {navItems.map((item, idx) => {
                const isActive =
                  item.route.path === currentRoute.path &&
                  (!item.route.slug || item.route.slug === currentRoute.slug);

                return (
                  <button
                    key={idx}
                    onClick={() => handleItemClick(item.route)}
                    className={`w-full text-right px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600 pr-3'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
