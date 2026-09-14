'use client';

import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onViewAll?: () => void;
  count?: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  onViewAll,
}) => {
  return (
    <div className="flex items-center justify-between mb-3.5 pt-4 pb-1 border-b border-[#E8E3D5]/80 font-['Noto_Sans_Bengali']">
      <div className="flex items-center gap-2.5">
        <div className="w-1.5 h-5 sm:h-6 bg-[#E5A913] rounded-full" />
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#1E1B13] tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 font-normal">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="bg-[#E5A913] hover:bg-[#D99600] text-zinc-950 font-bold text-xs sm:text-xs px-3.5 py-1.5 rounded-md shadow-2xs transition-all cursor-pointer shrink-0 active:scale-95"
        >
          সব দেখুন ➔
        </button>
      )}
    </div>
  );
};

