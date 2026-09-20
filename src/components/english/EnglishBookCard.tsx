'use client';

import React from 'react';
import { ShoppingBag, Eye, Heart, Star, Check } from 'lucide-react';
import { Book } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface EnglishBookCardProps {
  book: Book;
  onOpenDetails: (book: Book) => void;
  onQuickView?: (book: Book) => void;
}

export const EnglishBookCard: React.FC<EnglishBookCardProps> = ({
  book,
  onOpenDetails,
  onQuickView,
}) => {
  const { getBookDisplayName, formatPrice } = useLanguage();
  const { addToCart, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorited = isInWishlist(book.id);
  const isInCart = cart.some((item) => item.book.id === book.id);
  const displayName = getBookDisplayName(book);

  const discountPercent =
    book.discount ||
    (book.originalPrice && book.originalPrice > book.price
      ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
      : 0);

  return (
    <div className="group relative flex flex-col h-full bg-[#1c1914] rounded-2xl border border-[#2d271c] hover:border-[#E5A913]/60 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-amber-950/20 overflow-hidden text-left">
      {/* Cover Image Area */}
      <div
        onClick={() => onOpenDetails(book)}
        className="relative w-full pt-[135%] overflow-hidden bg-[#242017] cursor-pointer"
      >
        <img
          src={book.cover_image || book.image}
          alt={displayName}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-40 group-hover:opacity-60 transition-opacity" />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#D32F2F] text-white text-[10px] sm:text-xs font-black tracking-wide uppercase shadow-sm">
            -{discountPercent}%
          </span>
        )}

        {/* Bestseller Badge if applicable */}
        {book.isBestseller && (
          <span className="absolute top-2.5 right-11 px-2 py-0.5 rounded-md bg-[#E5A913] text-zinc-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
            Bestseller
          </span>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(book);
          }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
            isFavorited
              ? 'bg-[#E5A913] text-zinc-950 scale-110 shadow-md'
              : 'bg-black/50 text-white hover:bg-black/80 hover:text-[#E5A913]'
          }`}
          title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-zinc-950' : ''}`} />
        </button>

        {/* Quick View Button overlay on hover */}
        {onQuickView && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(book);
            }}
            className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-2 rounded-xl bg-[#242017]/90 text-[#E5A913] hover:bg-[#E5A913] hover:text-zinc-950 transition-all shadow-md cursor-pointer scale-90 group-hover:scale-100"
            title="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Book Metadata */}
      <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          {/* Category */}
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-[#E5A913] truncate block">
            {book.category}
          </span>

          {/* Book Title */}
          <h3
            onClick={() => onOpenDetails(book)}
            className="text-xs sm:text-sm font-bold text-white group-hover:text-[#E5A913] transition-colors line-clamp-2 leading-snug cursor-pointer"
            title={displayName}
          >
            {displayName}
          </h3>

          {/* Author */}
          <p className="text-[11px] sm:text-xs text-zinc-400 truncate">
            {book.author}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 pt-0.5">
            <Star className="w-3 h-3 text-[#E5A913] fill-[#E5A913]" />
            <span className="text-xs font-bold text-zinc-200">
              {book.rating?.toFixed(1) || '4.8'}
            </span>
            <span className="text-[10px] text-zinc-500">
              ({book.reviewCount || 42})
            </span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-[#2a2419] flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-[#E5A913]">
                {formatPrice(book.price)}
              </span>
              {(book.originalPrice || book.old_price) && (book.originalPrice || book.old_price)! > book.price && (
                <span className="text-[11px] text-zinc-500 line-through">
                  {formatPrice(book.originalPrice || book.old_price!)}
                </span>
              )}
            </div>

            {book.stock <= 3 && book.stock > 0 && (
              <span className="text-[10px] text-amber-500 font-semibold">
                Only {book.stock} left
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => addToCart(book, 1)}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
              isInCart
                ? 'bg-zinc-800 text-[#E5A913] border border-[#E5A913]/40'
                : 'bg-[#E5A913] hover:bg-[#d99a07] text-zinc-950 shadow-xs'
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>In Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
