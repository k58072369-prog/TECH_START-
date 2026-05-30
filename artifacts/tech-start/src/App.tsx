import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { parseLocation, routeToUrl, RouteState } from './lib/router';
import { getArticles, getCategories, getArticleBySlug } from './lib/supabase';
import { Article, Category } from './types';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import CategoriesSection from './components/CategoriesSection';
import FeaturedArticles from './components/FeaturedArticles';
import LatestArticles from './components/LatestArticles';
import AiToolsSection from './components/AiToolsSection';
import ArticleDetail from './components/ArticleDetail';
import AdminDashboard from './components/AdminDashboard';
import ToolDetail from './components/ToolDetail';
import AudioPlayer from './components/AudioPlayer';
import PrayerReminder from './components/PrayerReminder';
import PWAInstallPrompt from './components/PWAInstallPrompt';

export default function App() {
  const [route, setRoute] = useState<RouteState>(parseLocation());
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (route.path === 'home') {
      document.title = 'تيك ستارت | بوابتك للذكاء الاصطناعي والبرمجة';
    } else if (route.path === 'admin') {
      document.title = 'بوابة الإدارة | تيك ستارت';
    } else if (route.path === 'article' && activeArticle) {
      document.title = `${activeArticle.title} | تيك ستارت`;
    } else if (route.path === 'category') {
      document.title = `${route.slug} | تيك ستارت`;
    } else if (route.path === 'tool' && route.slug) {
      document.title = `الرابط الذكي | تيك ستارت`;
    }
  }, [route, activeArticle]);

  useEffect(() => {
    loadPlatformData();
  }, []);

  const loadPlatformData = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const [artList, catList] = await Promise.all([
        getArticles(),
        getCategories()
      ]);
      setArticles(artList);
      setCategories(catList);
    } catch (err) {
      console.error('Failed to wake up platform databases:', err);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (route.path === 'article' && route.slug) {
      setLoadingArticle(true);
      getArticleBySlug(route.slug).then((data) => {
        setActiveArticle(data);
        setLoadingArticle(false);
      });
    } else {
      setActiveArticle(null);
    }
  }, [route]);

  const handleNavigate = (newRoute: RouteState) => {
    const url = routeToUrl(newRoute);
    window.history.pushState(null, '', url);
    setRoute(newRoute);
  };

  const handleScrollToArticles = () => {
    const section = document.getElementById('latest-articles-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isAdminRoute = route.path === 'admin';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col justify-between selection:bg-blue-500/10 selection:text-blue-900">
      <Navbar currentRoute={route} onNavigate={handleNavigate} />

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {loading && !isAdminRoute ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[85vh] flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="relative h-16 w-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-blue-600/10" />
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-800 mb-1">تيك ستارت</h3>
              <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">جاري تشكيل البوابات الذكية...</p>
            </motion.div>
          ) : hasError ? (
            <motion.div
              key="error-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-32 text-center max-w-md mx-auto px-4"
            >
              <AlertCircle className="h-14 w-14 text-blue-500 mx-auto mb-4 animate-pulse" />
              <h2 className="font-display text-xl font-bold text-[#0f172a] mb-2">عقبة تقنية بالقاعدة السحابية</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                تعذر إرسال الطلبات إلى PostgreSQL وقنوات العتاد التقني. يرجى مراجعة إعدادات قاعدة البيانات وتأكيد مفاتيح الربط.
              </p>
              <button
                onClick={loadPlatformData}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                <RefreshCcw className="h-4 w-4" />
                تحديث ومزامنة الاتصال
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={route.path + (route.slug || '')}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {route.path === 'home' && (
                <div id="view-home">
                  <HeroSection onNavigate={handleNavigate} onScrollToArticles={handleScrollToArticles} />
                  <CategoriesSection categories={categories} onNavigate={handleNavigate} />
                  <FeaturedArticles articles={articles} onNavigate={handleNavigate} />
                  <LatestArticles articles={articles} categories={categories} onNavigate={handleNavigate} />
                  <AiToolsSection onNavigate={handleNavigate} />
                </div>
              )}

              {route.path === 'tool' && route.slug && (
                <div id="view-tool-detail">
                  <ToolDetail toolId={route.slug} onNavigate={handleNavigate} />
                </div>
              )}

              {route.path === 'article' && (
                <div id="view-article">
                  {loadingArticle ? (
                    <div className="py-40 text-center text-slate-500 font-mono">
                      <span>جاري سحب المستند التقني الفاخر...</span>
                    </div>
                  ) : activeArticle ? (
                    <ArticleDetail article={activeArticle} onNavigate={handleNavigate} />
                  ) : (
                    <div className="py-40 text-center">
                      <AlertCircle className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">المقال التقني المطلوب غير موجود حالياً.</p>
                      <button onClick={() => handleNavigate({ path: 'home' })} className="mt-4 text-xs font-bold text-blue-600">العودة للرئيسية</button>
                    </div>
                  )}
                </div>
              )}

              {route.path === 'category' && (
                <div id="view-category" className="pt-28 min-h-[70vh]">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="p-8 rounded-2xl border border-blue-600/10 bg-gradient-to-br from-white to-blue-50/20 mb-12 text-center md:text-right relative overflow-hidden shadow-sm">
                      <div className="absolute -top-12 -right-12 h-24 w-24 bg-blue-600/5 rounded-full blur-xl" />
                      <span className="text-xs font-bold text-blue-600 tracking-wider">تصفح التبويب التقني</span>
                      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0f172a] mt-1.5">{route.slug}</h1>
                      <p className="text-slate-500 text-xs sm:text-sm mt-2">عرض المقالات والشروحات والحلول المدرجة تحت تصنيف {route.slug}</p>
                    </div>
                    <LatestArticles
                      articles={articles}
                      categories={categories}
                      onNavigate={handleNavigate}
                    />
                  </div>
                </div>
              )}

              {route.path === 'admin' && (
                <div id="view-admin">
                  <AdminDashboard />
                </div>
              )}

              {route.path === '404' && (
                <div id="view-404" className="py-40 text-center max-w-md mx-auto px-4">
                  <div className="relative h-16 w-16 mb-4 mx-auto flex items-center justify-center bg-slate-100 border border-blue-100 rounded-xl">
                    <span className="font-display font-bold text-xl text-blue-600">404</span>
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-[#0f172a] mb-2">عذراً، الصفحة غير موجودة</h2>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                    الرابط الذي تنوي زيارته قد تم سحبه، أو ربما قمت بكتابة العنوان بشكل غير دقيق.
                  </p>
                  <button
                    onClick={() => handleNavigate({ path: 'home' })}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold cursor-pointer shadow-md"
                  >
                    <Home className="h-4 w-4" />
                    العودة لشاشة تيك ستارت الرئيسية
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer onNavigate={handleNavigate} />

      {/* Global floating overlays — not shown on admin */}
      {!isAdminRoute && (
        <>
          <AudioPlayer />
          <PrayerReminder />
          <PWAInstallPrompt />
        </>
      )}
    </div>
  );
}
