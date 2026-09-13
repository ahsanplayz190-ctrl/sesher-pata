'use client';

import React from 'react';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { Book } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice, toBengaliNumber } from '../utils/formatters';

interface ProductCardProps {
  book: Book;
  onOpenDetails: (book: Book) => void;
  onQuickView: (book: Book) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  book,
  onOpenDetails,
  onQuickView,
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isWished = isInWishlist(book.id);

  return (
    <div className="group relative bg-white rounded-2xl border border-zinc-200/80 hover:border-amber-300 shadow-2xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden select-none">
      {/* Top Image Container */}
      <div
        onClick={() => onOpenDetails(book)}
        className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100 cursor-pointer"
      >
        {/* Book Cover Image */}
        <img
          src={book.image}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Book spine lighting overlay */}
        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/25 via-white/10 to-transparent pointer-events-none" />

        {/* Discount Badge */}
        {book.discount > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-[#DC2626] to-[#EF4444] text-white text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-md shadow-xs pointer-events-none">
            {toBengaliNumber(book.discount)}% ছাড়
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(book);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-xs cursor-pointer ${
            isWished
              ? 'bg-rose-500 text-white scale-105 ring-2 ring-rose-300'
              : 'bg-white/90 text-zinc-600 hover:text-rose-500 hover:bg-white hover:scale-110'
          }`}
          aria-label={isWished ? 'উইশলিস্ট থেকে মুছুন' : 'উইশলিস্টে যুক্ত করুন'}
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button - appears on hover (desktop) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(book);
          }}
          className="hidden sm:flex absolute bottom-2.5 left-1/2 -translate-x-1/2 items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black text-white text-xs font-semibold backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md translate-y-2 group-hover:translate-y-0 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>কুইক ভিউ</span>
        </button>
      </div>

      {/* Book Information Section */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Category & Publisher */}
          <div className="flex items-center justify-between gap-1 text-[11px] text-zinc-500 mb-1">
            <span className="truncate text-amber-700 font-medium">
              {book.category}
            </span>
            {book.rating && (
              <span className="flex items-center gap-0.5 text-zinc-600 shrink-0 font-medium">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{toBengaliNumber(book.rating)}</span>
              </span>
            )}
          </div>

          {/* Book Title */}
          <h3
            onClick={() => onOpenDetails(book)}
            className="font-bold text-xs sm:text-sm text-zinc-900 group-hover:text-amber-800 transition-colors line-clamp-1 cursor-pointer"
            title={book.title}
          >
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-[11px] sm:text-xs text-zinc-500 truncate mt-0.5">
            {book.author}
          </p>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-1.5">
          {/* Prices */}
          <div className="flex flex-col leading-tight">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-[#18181B]">
                {formatPrice(book.price)}
              </span>
              {book.originalPrice > book.price && (
                <span className="text-[10px] sm:text-xs text-zinc-400 line-through">
                  {formatPrice(book.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(book, 1);
            }}
            className="shrink-0 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-amber-50 hover:bg-[#F59E0B] text-amber-800 hover:text-zinc-950 font-semibold text-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95 border border-amber-200/80 hover:border-[#F59E0B]"
            title="কার্টে যোগ করুন"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs font-bold">কার্ট</span>
          </button>
        </div>
      </div>
    </div>
  );
};
