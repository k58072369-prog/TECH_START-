import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, BookOpen } from 'lucide-react';

const QURAN_SRC = '/audio/quran-fatiha.mp3';

interface QuranModalProps {
  onComplete: () => void;
}

export default function QuranModal({ onComplete }: QuranModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [visible, setVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio(QURAN_SRC);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('timeupdate', () => setProgress(audio.currentTime));

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      // Auto-close after a brief pause to let user register it finished
      setTimeout(handleClose, 800);
    });

    // Attempt autoplay
    audio.play()
      .then(() => setIsPlaying(true))
      .catch(() => setBlocked(true));

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const handleClose = () => {
    audioRef.current?.pause();
    setVisible(false);
    // Fire onComplete after exit animation
    setTimeout(onComplete, 500);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => { setIsPlaying(true); setBlocked(false); })
        .catch(() => setBlocked(true));
    }
  };

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  const formatTime = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Blur backdrop */}
          <motion.div
            key="quran-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            key="quran-modal"
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            dir="rtl"
          >
            <div className="pointer-events-auto w-full max-w-sm bg-white rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.25)] overflow-hidden border border-blue-100">
              {/* Gradient header band */}
              <div className="h-1.5 w-full bg-gradient-to-l from-emerald-500 via-teal-400 to-emerald-600" />

              <div className="px-8 py-8 text-center space-y-6" dir="rtl">
                {/* Emblem */}
                <div className="relative mx-auto h-20 w-20">
                  {/* Pulsing ring */}
                  {isPlaying && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-emerald-400/60"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-50 to-teal-100 border-2 border-emerald-200 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                    <BookOpen className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-emerald-500 tracking-widest uppercase font-mono">
                    القرآن الكريم
                  </span>
                  <h3
                    className="font-display text-xl font-extrabold text-[#0f172a]"
                    style={{ fontFamily: 'Tajawal, sans-serif' }}
                  >
                    سورة الفاتحة
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                </div>

                {/* Blocked notice */}
                {blocked && !isPlaying && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] text-amber-600 font-bold bg-amber-50 border border-amber-100 rounded-xl px-3 py-2"
                  >
                    المتصفح منع التشغيل التلقائي — اضغط الزر أدناه للاستماع
                  </motion.p>
                )}

                {/* Play / Pause button */}
                <div className="flex justify-center">
                  <button
                    onClick={togglePlay}
                    className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-[0_6px_20px_rgba(16,185,129,0.35)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  >
                    {isPlaying
                      ? <Pause className="h-6 w-6" />
                      : <Play className="h-6 w-6 ml-0.5" />
                    }
                  </button>
                </div>

                {/* Progress arc / bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-l from-emerald-500 to-teal-400 rounded-full"
                      style={{ width: `${pct}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 tabular-nums">
                    <span>{formatTime(duration - progress)}</span>
                    <span>{formatTime(progress)}</span>
                  </div>
                </div>

                {/* Skip / close */}
                <button
                  onClick={handleClose}
                  className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer underline underline-offset-2"
                >
                  تخطي والمتابعة للموقع
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
