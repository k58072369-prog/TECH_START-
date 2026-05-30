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
          ? 'bg-white/95 backdrop-blur-md border-b border-blue-600/10 py-2 shadow-[0_8px_30px_rgba(29,78,216,0.06)]'
          : 'bg-transparent py-3'
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
          <motion.img
            src="/logo.png"
            alt="TechStart Academy"
            className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-[0_4px_16px_rgba(29,78,216,0.18)] group-hover:drop-shadow-[0_6px_24px_rgba(29,78,216,0.30)] transition-all duration-400"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          />
        </motion.button>
      </div>
    </header>
  );
}
