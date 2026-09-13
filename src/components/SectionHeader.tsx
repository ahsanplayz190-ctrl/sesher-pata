'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

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
    <div className="flex items-end justify-between mb-4 sm:mb-5">
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg sm:text-2xl font-bold text-[#18181B] tracking-tight font-['Noto_Sans_Bengali']">
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            {subtitle}
          </p>
        )}
        {/* Small golden decorative underline */}
        <div className="w-12 h-1 bg-[#F59E0B] rounded-full mt-1.5" />
      </div>

      {onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="group flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#B45309] hover:text-[#92400E] transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-amber-50"
        >
          <span>সব দেখুন</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
        </button>
      )}
    </div>
  );
};
