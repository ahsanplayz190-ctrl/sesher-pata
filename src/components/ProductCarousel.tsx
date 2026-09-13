'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Book } from '../types';
import { ProductCard } from './ProductCard';

interface ProductCarouselProps {
  books: Book[];
  onOpenDetails: (book: Book) => void;
  onQuickView: (book: Book) => void;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  books,
  onOpenDetails,
  onQuickView,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      // Scroll by roughly 2 cards width
      const scrollOffset = direction === 'left' ? -360 : 360;
      containerRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/carousel">
      {/* Navigation Arrow Left (Desktop) */}
      <button
        type="button"
        onClick={() => handleScroll('left')}
        className="hidden md:flex absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 border border-zinc-200 text-zinc-700 items-center justify-center shadow-md hover:bg-zinc-50 hover:text-amber-600 transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer active:scale-90"
        aria-label="বামের বইগুলো দেখুন"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Navigation Arrow Right (Desktop) */}
      <button
        type="button"
        onClick={() => handleScroll('right')}
        className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 border border-zinc-200 text-zinc-700 items-center justify-center shadow-md hover:bg-zinc-50 hover:text-amber-600 transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer active:scale-90"
        aria-label="ডানের বইগুলো দেখুন"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Horizontal Scrolling Track
          Responsive sizing:
          Mobile: w-[calc(50%-8px)] (2 cards visible)
          Tablet: sm:w-[calc(33.33%-10px)] md:w-[calc(25%-12px)] (3-4 cards visible)
          Desktop: lg:w-[calc(16.666%-13px)] (~6 cards visible)
      */}
      <div
        ref={containerRef}
        tabIndex={0}
        className="flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar pb-3 pt-1 scroll-smooth snap-x snap-mandatory focus:outline-none"
      >
        {books.map((book) => (
          <div
            key={book.id}
            className="shrink-0 snap-start w-[calc(50%-6px)] sm:w-[calc(33.33%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(16.666%-14px)] min-w-[145px]"
          >
            <ProductCard
              book={book}
              onOpenDetails={onOpenDetails}
              onQuickView={onQuickView}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
