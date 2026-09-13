'use client';

import React from 'react';
import { Tag, Flame, BookMarked } from 'lucide-react';

interface NavigationProps {
  currentNav: string;
  onNavigate: (navId: string) => void;
}

export const NAV_ITEMS = [
  { id: 'home', label: 'হোম' },
  { id: 'books', label: 'বই' },
  { id: 'categories', label: 'ক্যাটাগরি' },
  { id: 'authors', label: 'লেখক' },
  { id: 'publishers', label: 'প্রকাশক' },
  { id: 'bestseller', label: 'বেস্টসেলার', badge: 'হট', icon: Flame },
  { id: 'new-books', label: 'নতুন বই', icon: BookMarked },
  { id: 'offers', label: 'অফার', badge: '৩০%', icon: Tag },
  { id: 'about', label: 'আমাদের সম্পর্কে' },
  { id: 'contact', label: 'যোগাযোগ' },
];

export const Navigation: React.FC<NavigationProps> = ({ currentNav, onNavigate }) => {
  return (
    <nav className="border-t border-zinc-100 bg-[#FAF8F4]/90 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <ul className="flex items-center gap-1 overflow-x-auto hide-scrollbar py-1">
          {NAV_ITEMS.map((item) => {
            const isActive = currentNav === item.id;
            const Icon = item.icon;

            return (
              <li key={item.id} className="shrink-0">
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer select-none whitespace-nowrap ${
                    isActive
                      ? 'text-[#18181B] bg-amber-500/15 font-semibold'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/70'
                  }`}
                >
                  {Icon && (
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-zinc-400'}`} />
                  )}
                  <span>{item.label}</span>

                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white leading-none shadow-2xs">
                      {item.badge}
                    </span>
                  )}

                  {/* Active bottom bar */}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#F59E0B] rounded-full" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
