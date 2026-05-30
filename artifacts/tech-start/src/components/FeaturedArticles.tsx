/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Eye, Clock, ArrowLeft, Bookmark } from 'lucide-react';
import { Article } from '../types';
import { RouteState } from '../lib/router';
import SmartImage from './SmartImage';

interface FeaturedArticlesProps {
  articles: Article[];
  onNavigate: (route: RouteState) => void;
}

// Simple heuristic to calculate Arabic reading time
function calculateReadingTime(content: string = ''): number {
  const words = content.trim().split(/\s+/).length || 0;
  const time = Math.ceil(words / 200); // ~200 words per minute
  return time < 1 ? 1 : time;
}

export default function FeaturedArticles({ articles, onNavigate }: FeaturedArticlesProps) {
  const featured = articles.filter(a => a.featured);

  if (featured.length === 0) return null;

  return (
    <section id="featured-articles-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-baseline justify-between mb-10 text-right">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">توصيات النخبة</span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight flex items-center justify-start gap-2 mt-1">
            <span>مقالات متميزة وموصى بها</span>
            <Bookmark className="h-5 w-5 text-blue-600 animate-pulse" />
          </h2>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">تحليلات معمقة وقراءات حصرية يوصي بها خبراؤنا ومحررونا</p>
        </div>
      </div>

      {/* Main Grid with white/blue tint border panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {featured.map((art, idx) => {
          const readTime = calculateReadingTime(art.content);
          
          return (
            <motion.div
              key={art.id || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ 
                y: -5,
                borderColor: "rgba(29, 78, 216, 0.25)",
                boxShadow: "0 15px 35px rgba(29, 78, 216, 0.05)"
              }}
              onClick={() => onNavigate({ path: 'article', slug: art.slug })}
              className="group relative flex flex-col sm:flex-row bg-white border border-blue-100/60 rounded-2xl overflow-hidden cursor-pointer transition-all shadow-sm"
            >
              
              {/* Highlight Elegant Blue Ribbon Line */}
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-blue-600 via-sky-400 to-transparent" />

              {/* Cover Image Container */}
              <div className="relative sm:w-2/5 h-48 sm:h-auto overflow-hidden bg-slate-50">
                <SmartImage
                  src={art.cover_image}
                  alt={art.title}
                  name={art.title}
                  fallbackType="cover"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Category Badge overlay on image */}
                {art.category?.name && (
                  <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-extrabold tracking-wide rounded-md bg-slate-900 text-white border border-blue-600/20 shadow-md">
                    {art.category.name}
                  </span>
                )}
              </div>

              {/* Text metadata block */}
              <div className="p-6 sm:w-3/5 flex flex-col justify-between text-right">
                <div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3 font-sans font-medium">
                    {art.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-blue-50 flex items-center justify-between text-[11px] font-mono text-slate-400 flex-row-reverse sm:flex-row">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-blue-600" />
                      {art.views || 0} مشاهدة
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      {readTime} دقيقة قراءة
                    </span>
                  </div>
                  
                  <span className="text-blue-600 group-hover:translate-x-[-4px] transition-transform flex items-center gap-0.5 font-bold">
                    اقرأ المقال
                    <ArrowLeft className="h-3 w-3 text-blue-600" />
                  </span>
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
