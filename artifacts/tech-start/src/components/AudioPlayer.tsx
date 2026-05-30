import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react';

const QURAN_AUDIO_SRC = '/audio/quran-fatiha.mp3';
const STORAGE_KEY = 'tech_start_quran_audio';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [autoPlayBlocked, setAutoPlayBlocked] = useState(false);
  const [visible, setVisible] = useState(false);

  // Custom audio source from admin settings
  const [audioSrc, setAudioSrc] = useState(QURAN_AUDIO_SRC);

  useEffect(() => {
    // Check if admin set a custom audio URL
    try {
      const settings = localStorage.getItem(STORAGE_KEY);
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.url) setAudioSrc(parsed.url);
      }
    } catch (_) {}

    // Show player after brief delay
    const showTimer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    const audio = new Audio(audioSrc);
    audio.loop = false;
    audio.volume = 0.65;
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setProgress(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(0);
    });

    // Attempt auto-play
    audio.play().then(() => {
      setIsPlaying(true);
      setAutoPlayBlocked(false);
    }).catch(() => {
      setAutoPlayBlocked(true);
      setIsPlaying(false);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioSrc]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
        setAutoPlayBlocked(false);
      }).catch(() => setAutoPlayBlocked(true));
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (s: number) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 80, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="fixed bottom-6 left-6 z-40 font-sans"
        dir="rtl"
      >
        <div className="bg-white border border-blue-100 rounded-2xl shadow-[0_15px_50px_rgba(29,78,216,0.12)] overflow-hidden min-w-[220px] max-w-[260px]">
          {/* Header bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-l from-blue-600/5 to-transparent border-b border-blue-50">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
            >
              {isCollapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-[11px] font-extrabold text-slate-700 tracking-wide">سورة الفاتحة</span>
              <span className="text-[9px] text-blue-600 font-bold">القرآن الكريم</span>
            </div>
          </div>

          {/* Collapsible body */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="px-4 py-3 space-y-3"
              >
                {/* Auto-play blocked notice */}
                {autoPlayBlocked && !isPlaying && (
                  <p className="text-[10px] text-amber-600 font-bold text-center bg-amber-50 rounded-lg px-2 py-1.5 border border-amber-100">
                    المتصفح منع التشغيل التلقائي — اضغط تشغيل
                  </p>
                )}

                {/* Controls */}
                <div className="flex items-center gap-3 justify-center">
                  <button
                    onClick={toggleMute}
                    className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>

                  <button
                    onClick={togglePlay}
                    className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-[0_4px_15px_rgba(29,78,216,0.3)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                  </button>

                  <span className="text-[10px] font-mono text-slate-400 tabular-nums w-10 text-left">
                    {formatTime(progress)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-l from-blue-600 to-sky-400 rounded-full"
                    style={{ width: duration > 0 ? `${(progress / duration) * 100}%` : '0%' }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
