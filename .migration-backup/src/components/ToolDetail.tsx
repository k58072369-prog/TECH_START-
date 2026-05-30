/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowUpLeft, ShieldAlert, Star, Eye, Bookmark, Lightbulb, CheckCircle } from 'lucide-react';
import { AiTool } from '../types';
import { AI_TOOLS } from '../data/aiTools';
import { RouteState } from '../lib/router';
import SmartImage from './SmartImage';

interface ToolDetailProps {
  toolId: string;
  onNavigate: (route: RouteState) => void;
}

export default function ToolDetail({ toolId, onNavigate }: ToolDetailProps) {
  const [tool, setTool] = useState<AiTool | null>(null);
  const [similarTools, setSimilarTools] = useState<AiTool[]>([]);

  useEffect(() => {
    // Load tools from localstorage or use AI_TOOLS as fallback
    let allTools = AI_TOOLS;
    try {
      const stored = localStorage.getItem('tech_start_custom_links');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          allTools = parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading tools database', e);
    }

    // Find requested tool
    const found = allTools.find(t => t.id === toolId);
    if (found) {
      setTool(found);
      
      // Increment views locally
      try {
        const updated = allTools.map(t => t.id === toolId ? { ...t, views: (t.views || 0) + 1 } : t);
        localStorage.setItem('tech_start_custom_links', JSON.stringify(updated));
      } catch (err) {
        console.warn('Error incrementing tool views localstorage', err);
      }

      // Filter similar tools of same category (excl. current, up to 3 models, not hidden)
      const similar = allTools
        .filter(t => t.category === found.category && t.id !== found.id && !t.hidden)
        .slice(0, 3);
      setSimilarTools(similar);
    } else {
      setTool(null);
    }

    // Scroll to top when view is mounted
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [toolId]);

  if (!tool) {
    return (
      <div className="pt-32 pb-24 text-center max-w-md mx-auto px-4 text-right">
        <ShieldAlert className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-bounce" />
        <h2 className="font-display text-xl font-bold text-[#0f172a] mb-2">رابط الأداة الذكية غير موجود</h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          تعذر العثور على الأداة المطلوبة بقائمة الروابط الذكية. ربما تكون قد حُذفت أو حُجبت مؤخراً.
        </p>
        <button
          onClick={() => onNavigate({ path: 'home' })}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-blue-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right overflow-hidden">
      
      {/* Top Breadcrumb Nav back */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => onNavigate({ path: 'home' })}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 hover:border-blue-300 text-slate-700 text-xs font-bold transition-all shadow-sm cursor-pointer group"
        >
          <ArrowLeft className="h-4 w-4 text-blue-600 group-hover:-translate-x-1 transition-transform" />
          <span>العودة لركن الروابط الذكية</span>
        </button>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <span className="text-blue-600 font-sans font-bold">{tool.category}</span>
          <span>/</span>
          <span>الروابط الذكية</span>
        </div>
      </div>

      {/* Main Grid Header Card */}
      <div className="p-6 sm:p-10 rounded-3xl border border-blue-100/60 bg-white shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden mb-12">
        <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-l from-blue-600 via-blue-400 to-transparent" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-600/5 rounded-full blur-2xl font-mono" />
        
        {/* Tool Icon / Avatar Cover */}
        <div className="h-32 w-32 rounded-3xl overflow-hidden bg-slate-50 border border-blue-100/80 shrink-0 shadow-md flex items-center justify-center relative group">
          <SmartImage
            src={tool.image}
            alt={tool.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {tool.featured && (
            <div className="absolute top-1.5 right-1.5 h-6 w-6 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-full flex items-center justify-center shadow-sm">
              <Star className="h-3.5 w-3.5 text-white fill-white" />
            </div>
          )}
        </div>

        {/* Brand Information and actions */}
        <div className="flex-grow space-y-4 text-center md:text-right">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center md:justify-start">
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {tool.name}
            </h1>
            <div className="flex gap-2 justify-center sm:justify-start">
              {tool.badge && (
                <span className="px-3.5 py-1 text-xs font-bold rounded-full bg-blue-50 border border-blue-100 text-blue-700">
                  {tool.badge}
                </span>
              )}
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-50 border border-slate-100 text-slate-600">
                {tool.category}
              </span>
            </div>
          </div>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
            {tool.description}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 pt-2 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-blue-500" />
              <span>{tool.views ? tool.views + 1 : 1} مشاهدة مستفيدة</span>
            </div>
            <div className="h-3.5 w-[1px] bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Bookmark className="h-4 w-4 text-blue-500" />
              <span>الرابط برعاية تيك ستارت</span>
            </div>
          </div>
        </div>

        {/* Big Action Link button */}
        <div className="shrink-0 pt-4 md:pt-0">
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-slate-950 to-blue-900 border border-blue-700 text-white font-extrabold text-sm shadow-[0_10px_25px_rgba(29,78,216,0.15)] hover:shadow-[0_15px_30px_rgba(29,78,216,0.25)] hover:bg-[#1e3a8a] transition-all cursor-pointer group"
          >
            <span>زيارة الموقع الرسمي للأداة</span>
            <ArrowUpLeft className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
          </a>
        </div>
      </div>

      {/* Guide details and full manual section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
        
        {/* Left Side: Long description manual */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="p-8 rounded-3xl border border-blue-50 bg-white text-right">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 border-r-4 border-blue-600 pr-3.5 mb-5 flex items-center justify-start gap-2">
              <span>شرح الأداة والدليل المعرفي</span>
            </h2>
            <div className="prose prose-blue text-sm sm:text-base text-slate-700 leading-relaxed space-y-4">
              <p>
                {tool.fullDescription || `تقدم منصة ${tool.name} نقوداً معنوية كبرى لرواد التقنية والمطورين بالوطن العربي. تتيح لك الأداة الموجهة معالجة معقدة ومباشرة من خلال نماذج الحوسبة والتشغيل التي اختبرناها بعناية في تيك ستارت للتأكد من مأمنها وجودتها الفائقة للأعمال والمنظمات التقنية.`}
              </p>
              <p>
                يسهم دمج خدمات الذكاء الاصطناعي هذه في تسريع مهام الأفراد والمؤسسات بنسبة تصل إلى 60% وفق دراسات برمجية حديثة، مما يجعل التعرف والتمكن منها ضرورة تنموية حتمية لمنع فجوات الغد.
              </p>
            </div>
          </div>

          {/* Uses & Cases segment */}
          <div className="p-8 rounded-3xl border border-blue-50 bg-white">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 border-r-4 border-blue-600 pr-3.5 mb-5 flex items-center justify-start gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600 shrink-0" />
              <span>أفضل مجالات واستخدامات الأداة</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tool.uses && tool.uses.length > 0 ? (
                tool.uses.map((use, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-700 font-sans font-medium">{use}</span>
                  </div>
                ))
              ) : (
                [1,2,3].map((idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-700 font-sans font-medium">استخدام فكري وتطويري موصى به عبر خبراء التقنية المبرمجين.</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Features checklists */}
        <div className="space-y-6">
          
          <div className="p-8 rounded-3xl border border-blue-50 bg-gradient-to-b from-white to-blue-50/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-[2px] bg-blue-600" />
            <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 border-r-4 border-blue-600 pr-3 mb-6">أبرز المميزات التنافسية</h3>
            <ul className="space-y-4">
              {tool.features && tool.features.length > 0 ? (
                tool.features.map((feat, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start text-xs sm:text-sm font-sans font-semibold text-slate-700">
                    <span className="h-5 w-5 rounded-full bg-blue-50 text-blue-600 font-display flex items-center justify-center shrink-0 font-bold mt-0.5">{idx + 1}</span>
                    <span>{feat}</span>
                  </li>
                ))
              ) : (
                [1,2,3,4].map((i) => (
                  <li key={i} className="flex gap-2.5 items-start text-xs sm:text-sm font-sans font-semibold text-slate-700">
                    <span className="h-5 w-5 rounded-full bg-blue-50 text-blue-600 font-display flex items-center justify-center shrink-0 font-bold mt-0.5">{i}</span>
                    <span>مواصفات حوسبة متفوقة وسريعة الاستجابة لخدمة الزوار.</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Educational banner note */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-blue-900 text-slate-100 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl" />
            <h4 className="font-display text-sm font-bold text-blue-400 mb-2">إرشادات تيك ستارت</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              ننصح بمحاورة واستغلال حلول دمج الذكاء الاصطناعي هذه لتسهيل الابتكار، والاشتراك بمنتجات وخدمات رسمية بعد التأكد من تلاؤمها مع أهدافك الشخصية وشروط الأمان المالي.
            </p>
          </div>

        </div>

      </div>

      {/* Similar / Related Tools Section */}
      {similarTools.length > 0 && (
        <div className="border-t border-slate-100 pt-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display text-xl font-bold text-slate-900 border-r-4 border-blue-600 pr-3.5">أدوات مشابهة موصى بها</h3>
            <span className="text-xs text-slate-400 font-mono">استكشف أدوات تقنية وبنفس الاتجاه</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarTools.map((sim, i) => (
              <motion.div
                key={sim.id || i}
                onClick={() => onNavigate({ path: 'tool', slug: sim.id })}
                className="p-5 rounded-2xl bg-white border border-blue-50 hover:border-blue-300/60 shadow-sm cursor-pointer hover:shadow-md transition-all group flex flex-col justify-between text-right relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-l from-blue-600/20 to-transparent" />
                
                <div className="flex gap-3.5 items-start justify-start">
                  <div className="h-11 w-11 rounded-lg bg-slate-50 border border-blue-100 shrink-0 overflow-hidden flex items-center justify-center">
                    <SmartImage src={sim.image} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors">{sim.name}</h4>
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-bold font-sans py-0.5 px-2 rounded-full inline-block mt-1">{sim.category}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium mt-3.5 truncate">
                  {sim.description}
                </p>

                <div className="flex justify-end gap-1 items-center mt-5 pt-3 border-t border-slate-50 text-blue-600 font-extrabold text-xs">
                  <span>تصفح الأداة المرجعية</span>
                  <ArrowUpLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
