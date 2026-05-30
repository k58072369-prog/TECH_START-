import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RouteState } from '../lib/router';

interface NavbarProps {
  currentRoute: RouteState;
  onNavigate: (route: RouteState) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      id="main-nav-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-blue-600/10 py-3 shadow-[0_8px_30px_rgba(29,78,216,0.06)]'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <motion.button
          initial={{ opacity: 0, y: -18, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => onNavigate({ path: 'home' })}
          className="group relative select-none cursor-pointer focus:outline-none"
          aria-label="تيك ستارت - الرئيسية"
        >
          {/* Ambient glow halo behind name */}
          <span className="absolute inset-0 rounded-2xl bg-blue-600/5 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="relative flex flex-col items-center gap-0.5">
            {/* Main platform name */}
            <div className="flex items-baseline gap-2 leading-none">
              <motion.span
                className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight group-hover:text-blue-700 transition-colors duration-400"
                style={{ fontFamily: 'Alexandria, Tajawal, sans-serif' }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                تـيـك
              </motion.span>

              <motion.span
                className="relative font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight"
                style={{ fontFamily: 'Alexandria, Tajawal, sans-serif' }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-600 via-blue-500 to-sky-500">
                  سـتـارت
                </span>
                {/* Glow shimmer line under word */}
                <motion.span
                  className="absolute -bottom-1 right-0 left-0 h-0.5 rounded-full bg-gradient-to-l from-blue-600/70 to-sky-400/30"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                  style={{ transformOrigin: 'right center' }}
                />
              </motion.span>
            </div>

            {/* Elegant subtitle tagline */}
            <motion.div
              className="flex items-center gap-2 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <span className="h-px w-8 bg-gradient-to-l from-blue-600/50 to-transparent rounded-full" />
              <span className="text-[9px] sm:text-[10px] font-mono font-extrabold tracking-[0.3em] text-slate-400 uppercase">
                TECH <span className="text-blue-500">START</span>
              </span>
              <span className="h-px w-8 bg-gradient-to-r from-blue-600/50 to-transparent rounded-full" />
            </motion.div>
          </div>

          {/* Animated pulsing dot accent */}
          <motion.span
            className="absolute -top-1 -left-2 h-2 w-2 rounded-full bg-blue-600"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(29,78,216,0.7)',
                '0 0 0 6px rgba(29,78,216,0)',
                '0 0 0 0 rgba(29,78,216,0)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.button>
      </div>
    </header>
  );
}
