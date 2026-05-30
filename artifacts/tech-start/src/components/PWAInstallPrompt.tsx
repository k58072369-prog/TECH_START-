import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or already installed
    if (localStorage.getItem('pwa_install_dismissed')) return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a short delay
      setTimeout(() => setVisible(true), 4000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem('pwa_install_dismissed', '1');
  };

  if (dismissed || !visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="fixed bottom-6 right-6 z-40 max-w-[320px] w-full"
          dir="rtl"
        >
          <div className="bg-white rounded-2xl border border-blue-100 shadow-[0_15px_50px_rgba(29,78,216,0.15)] overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-l from-blue-600 to-sky-400" />

            <div className="p-5 space-y-4">
              <button
                onClick={handleDismiss}
                className="absolute top-3 left-3 h-6 w-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 cursor-pointer transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-700 flex items-center justify-center shadow-md shrink-0">
                  <Download className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-extrabold text-slate-900">تثبيت تيك ستارت</h4>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    يمكنك تثبيت المنصة على جهازك للوصول السريع
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 text-white text-xs font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm cursor-pointer"
                >
                  تثبيت الآن
                </button>
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-2.5 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-all border border-slate-100 cursor-pointer"
                >
                  لاحقاً
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
