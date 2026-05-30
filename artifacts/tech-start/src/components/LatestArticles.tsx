/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Clock, ArrowLeft, Search, Layers } from 'lucide-react';
import { Article, Category } from '../types';
import { RouteState } from '../lib/router';
import SmartImage from './SmartImage';

interface LatestArticlesProps {
  articles: Article[];
  categories: Category[];
  onNavigate: (route: RouteState) => void;
  initialCategory?: string;
}

function calculateReadingTime(content: string = ''): number {
  const words = content.trim().split(/\s+/).length || 0;
  const time = Math.ceil(words / 200);
  return time < 1 ? 1 : time;
}

export default function LatestArticles({ articles, categories, onNavigate, initialCategory }: LatestArticlesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortPref, setSortPref] = useState<'newest' | 'views'>('newest');

  // Sync filter when navigating to a different category route
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    // Read sorting from homepage custom settings if any
    const storedSettings = localStorage.getItem('tech_start_homepage_settings');
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        if (parsed.sortArticlesBy) setSortPref(parsed.sortArticlesBy);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  // Filtering & Sorting logic
  let processedArticles = [...articles];

  // 1. Filter by category & search
  processedArticles = processedArticles.filter((art) => {
    const matchesCategory =
      selectedCategory === 'all' || 
      art.category?.name === selectedCategory || 
      art.category_id === selectedCategory;
      
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // 2. Sort according to preference
  if (sortPref === 'views') {
    processedArticles.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else {
    processedArticles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return (
    <section id="latest-articles-section" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header and Search Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6 border-b border-blue-600/10 pb-8 text-right">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">المجلة والمدونة التقنية</span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight flex items-center justify-start gap-2 mt-1">
            <span>آخر الإضافات والشروحات</span>
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          </h2>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">تكنولوجيا ودروس متجددة على مدار الساعة ومحتوى مصفى بأعلى دقة ومعايير</p>
        </div>

        {/* Search bar wrapping */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-blue-600">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="ابحث عن مقال ومعرفة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm text-[#0f172a] pr-10 pl-4 py-3 rounded-xl bg-white border border-blue-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 focus:outline-none transition-all backdrop-blur-sm shadow-sm placeholder-slate-400"
          />
        </div>
      </div>

      {/* Category Filter Pills (Royal Luxury Blue Styling) - sorted by display_order */}
      <div className="flex flex-wrap items-center gap-2 mb-10 text-right">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 bg-white border border-blue-100 hover:text-blue-600 hover:bg-slate-50'
          }`}
        >
          كافة المقالات
        </button>
        {[...categories]
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          .map((cat, idx) => (
            <button
              key={cat.id || idx}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                selectedCategory === cat.name
                  ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(29,78,216,0.2)]'
                  : 'text-slate-600 bg-white border border-blue-100 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
      </div>

      {/* Articles Grid list */}
      <AnimatePresence mode="popLayout">
        {processedArticles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-16 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-blue-200 shadow-sm"
          >
            <Layers className="h-10 w-10 text-blue-600/40 mb-3 animate-bounce" />
            <p className="text-base font-bold text-slate-800">لم نجد أي نتائج مطابقة لبحثك في هذا الباب.</p>
            <button 
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-4 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              إعادة تهيئة عوامل التصفية
            </button>
          </motion.div>
        ) : (
          <motion.div 
            id="latest-grid"
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {processedArticles.map((art, idx) => {
              const readTime = calculateReadingTime(art.content);

              return (
                <motion.article
                  key={art.id || idx}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35 }}
                  whileHover={{ 
                    y: -8,
                    borderColor: "rgba(37, 99, 235, 0.45)",
                    boxShadow: "0 20px 30px -8px rgba(29, 78, 216, 0.25)"
                  }}
                  onClick={() => onNavigate({ path: 'article', slug: art.slug })}
                  className="group flex flex-col justify-between bg-white border border-blue-100/60 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-sm"
                >
                  <div>
                    {/* Cover image wrap */}
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-50">
                      <SmartImage
                        src={art.cover_image}
                        alt={art.title}
                        name={art.title}
                        fallbackType="cover"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Category Badge overlay */}
                      {art.category?.name && (
                        <span className="absolute top-3.5 right-3.5 px-3 py-1 text-[10px] font-extrabold rounded-md bg-slate-900 text-white border border-blue-600/20 shadow-md">
                          {art.category.name}
                        </span>
                      )}
                    </div>

                    {/* Meta and titles */}
                    <div className="p-6 text-right">
                      <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400 mb-3 flex-row-reverse sm:flex-row">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-blue-600" />
                          {art.views || 0} مشاهدة
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-blue-600" />
                          {readTime} دقائق قراءة
                        </span>
                      </div>
                      
                      <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                        {art.title}
                      </h3>
                      
                      <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3 font-sans font-medium">
                        {art.excerpt}
                       </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-3 border-t border-blue-50 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-blue-600 transition-colors text-right">
                    <span>اقرأ المقالة الكاملة</span>
                    <ArrowLeft className="h-4 w-4 group-hover:translate-x-[-4px] transition-transform text-blue-600" />
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
