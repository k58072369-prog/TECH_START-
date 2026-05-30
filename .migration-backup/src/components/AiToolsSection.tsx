/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpLeft, Sparkles, Search, SlidersHorizontal, Eye, Star, Trophy } from 'lucide-react';
import { AI_TOOLS } from '../data/aiTools';
import { AiTool } from '../types';
import { RouteState } from '../lib/router';
import SmartImage from './SmartImage';

interface AiToolsSectionProps {
  onNavigate: (route: RouteState) => void;
}

export default function AiToolsSection({ onNavigate }: AiToolsSectionProps) {
  const [originalTools, setOriginalTools] = useState<AiTool[]>([]);
  const [filteredTools, setFilteredTools] = useState<AiTool[]>([]);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [sortingOption, setSortingOption] = useState<'featured' | 'popularity' | 'newest'>('featured');

  useEffect(() => {
    // Collect customized links (tools) from localstorage or use AI_TOOLS as fallback
    let fetchedTools: AiTool[] = [];
    try {
      const stored = localStorage.getItem('tech_start_custom_links');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (parsed.length < 45) {
            // Keep user-created custom tools but upgrade default ones to our new 50 tools
            const userCustoms = parsed.filter(pt => !AI_TOOLS.some(at => at.id === pt.id));
            const merged = [...AI_TOOLS, ...userCustoms];
            localStorage.setItem('tech_start_custom_links', JSON.stringify(merged));
            fetchedTools = merged;
          } else {
            fetchedTools = parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Error reading custom links', e);
    }

    if (fetchedTools.length === 0) {
      fetchedTools = AI_TOOLS;
      localStorage.setItem('tech_start_custom_links', JSON.stringify(AI_TOOLS));
    }

    setOriginalTools(fetchedTools);
  }, []);

  // Filter & Sort Pipeline
  useEffect(() => {
    // 1. Exclude hidden tools for public visitors!
    let output = originalTools.filter(t => !t.hidden);

    // 2. Class filter
    if (selectedCategory !== 'الكل') {
      output = output.filter(t => t.category === selectedCategory);
    }

    // 3. Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      output = output.filter(t => 
        t.name.toLowerCase().includes(q) || 
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q))
      );
    }

    // 4. Sorting logic
    if (sortingOption === 'popularity') {
      // Sort by Views descending
      output.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    } else if (sortingOption === 'newest') {
      // Sort by display order reverse or ID sorting as fallback to represent order
      output.sort((a,b) => (b.display_order ?? 0) - (a.display_order ?? 0));
    } else if (sortingOption === 'featured') {
      // Sort featured first, then by display order
      output.sort((a, b) => {
        const featA = a.featured ? 1 : 0;
        const featB = b.featured ? 1 : 0;
        if (featA !== featB) return featB - featA;
        return (a.display_order ?? 999) - (b.display_order ?? 999);
      });
    }

    setFilteredTools(output);
  }, [originalTools, searchQuery, selectedCategory, sortingOption]);

  const categories = [
    'الكل',
    'الدردشة والكتابة',
    'إنشاء الصور',
    'إنشاء الفيديو',
    'الصوتيات',
    'البرمجة',
    'الإنتاجية',
    'التسويق',
    'التعليم',
    'التصميم',
    'أدوات متنوعة'
  ];

  return (
    <section id="smart-links-directory" className="py-24 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right overflow-hidden">
      
      {/* Premium subtle background royal gradient lights */}
      <div className="absolute right-0 top-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute left-0 bottom-1/4 w-[350px] h-[350px] bg-sky-400/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header description */}
      <div className="text-center sm:text-right mb-16 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-3">
          <Trophy className="h-3.5 w-3.5" />
          <span>الأدلة التقنية الفخمة</span>
        </div>
        <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-2.5">
          <span>الروابط الذكية للذكاء الاصطناعي</span>
          <Sparkles className="h-6 w-6 text-blue-600 animate-pulse shrink-0" />
        </h2>
        <p className="text-slate-500 mt-3 text-sm sm:text-base font-sans font-medium max-w-2xl">
          أكبر كتالوج للمواقع والحلول والتنفيذ البرمجي لرواد الغد الرقميين، مصنفة ومنقاة بعناية.
        </p>
      </div>

      {/* Control Station: Search input, Category tabs, sorting */}
      <div className="bg-white border border-blue-100/60 p-6 sm:p-8 rounded-3xl shadow-sm mb-12 relative z-10 space-y-6">
        
        {/* Row 1: Search and sorting */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن أداة ذكية... (مثال: ChatGPT, Midjourney)"
              className="w-full pl-4 pr-11 py-3.5 rounded-2xl bg-slate-50 border border-blue-50 text-sm text-[#0f172a] focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all text-right font-medium placeholder-slate-400"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort Controller */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <SlidersHorizontal className="h-4 w-4 text-blue-600" />
              ترتيب وعرض الروابط:
            </span>
            <div className="inline-flex rounded-xl bg-slate-50 p-1 border border-slate-100">
              <button
                onClick={() => setSortingOption('featured')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  sortingOption === 'featured'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                الموصى بها
              </button>
              <button
                onClick={() => setSortingOption('popularity')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  sortingOption === 'popularity'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                الأكثر شعبية
              </button>
              <button
                onClick={() => setSortingOption('newest')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  sortingOption === 'newest'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                ترتيب مخصص
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Category Filter List (Horizontal Scrollable Tabs) */}
        <div className="border-t border-slate-50 pt-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-row-reverse -mx-2 px-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-slate-900 to-blue-800 text-white shadow-sm shadow-blue-500/10 scale-102 border border-transparent'
                    : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Grid of smart tools */}
      <AnimatePresence mode="wait">
        {filteredTools.length > 0 ? (
          <motion.div
            key="grid-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10"
          >
            {filteredTools.map((tool, idx) => (
              <motion.div
                key={tool.id || idx}
                layoutId={`tool-card-${tool.id}`}
                whileHover={{ 
                  y: -6,
                  borderColor: 'rgba(29, 78, 216, 0.25)',
                  boxShadow: '0 20px 40px rgba(29, 78, 216, 0.05)'
                }}
                onClick={() => onNavigate({ path: 'tool', slug: tool.id })}
                className="group relative p-6 bg-white border border-blue-50 rounded-3xl flex flex-col justify-between hover:bg-slate-50/20 transition-all overflow-hidden shadow-[0_4px_20px_rgba(29,78,216,0.01)] cursor-pointer"
              >
                {/* Visual Accent Glow on Hover */}
                <div className="absolute top-0 right-0 left-0 h-[2.5px] bg-gradient-to-l from-blue-600 via-sky-400 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                
                <div className="space-y-4">
                  {/* Top line with Avatar and properties */}
                  <div className="flex items-start gap-4">
                    
                    {/* Tool Image Avatar inside soft elegant wrapper */}
                    <div className="h-14 w-14 rounded-2xl overflow-hidden bg-slate-50 border border-blue-100 shrink-0 shadow-sm flex items-center justify-center relative group-hover:scale-102 transition-transform">
                      <SmartImage
                        src={tool.image}
                        alt={tool.name}
                        name={tool.name}
                        fallbackType="logo"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="space-y-1 flex-grow">
                      <div className="flex items-center gap-1.5 justify-start md:flex-wrap">
                        <h3 className="font-display text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {tool.name}
                        </h3>
                        {tool.featured && (
                          <Star className="h-4 w-4 text-blue-500 fill-blue-500 ml-1 shrink-0" title="أداة مميزة" />
                        )}
                        {tool.badge && (
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-blue-50 border border-blue-100 text-blue-700 font-sans">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      
                      <span className="text-[10px] sm:text-xs font-bold text-slate-400">
                        {tool.category}
                      </span>
                    </div>

                  </div>

                  {/* Description Noun */}
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-sans font-medium line-clamp-2 h-10">
                    {tool.description}
                  </p>
                </div>

                {/* Footer specs inside card */}
                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-mono">
                  {tool.views ? (
                    <div className="flex items-center gap-1 text-slate-400">
                      <Eye className="h-3.5 w-3.5 text-blue-500" />
                      <span>{tool.views} مشاهدة</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-slate-400">
                      <Eye className="h-3.5 w-3.5 text-blue-500" />
                      <span>{Math.floor(Math.random() * 200) + 15} مشاهدة</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-blue-600 hover:text-slate-900 transition-colors font-extrabold group-hover:translate-x-[-2px] tracking-wide cursor-pointer font-sans">
                    <span>عرض التفاصيل والشرح</span>
                    <ArrowUpLeft className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  </div>
                </div>

              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center max-w-sm mx-auto bg-white border border-blue-100/60 rounded-3xl shadow-sm relative z-10"
          >
            <SlidersHorizontal className="h-10 w-10 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h3 className="font-display font-bold text-slate-900 text-sm sm:text-base">لم يعثر على روابط مطابقة</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              يرجى ضبط خيارات البحث والتدقيق للوصول لما تصبو إليه من خدمات الذكاء الاصطناعي.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
