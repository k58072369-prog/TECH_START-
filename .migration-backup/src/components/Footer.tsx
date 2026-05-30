/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Landmark, Info, Shield } from 'lucide-react';
import { RouteState } from '../lib/router';
import { Category } from '../types';
import { getCategories } from '../lib/supabase';

interface FooterProps {
  onNavigate: (route: RouteState) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data || []);
    });
  }, []);
  return (
    <footer id="footer-section" className="relative mt-28 border-t border-blue-600/10 bg-slate-950 text-slate-100 pt-16 pb-10 overflow-hidden">
      
      {/* Background elegant blue radial glow */}
      <div className="absolute top-0 right-1/4 left-1/4 h-56 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-right">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Brand block */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3 cursor-pointer justify-start md:flex-row flex-row-reverse" onClick={() => onNavigate({ path: 'home' })}>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-[0_4px_12px_rgba(29,78,216,0.3)]">
                <Landmark className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-extrabold text-white tracking-tight">
                تيك <span className="text-blue-500">ستارت</span>
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              أول منصة ذكاء اصطناعي وبرمجة احترافية في العالم العربي تحفز الفضول المعرفي، وتغطي أحدث شروحات ونماذج الأبحاث بلغة عربية مبسطة بلمسات ومقاييس فخامة ملكية.
            </p>
          </div>

          {/* Useful categories */}
          <div>
            <h4 className="text-sm font-bold tracking-wider text-blue-400 mb-5 font-display border-r-2 border-blue-600 pr-3">محتوى المنصة</h4>
            <ul className="space-y-3.5 text-sm text-slate-300">
              <li>
                <button onClick={() => onNavigate({ path: 'home' })} className="hover:text-blue-400 transition-all cursor-pointer">
                  الرئيسية
                </button>
              </li>
              {categories.slice(0, 4).map((cat, idx) => (
                <li key={cat.id || idx}>
                  <button onClick={() => onNavigate({ path: 'category', slug: cat.name })} className="hover:text-blue-400 transition-all cursor-pointer">
                    {cat.name}
                  </button>
                </li>
              ))}
              <li>
                <button onClick={() => onNavigate({ path: 'home' })} className="hover:text-blue-400 transition-all cursor-pointer">
                  تصفح الأدوات الذكية
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Developer Credit & Channels & Secret Admin Portal Shield Link */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Developer credit with branding badge and Admin Shield Icon */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-900 border border-white/10 py-2.5 px-5 rounded-full text-blue-400 font-mono text-xs shadow-md tracking-wider">
              <span className="text-slate-400">Developed by</span>
              <span className="font-extrabold text-white font-sans text-xs">Programmer Adham Ayman</span>
              <span className="h-4 w-[1px] bg-white/15" />
              <button
                onClick={() => onNavigate({ path: 'admin' })}
                className="text-blue-400 hover:text-white hover:scale-110 transition-all cursor-pointer group"
                title="إدارة المنصة"
              >
                <Shield className="h-4.5 w-4.5 group-hover:rotate-12 transition-transform" />
              </button>
            </div>

            {/* Social channels next to dev credit */}
            <div className="flex items-center gap-2.5">
              {/* WhatsApp Channel */}
              <a
                href="https://whatsapp.com/channel/0029Vb8LGTf4CrfoM1PVeJ0u"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-emerald-400 hover:bg-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer shadow-sm group"
                title="قناة الواتساب"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.855 0c3.161.002 6.132 1.233 8.368 3.468C22.458 5.703 23.688 8.673 23.685 11.83c-.004 6.507-5.33 11.83-11.854 11.83-2.001-.001-3.97-.509-5.717-1.478L0 24zm6.59-4.846c1.6.95 3.16 1.455 4.86 1.456 5.424 0 9.837-4.412 9.84-9.84.002-2.628-1.02-5.1-2.875-6.956C16.6 2.012 14.12 1.01 11.85 1.011 6.42 1.011 2.01 5.423 2.006 10.852c-.001 1.761.47 3.442 1.365 4.966l-1.017 3.713 3.816-.977zm11.758-7.79c-.3-.15-1.774-.875-2.048-.976-.275-.1-.475-.15-.675.15-.2.3-.775.976-.95 1.176-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.49-.893-.796-1.495-1.782-1.67-2.08-.175-.3-.018-.462.13-.61.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5s.05-.375-.025-.525c-.075-.15-.675-1.625-.925-2.225-.244-.589-.496-.51-.675-.52l-.575-.01c-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.224 5.11 4.52.714.31 1.27.494 1.706.634.717.228 1.37.195 1.886.118.574-.085 1.774-.725 2.024-1.425.25-.7 2.5-1.224.25-1.425a1.23 1.23 0 0 1-.35-.7z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com/@babaalmugal"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-slate-800 hover:border-red-500/30 transition-all cursor-pointer shadow-sm group"
                title="يوتيوب"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.519 0-9.387.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.868.508 9.387.508 9.387.508s7.518 0 9.389-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Copyright row */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} تيك ستارت. جميع الحقوق محفوظة برونق الفخامة والامتياز الفائق.</p>
            <div className="flex items-center gap-1.5 py-1 px-3.5 text-blue-400">
              <Info className="h-3.5 w-3.5 text-blue-500" />
              <span className="font-medium text-slate-300">المنصة المحمية ومصادق عليها</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
