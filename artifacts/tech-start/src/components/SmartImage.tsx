/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

interface SmartImageProps {
  src?: string;
  alt: string;
  name?: string;
  className?: string;
  fallbackType?: 'logo' | 'cover' | 'avatar';
  referrerPolicy?: 'no-referrer' | 'origin' | 'unsafe-url';
  onClick?: () => void;
}

export function getInitials(name: string): string {
  if (!name) return 'AI';
  const clean = name.trim().replace(/[^\w\s\u0600-\u06FF]/g, '');
  if (!clean) return 'AI';

  const lower = clean.toLowerCase();
  if (lower.includes('chatgpt')) return 'CH';
  if (lower.includes('gemini')) return 'GE';
  if (lower.includes('claude')) return 'CL';
  if (lower.includes('perplexity')) return 'PE';

  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    const first = parts[0][0] || '';
    const second = parts[1][0] || '';
    return (first + second).toUpperCase();
  }

  if (clean.length >= 2) {
    if (/^[a-zA-Z]/.test(clean)) {
      return clean.substring(0, 2).toUpperCase();
    }
    return clean.substring(0, 2);
  }

  return clean.toUpperCase();
}

/**
 * Smart image component with automated fallback detection to initials
 */
export default function SmartImage({
  src,
  alt,
  name,
  className = '',
  fallbackType = 'logo',
  referrerPolicy = 'no-referrer',
  onClick
}: SmartImageProps) {
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset error state if the src property changes
  useEffect(() => {
    setErrorOccurred(false);
    setIsLoading(true);
  }, [src]);

  // Check if string points to a broker, placeholder, or empty image
  const isImageBroken = !src || 
    src.trim() === '' || 
    src.includes('broken-image') || 
    src.includes('placeholder') || 
    src.includes('broken');

  const finalName = name || alt || 'AI';
  const initials = getInitials(finalName);

  if (errorOccurred || isImageBroken) {
    if (fallbackType === 'logo' || fallbackType === 'avatar') {
      return (
        <div 
          onClick={onClick}
          className={`flex items-center justify-center bg-gradient-to-br from-[#1d4ed8] to-[#1e40af] text-white font-display font-extrabold select-none shadow-sm border border-blue-500/20 ${className}`}
          style={{ letterSpacing: '0.05em' }}
          title={finalName}
        >
          <span className="text-sm tracking-wide transform group-hover:scale-105 transition-transform">
            {initials}
          </span>
        </div>
      );
    } else {
      // Cover fallback layout (wide card cover representation)
      return (
        <div 
          onClick={onClick}
          className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-[#1d4ed8]/30 to-slate-950 text-white select-none border border-blue-900/15 overflow-hidden p-6 text-center ${className}`}
        >
          {/* Futuristic grid/stars visual effect */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25" />
          
          <div className="relative z-10 space-y-2">
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#1d4ed8] to-blue-500 text-white font-extrabold text-sm flex items-center justify-center mx-auto shadow-md">
              {initials}
            </div>
            <div>
              <p className="text-xs font-bold text-blue-400 font-sans tracking-wide">{finalName}</p>
              <p className="text-[10px] text-slate-400 font-medium">مستند معتمد من المنصة</p>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-100/80 animate-pulse flex items-center justify-center">
          <div className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy={referrerPolicy}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setErrorOccurred(true);
          setIsLoading(false);
        }}
        onClick={onClick}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
}
