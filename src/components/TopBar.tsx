'use client';

import React from 'react';
import { Phone, Truck, Tag, BookOpen, Globe, HelpCircle, Compass } from 'lucide-react';
import { LanguageSwitcher } from './shared/LanguageSwitcher';

interface TopBarProps {
  onNavigate?: (navId: string) => void;
  onOpenTrackOrder?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onNavigate, onOpenTrackOrder }) => {
  return (
    <div className="bg-[#1B1910] text-zinc-300 text-xs py-1.5 px-4 border-b border-[#2A2619] transition-colors select-none font-['Noto_Sans_Bengali']">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left message with promo badge */}
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="bg-[#E5A913] text-zinc-950 font-extrabold px-2 py-0.5 rounded text-[11px] flex items-center gap-1 shrink-0">
            <Tag className="w-3 h-3" /> অফার
          </span>
          <span className="text-zinc-300 text-[11px] sm:text-xs">
            বইমেলা বিশেষ ছাড় — <strong className="text-[#E5A913]">SHESHER10</strong> কুপনে অতিরিক্ত ১০% ছাড়!
          </span>
        </div>

        {/* Right Info Links & Language Toggle */}
        <div className="flex items-center gap-4 sm:gap-5 text-zinc-400 text-[11px] sm:text-xs">
          <div className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
            <Truck className="w-3.5 h-3.5 text-[#E5A913]" />
            <span>সারা দেশে ডেলিভারি</span>
          </div>

          <div
            onClick={() => onOpenTrackOrder && onOpenTrackOrder()}
            className="flex items-center gap-1.5 hover:text-[#E5A913] transition-colors cursor-pointer"
            title="অর্ডার ট্র্যাকিং"
          >
            <Compass className="w-3.5 h-3.5 text-[#E5A913]" />
            <span>অর্ডার ট্র্যাকিং</span>
          </div>

          <div
            onClick={() => onNavigate && onNavigate('about')}
            className="hidden sm:flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            title="আমাদের সম্পর্কে"
          >
            <span>আমাদের সম্পর্কে</span>
          </div>

          <div
            onClick={() => onNavigate && onNavigate('contact')}
            className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            title="সাহায্য ও যোগাযোগ"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#E5A913]" />
            <span>সাহায্য ও যোগাযোগ</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="w-3.5 h-3.5 text-[#E5A913]" />
            <span>০১৭০০-০০০০০০</span>
          </div>

          {/* Language Selector Toggle matching screenshot 1 */}
          <LanguageSwitcher size="sm" />
        </div>
      </div>
    </div>
  );
};
