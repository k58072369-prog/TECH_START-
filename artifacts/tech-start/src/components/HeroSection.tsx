/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowLeft, Landmark, Award } from 'lucide-react';
import { RouteState } from '../lib/router';

interface HeroSectionProps {
  onNavigate: (route: RouteState) => void;
  onScrollToArticles: () => void;
}

export default function HeroSection({ onNavigate, onScrollToArticles }: HeroSectionProps) {
  const [heroTitle, setHeroTitle] = useState('افتح بوابتك المعرفية لابتكارات الغد التقنية');
  const [heroSubtitle, setHeroSubtitle] = useState('شروحات برمجية متعمقة وأدوات ذكاء اصطناعي، مصممة خصيصاً بنكهة برمجية فاخرة لتلبية تطلعات المطورين الطامحين نحو قمة الاحتراف التقني.');

  useEffect(() => {
    const storedSettings = localStorage.getItem('tech_start_homepage_settings');
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        if (parsed.heroTitle) setHeroTitle(parsed.heroTitle);
        if (parsed.heroSubtitle) setHeroSubtitle(parsed.heroSubtitle);
      } catch (e) {
        console.error('Failed to parse dynamic hero settings: ', e);
      }
    }
  }, []);

  return (
    <div className="relative">
      
      {/* 1. Main Premium Luxury Hero Section */}
      <section id="luxury-hero" className="relative min-h-[95vh] flex items-center justify-center pt-36 pb-24 overflow-hidden bg-gradient-to-b from-[#f8fafc] to-blue-50/20 text-right">
        
        {/* Elegant Subtle Blue Nebula Light Patterns */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Subtle blue grid patterns */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#1d4ed8_1px,transparent_1px),linear-gradient(to_bottom,#1d4ed8_1px,transparent_1px)] bg-[size:50px_50px]" />
          
          {/* Gentle Soft Royal Blue nebula glows */}
          <div className="absolute top-[20%] left-[calc(50%-250px)] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[calc(50%-250px)] w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[120px]" />
          
          {/* Masterful Floating Royal Medallions represented as cosmic anchors */}
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [0, 90, 180, 270, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/4 right-[8%] w-24 h-24 bg-white border border-blue-600/10 rounded-full shadow-[0_10px_35px_rgba(29,78,216,0.06)] backdrop-blur-md flex items-center justify-center hidden sm:flex"
          >
            <Landmark className="h-7 w-7 text-blue-600 opacity-60" />
          </motion.div>

          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-1/4 left-[8%] w-20 h-20 bg-white border border-blue-600/10 rounded-full shadow-[0_10px_35px_rgba(29,78,216,0.06)] backdrop-blur-md flex items-center justify-center hidden sm:flex"
          >
            <Award className="h-6 w-6 text-blue-500 opacity-60" />
          </motion.div>
        </div>

        {/* Hero Concentrated Inside Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Premium Diamond Spark Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-600/15 text-slate-800 text-xs font-bold mb-8 shadow-[0_4px_15px_rgba(29,78,216,0.04)]"
          >
            <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
            <span className="text-[11px] sm:text-xs">البوابة العربية المرموقة لأحدث شروحات التقنية وبحوث الذكاء الاصطناعي</span>
          </motion.div>

          {/* Majestic Royal Headline with Blue/Slate gradients */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#0f172a] tracking-tight leading-[1.15]"
          >
            <span className="block mb-2 font-display">تيك ستارت</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-600 to-blue-800">
              {heroTitle}
            </span>
          </motion.h1>

          {/* Deluxe Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8 text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-sans"
          >
            {heroSubtitle}
          </motion.p>

          {/* Elegant Royal CTA Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
          >
            <button
              onClick={onScrollToArticles}
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold bg-slate-900 hover:bg-blue-600 text-white shadow-[0_10px_35px_rgba(15,23,42,0.15)] hover:shadow-[0_10px_35px_rgba(29,78,216,0.25)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group"
            >
              تصفح المقالات والبحوث
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1.5 transition-transform text-blue-400" />
            </button>
            
            <button
              onClick={() => {
                const section = document.getElementById('about-us-section');
                if (section) section.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold bg-white text-slate-800 border border-blue-600/15 hover:border-blue-600 hover:bg-blue-50/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              من نحن
            </button>
          </motion.div>

          {/* High-End Sleek Metrics strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="mt-20 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl border border-blue-600/10 shadow-xl bg-white/75 backdrop-blur-sm"
          >
            <div className="text-center p-3">
              <span className="block font-display text-2xl sm:text-3xl font-extrabold text-[#0f172a]">4+</span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-bold mt-1 block">تخصصات معتمدة</span>
            </div>
            <div className="text-center p-3 border-r border-blue-600/10">
              <span className="block font-display text-2xl sm:text-3xl font-extrabold text-blue-600">100%</span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-bold mt-1 block">صياغة لغوية ملكية</span>
            </div>
            <div className="text-center p-3 border-r border-blue-600/10">
              <span className="block font-display text-2xl sm:text-3xl font-extrabold text-[#0f172a]">رقمي</span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-bold mt-1 block">مواكبة تامة للغد</span>
            </div>
            <div className="text-center p-3 border-r border-blue-600/10">
              <span className="block font-display text-2xl sm:text-3xl font-extrabold text-blue-600">مباشر</span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-bold mt-1 block">قاعدة بيانات سحابية</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. Beautiful Deluxe "من نحن" (About Us) Section */}
      <section id="about-us-section" className="py-24 bg-white border-y border-blue-600/10 relative">
        <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(#1d4ed8_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            
            {/* Visual Brand Medallion card */}
            <div className="md:col-span-5 flex justify-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative p-0.5 rounded-3xl bg-gradient-to-br from-blue-600 via-sky-400 to-slate-900 shadow-[0_15px_40px_rgba(29,78,216,0.1)] overflow-hidden"
              >
                <div className="bg-slate-50 text-slate-900 p-8 rounded-[22px] flex flex-col items-center text-center max-w-sm relative">
                  <div className="h-16 w-16 mb-4 rounded-full bg-slate-900 flex items-center justify-center border-2 border-blue-600 shadow-md">
                    <Landmark className="h-7 w-7 text-blue-500" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#0f172a]">ميثاق براند تيك ستارت</h3>
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                    منصة عربية مبنية لخدمة شغف التطور وصياغة علوم التكنولوجيا والبرمجيات والمقالات بأعلى مستويات النضج الفكري والجمالي.
                  </p>
                  
                  {/* Fine ribbon overlay */}
                  <div className="mt-5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full font-mono text-[10px] tracking-widest font-extrabold uppercase">
                    EST. 2026
                  </div>
                </div>
              </motion.div>
            </div>

            {/* About us narrative content - NO ADMIN BUTTON IN HOMEPAGE BODY */}
            <div className="md:col-span-7 text-right space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block font-display">من نحن</span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0f172a]">
                  تيك ستارت بمدارها الملكي المرموق
                </h2>
              </div>

              <p className="text-sm sm:text-base text-slate-600 leading-loose">
                منصة مكرسة لدعم المهندسين وهواة التكنولوجيا والشباب العربي الطامح. نسعى جاهدين لقولبة وتحديث المعرفة النظرية والتجريبية داخل منظومة فاخرة تليق بالنخبة، ونعمل على تعويد العقل العربي على تصفح المراجع وصيحات العتاد التقني بسلامة ودقة علمية فائقة.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
