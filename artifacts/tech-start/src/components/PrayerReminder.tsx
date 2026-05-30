import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star } from 'lucide-react';

const SALAH_AUDIO_SRC = '/audio/salah-reminder.mp3';
const SHOWN_KEY = 'tech_start_prayer_shown_session';

export default function PrayerReminder() {
  const [visible, setVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem(SHOWN_KEY)) return;

    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem(SHOWN_KEY, '1');

      // Play reminder audio
      const audio = new Audio(SALAH_AUDIO_SRC);
      audio.volume = 0.7;
      audioRef.current = audio;
      audio.play().catch(() => {});
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    audioRef.current?.pause();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            dir="rtl"
          >
            <div className="pointer-events-auto relative max-w-sm w-full bg-white rounded-3xl shadow-[0_25px_80px_rgba(29,78,216,0.2)] overflow-hidden border border-blue-100">
              {/* Top gradient band */}
              <div className="h-1.5 w-full bg-gradient-to-l from-blue-600 via-sky-400 to-blue-600 animate-pulse" />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 left-4 h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              {/* Content */}
              <div className="px-8 py-8 text-center space-y-5">
                {/* Star ring emblem */}
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-blue-50 to-sky-100 border-2 border-blue-100 flex items-center justify-center shadow-[0_0_30px_rgba(29,78,216,0.1)]">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Star className="h-7 w-7 text-blue-600 fill-blue-100" />
                  </motion.div>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-blue-500 tracking-widest uppercase font-mono">
                    تذكير روحاني
                  </span>
                  <h3 className="font-display text-lg sm:text-xl font-extrabold text-[#0f172a]">
                    تذكير بالصلاة على النبي ﷺ
                  </h3>
                </div>

                {/* Prayer text */}
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-2xl px-6 py-5">
                  <p
                    className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed"
                    style={{ fontFamily: 'Tajawal, sans-serif' }}
                  >
                    اللهم صلِّ وسلِّم وبارك على سيدنا محمد ﷺ
                  </p>
                  <p className="text-xs text-slate-400 mt-2 font-medium">
                    وعلى آله وصحبه أجمعين
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-2xl bg-gradient-to-l from-blue-600 to-blue-700 text-white text-sm font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-[0_6px_20px_rgba(29,78,216,0.25)] cursor-pointer"
                >
                  اللهم صلِّ عليه 💙
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
