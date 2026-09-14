'use client';

import React from 'react';

interface BrandLogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  variant = 'light',
  size = 'md',
  onClick,
  showText = true,
}) => {
  const isLight = variant === 'light';

  // Heights for the logo image
  const imgHeights = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl sm:text-3xl',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group transition-all duration-200 active:scale-98 ${className}`}
    >
      {/* Custom Brand Logo Image Container */}
      <div
        className={`relative overflow-hidden rounded-xl sm:rounded-2xl shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-xs border ${
          isLight ? 'border-amber-200/80 bg-amber-50/50' : 'border-amber-500/30 bg-[#2C2719]'
        }`}
      >
        <img
          src="/images/logo.jpg"
          alt="শেষের পাতা লোগো"
          className={`${imgHeights[size]} w-auto object-cover rounded-xl transition-all duration-300`}
        />
      </div>

      {/* Brand Typography Accent */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            className={`font-black tracking-tight font-['Noto_Sans_Bengali'] ${textSizes[size]} ${
              isLight ? 'text-[#1F1C15] group-hover:text-amber-800' : 'text-white group-hover:text-[#E5A913]'
            } transition-colors`}
          >
            শেষের পাতা
          </span>
          <span
            className={`text-[10.5px] tracking-wide uppercase font-bold ${
              isLight ? 'text-amber-800' : 'text-[#E5A913]'
            }`}
          >
            অনলাইন বইয়ের দোকান
          </span>
        </div>
      )}
    </div>
  );
};
