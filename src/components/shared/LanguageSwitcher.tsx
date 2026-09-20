'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface LanguageSwitcherProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  size = 'md',
}) => {
  const { language, setLanguage } = useLanguage();

  const isSmall = size === 'sm';

  return (
    <div
      className={`inline-flex items-center bg-[#201D17] border border-[#3B3527] rounded-xl p-1 select-none transition-all shadow-xs ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        onClick={() => setLanguage('bn')}
        className={`relative rounded-lg font-bold transition-all duration-200 cursor-pointer ${
          isSmall ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs sm:text-sm'
        } ${
          language === 'bn'
            ? 'bg-[#E5A913] text-[#1B1910] font-black shadow-xs scale-100'
            : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
        }`}
        title="বাংলা সংস্করণ"
      >
        বাংলা
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`relative rounded-lg font-bold transition-all duration-200 cursor-pointer ${
          isSmall ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs sm:text-sm'
        } ${
          language === 'en'
            ? 'bg-[#E5A913] text-[#1B1910] font-black shadow-xs scale-100'
            : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
        }`}
        title="English Version"
      >
        EN
      </button>
    </div>
  );
};
