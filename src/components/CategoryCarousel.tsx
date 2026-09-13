'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Feather, BookMarked, Moon, Smile, Atom, Landmark, TrendingUp, Languages, GraduationCap, Globe, Grid } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { Category } from '../types';
import { toBengaliNumber } from '../utils/formatters';

interface CategoryCarouselProps {
  onSelectCategory: (categoryId: string) => void;
  activeCategoryId?: string;
}

const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  Feather,
  BookMarked,
  Moon,
  Smile,
  Atom,
  Landmark,
  TrendingUp,
  Languages,
  GraduationCap,
  Globe,
  Grid,
};

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  onSelectCategory,
  activeCategoryId,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full my-6 sm:my-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#18181B] tracking-tight">
                বইয়ের ক্যাটাগরি
              </h2>
            </div>
            {/* Small golden decorative underline */}
            <div className="w-10 h-1 bg-[#F59E0B] rounded-full mt-1.5" />
          </div>

          {/* Desktop Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
              aria-label="বামে যান"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
              aria-label="ডানে যান"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto hide-scrollbar pb-3 pt-1 scroll-smooth"
        >
          {CATEGORIES.map((category: Category) => {
            const IconComponent = iconMap[category.iconName] || BookOpen;
            const isSelected = activeCategoryId === category.id;

            return (
              <div
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`group shrink-0 w-28 sm:w-36 md:w-40 bg-white rounded-2xl p-3 sm:p-4 border transition-all duration-200 cursor-pointer flex flex-col items-center text-center select-none ${
                  isSelected
                    ? 'border-[#F59E0B] bg-amber-50/50 shadow-md ring-2 ring-[#F59E0B]/30'
                    : 'border-zinc-200/80 hover:border-amber-400 hover:shadow-md hover:-translate-y-1'
                }`}
              >
                {/* Visual Icon / Image Container */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden mb-2.5 bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-2xs group-hover:border-amber-200 transition-colors">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/15 transition-colors">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-md" />
                  </div>
                </div>

                {/* Category Name */}
                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                  {category.name}
                </h3>

                {/* Book count */}
                <span className="text-[11px] text-zinc-500 mt-0.5">
                  {toBengaliNumber(category.bookCount)}+ বই
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
