'use client';

import React from 'react';
import { Phone, Truck, Tag, BookOpen } from 'lucide-react';

export const TopBar: React.FC = () => {
  return (
    <div className="bg-[#18181B] text-zinc-300 text-xs py-1.5 px-4 border-b border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left message with promo badge */}
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="bg-[#F59E0B] text-zinc-950 font-semibold px-2 py-0.5 rounded text-[11px] flex items-center gap-1 shrink-0">
            <Tag className="w-3 h-3" /> অফার
          </span>
          <span className="text-zinc-300">
            বইমেলা বিশেষ ছাড় — <strong className="text-amber-400">SHESHER10</strong> কুপনে অতিরিক্ত ১০% ছাড়!
          </span>
        </div>

        {/* Right Info */}
        <div className="hidden md:flex items-center gap-5 text-zinc-400">
          <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
            <Truck className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>সারা দেশে হোম ডেলিভারি</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
            <Phone className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>হেল্পলাইন: ০১৭০০-০০০০০০</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
            <BookOpen className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>১০০% অরিজিনাল বই</span>
          </div>
        </div>
      </div>
    </div>
  );
};
