/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Eye, Calendar, ArrowRight, Share2, Twitter, Linkedin, Link, Check, ExternalLink } from 'lucide-react';
import { Article } from '../types';
import { RouteState } from '../lib/router';
import { incrementArticleViews, getArticles } from '../lib/supabase';
import SmartImage from './SmartImage';

interface ArticleDetailProps {
  article: Article;
  onNavigate: (route: RouteState) => void;
}

function calculateReadingTime(content: string = ''): number {
  const words = content.trim().split(/\s+/).length || 0;
  const time = Math.ceil(words / 200);
  return time < 1 ? 1 : time;
}

function getYoutubeEmbedUrl(url: string = ''): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
}

export default function ArticleDetail({ article, onNavigate }: ArticleDetailProps) {
  const [copied, setCopied] = useState(false);
  const [related, setRelated] = useState<Article[]>([]);
  const [viewsCount, setViewsCount] = useState(article.views);
  const embedUrl = getYoutubeEmbedUrl(article.youtube_url);

  useEffect(() => {
    // 1. Accumulate views safely
    incrementArticleViews(article.id, article.views);
    setViewsCount((prev) => prev + 1);

    // 2. Fetch related articles in the same category
    getArticles({ categoryId: article.category_id, limit: 4 }).then((data) => {
      // Exclude current article
      const filtered = data.filter((item) => item.id !== article.id).slice(0, 3);
      setRelated(filtered);
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article.id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = encodeURIComponent(`اقرأ مقال مميز ومفيد على تيك ستارت: ${article.title}`);
  const shareUrl = encodeURIComponent(window.location.href);

  // Custom high-fidelity markdown compiler with royal blue layouts
  const renderRichContent = (text: string = '') => {
    const blocks: any[] = [];
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let currentParagraphLines: string[] = [];

    const flushParagraph = (key: number) => {
      if (currentParagraphLines.length > 0) {
        const paraText = currentParagraphLines.join(' ');
        
        // Simple regex replace for inline code and bolding
        const formattedPara = paraText.split('**').map((chunk, i) => {
          if (i % 2 === 1) {
            return <strong key={`b-${i}`} className="font-extrabold text-[#0f172a]">{chunk}</strong>;
          }
          
          // Check for inline code `code`
          return chunk.split('`').map((subChunk, j) => {
            if (j % 2 === 1) {
              return <code key={`c-${j}`} className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xs">{subChunk}</code>;
            }
            return subChunk;
          });
        });

        blocks.push(
          <p key={`p-${key}`} className="mb-4 text-slate-700 leading-relaxed text-sm sm:text-base">
            {formattedPara}
          </p>
        );
        currentParagraphLines = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Check code block
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          // Close block
          blocks.push(
            <div key={`code-${index}`} className="relative my-6 group text-left">
              <div className="absolute top-2 left-2 z-10">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeLines.join('\n'));
                  }}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-blue-600/20 text-[10px] text-white hover:bg-blue-600 font-sans cursor-pointer transition-all"
                >
                  نسخ الكود
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-blue-600/15 text-xs sm:text-sm font-mono text-blue-300 overflow-x-auto ltr">
                <code>{codeLines.join('\n')}</code>
              </pre>
            </div>
          );
          codeLines = [];
          inCodeBlock = false;
        } else {
          // Open block
          flushParagraph(index);
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      // Check Headings
      if (trimmed.startsWith('###')) {
        flushParagraph(index);
        blocks.push(
          <h3 key={`h3-${index}`} className="font-display text-lg sm:text-xl font-bold text-[#0f172a] mt-8 mb-4 border-r-3 border-blue-600 pr-3">
            {trimmed.replace(/^###\s*/, '')}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith('####')) {
        flushParagraph(index);
        blocks.push(
          <h4 key={`h4-${index}`} className="font-display text-base sm:text-lg font-bold text-slate-800 mt-6 mb-3">
            {trimmed.replace(/^####\s*/, '')}
          </h4>
        );
        return;
      }

      // List bullet check
      if (trimmed.startsWith('1.') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        flushParagraph(index);
        const bulletText = trimmed.replace(/^(1\.\s*|[-*]\s*)/, '');
        blocks.push(
          <div key={`li-${index}`} className="flex items-start gap-2.5 mb-2 pr-4 text-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
            <span className="text-sm sm:text-base leading-relaxed">{bulletText}</span>
          </div>
        );
        return;
      }

      // Blank line separating drafts
      if (trimmed === '') {
        flushParagraph(index);
        return;
      }

      currentParagraphLines.push(line);
    });

    flushParagraph(lines.length);
    return <div className="rich-article text-right">{blocks}</div>;
  };

  const readTime = calculateReadingTime(article.content);

  return (
    <article id="article-read-portal" className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
      
      {/* Return to homepage button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => onNavigate({ path: 'home' })}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-8 group cursor-pointer font-bold"
      >
        <ArrowRight className="h-4 w-4 group-hover:translate-x-[4px] transition-transform text-blue-600 animate-pulse" />
        العودة إلى الرئيسية
      </motion.button>

      {/* Meta Header block */}
      <header className="mb-10 text-right">
        
        {/* Category Label */}
        {article.category?.name && (
          <span className="inline-block px-4 py-1.5 text-xs font-bold rounded-full bg-blue-50 border border-blue-100 text-blue-700 mb-4">
            {article.category.name}
          </span>
        )}

        <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#0f172a] leading-tight mb-6">
          {article.title}
        </h1>

        {/* Views indicators and shares */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-slate-100 py-4 text-xs sm:text-sm font-mono text-slate-500 flex-row-reverse sm:flex-row">
          
          {/* Share links */}
          <div className="flex items-center gap-2 text-right">
            <span className="text-xs text-slate-400 ml-1">مشاركة:</span>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-white cursor-pointer hover:bg-blue-600 hover:border-transparent transition-all shadow-sm"
              title="تويتر X"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-white cursor-pointer hover:bg-blue-600 hover:border-transparent transition-all shadow-sm"
              title="لينكد إن"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <button
               onClick={handleCopyLink}
               className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-white cursor-pointer hover:bg-blue-600 hover:border-transparent transition-all shadow-sm relative"
               title="نسخ الرابط"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Calendar className="h-4 w-4 text-blue-600" />
              {new Date(article.created_at).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5 text-xs sm:text-sm ml-2">
              <Eye className="h-4 w-4 text-blue-600" />
              {viewsCount} مشاهدة
            </span>
            <span className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Clock className="h-4 w-4 text-blue-600" />
              {readTime} دقائق قراءة
            </span>
          </div>

        </div>
      </header>

      {/* Hero Cover Image */}
      <div className="relative h-64 sm:h-96 md:h-[450px] rounded-2xl overflow-hidden mb-12 border border-blue-100 shadow-xl bg-white">
        <SmartImage
          src={article.cover_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent" />
      </div>

      {/* YouTube Embedded Video Section (Responsive) */}
      {embedUrl && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4 justify-start flex-row-reverse">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
            <h3 className="font-display text-lg font-bold text-[#0f172a] tracking-tight">
              الشرح والتطبيق المرئي للمكتبة التقنية 🎥
            </h3>
          </div>
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-xl border border-blue-100 bg-black">
            <iframe
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </motion.div>
      )}

      {/* Styled Article Content Body */}
      <div className="prose max-w-none mb-16 rich-article text-right">
        {renderRichContent(article.content)}
      </div>

      {/* Custom Premium Outbound Button for External Link CTA */}
      {article.external_url && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="my-16 p-8 rounded-2xl bg-gradient-to-br from-white to-blue-50/30 border border-blue-100 text-center relative overflow-hidden shadow-md"
        >
          {/* Animated pulsing background star */}
          <div className="absolute -top-12 -left-12 h-32 w-32 bg-blue-600/5 rounded-full blur-2xl animate-pulse" />
          
          <h3 className="relative z-10 font-display text-xl sm:text-2xl font-bold text-[#0f172a] mb-2">
            جاهز للاستكشاف والتحليق؟
          </h3>
          <p className="relative z-10 text-slate-600 text-sm mb-6 max-w-md mx-auto font-sans">
            انقر على الرابط الموثق التالي للذهاب مباشرة وتجربة الأداة التقنية أو تصفح مصدر التوثيق الرسمي ومستندات المشروع.
          </p>

          <a
            href={article.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-blue-600 text-white font-extrabold rounded-full shadow-md hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer group"
          >
            <span>انقر هنا لتجربة الأداة واستعراض التوثيق</span>
            <ExternalLink className="h-5 w-5 group-hover:rotate-12 transition-transform text-blue-400" />
          </a>
        </motion.div>
      )}

      {/* Related articles block listing */}
      {related.length > 0 && (
        <div className="border-t border-slate-100 pt-16">
          <h3 className="font-display text-xl font-bold text-[#0f172a] mb-8 pr-3 border-r-3 border-blue-600">مقالات مشابهة قد تثير فضولك المعرفي</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => onNavigate({ path: 'article', slug: item.slug })}
                className="group cursor-pointer text-right"
              >
                <div className="h-36 rounded-xl overflow-hidden bg-white border border-slate-100 mb-3 shadow-sm">
                  <SmartImage
                    src={item.cover_image || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h4 className="font-display text-sm font-bold text-slate-800 group-hover:text-blue-600 leading-snug transition-colors line-clamp-2">
                  {item.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      )}

    </article>
  );
}
