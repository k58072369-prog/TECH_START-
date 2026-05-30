/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Cpu, Terminal, Sparkles, AlertCircle, BookOpen, ChevronLeft } from 'lucide-react';
import { Category } from '../types';
import { RouteState } from '../lib/router';

interface CategoriesSectionProps {
  categories: Category[];
  onNavigate: (route: RouteState) => void;
}

// Function to choose suitable icon based on category name
function getCategoryIcon(name: string) {
  switch (name) {
    case 'الذكاء الاصطناعي':
      return <Cpu className="h-6 w-6 text-blue-600" />;
    case 'البرمجة':
      return <Terminal className="h-6 w-6 text-blue-600" />;
    case 'الأدوات التقنية':
      return <Sparkles className="h-6 w-6 text-blue-600" />;
    case 'الشروحات':
      return <BookOpen className="h-6 w-6 text-blue-600" />;
    default:
      return <Cpu className="h-6 w-6 text-blue-500" />;
  }
}

// Function to choose suitable background gradient
function getCategoryGradient(name: string) {
  return 'from-white to-blue-50/10 hover:border-blue-600/30 hover:shadow-[0_12px_35px_rgba(29,78,216,0.04)]';
}

export default function CategoriesSection({ categories, onNavigate }: CategoriesSectionProps) {
  // Sort categories by their priority order (display_order)
  const sortedCategories = [...categories].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return (
    <section id="categories-grid-section" className="py-24 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Segment Header */}
      <div className="flex flex-col sm:flex-row items-baseline justify-between mb-14 gap-3 text-right">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">تخصصاتنا الفكرية</span>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight flex items-center gap-2 mt-1.5">
            <span>التخصصات والمجالات الفاخرة</span>
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
          </h2>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">استكشف مقالاتنا المصنفة طبقاً لأقوى مجالات التطور والريادة الرقمية</p>
        </div>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500 text-center rounded-2xl border border-dashed border-blue-200">
          <AlertCircle className="h-12 w-12 text-blue-600 animate-bounce mb-3" />
          <p>لم نجد أي تصنيفات مسجلة حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedCategories.map((cat, idx) => (
            <motion.div
              key={cat.id || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ 
                y: -6,
                borderColor: "rgba(29, 78, 216, 0.4)"
              }}
              onClick={() => onNavigate({ path: 'category', slug: cat.name })}
              className={`group relative p-6 rounded-2xl flex flex-col justify-between h-48 cursor-pointer border border-blue-600/10 transition-all overflow-hidden bg-gradient-to-br ${getCategoryGradient(cat.name)}`}
            >
              {/* Optional category back image overlay with subtle opacity */}
              {cat.image && (
                <div 
                  className="absolute inset-0 z-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity bg-cover bg-center" 
                  style={{ backgroundImage: `url(${cat.image})` }}
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Icon Container */}
              <div className="relative z-10 p-3 h-12 w-12 rounded-full bg-white border border-blue-600/15 flex items-center justify-center group-hover:scale-110 transition-all shadow-sm">
                {getCategoryIcon(cat.name)}
              </div>

              {/* Title & Stats */}
              <div className="relative z-10">
                <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                  {cat.name}
                </h3>
                <span className="text-xs text-slate-500 mt-1.5 flex items-center gap-1 group-hover:text-[#0f172a] transition-colors font-medium">
                  تصفح المقالات والدروس والملفات
                  <ChevronLeft className="h-3 w-3 group-hover:translate-x-[-3px] transition-transform text-blue-600" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
