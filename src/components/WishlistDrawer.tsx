'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatPrice, toBengaliNumber } from '../utils/formatters';

interface WishlistDrawerProps {
  onExploreBooks: () => void;
  onOpenDetails: (book: any) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  onExploreBooks,
  onOpenDetails,
}) => {
  const { wishlist, removeFromWishlist, isWishlistOpen, setIsWishlistOpen } = useWishlist();
  const { addToCart } = useCart();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsWishlistOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-[#FAF8F4]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 leading-tight">
                  পছন্দের তালিকা (উইশলিস্ট)
                </h2>
                <span className="text-xs text-zinc-500">
                  {toBengaliNumber(wishlist.length)} টি বই সংরক্ষিত • শেষের পাতা
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsWishlistOpen(false)}
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {wishlist.length === 0 ? (
              /* Empty Wishlist State */
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400 mb-2">
                  <Heart className="w-10 h-10 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-zinc-800">
                  আপনার উইশলিস্ট খালি
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 max-w-xs leading-relaxed">
                  আপনার পছন্দের বইগুলো এখানে জমা হবে। যেকোনো বইয়ের হার্ট আইকনে ক্লিক করে সংরক্ষণ করুন।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsWishlistOpen(false);
                    onExploreBooks();
                  }}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white font-bold text-sm transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  বই খুঁজুন
                </button>
              </div>
            ) : (
              /* Wishlist Items List */
              <div className="space-y-3.5">
                {wishlist.map((book) => (
                  <div
                    key={book.id}
                    className="p-3 bg-zinc-50/80 border border-zinc-200 rounded-2xl flex gap-3 items-center"
                  >
                    {/* Thumbnail */}
                    <div
                      onClick={() => {
                        setIsWishlistOpen(false);
                        onOpenDetails(book);
                      }}
                      className="w-16 h-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200 cursor-pointer"
                    >
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4
                        onClick={() => {
                          setIsWishlistOpen(false);
                          onOpenDetails(book);
                        }}
                        className="text-xs sm:text-sm font-bold text-zinc-900 truncate hover:text-amber-800 cursor-pointer"
                      >
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 truncate">{book.author}</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xs font-extrabold text-amber-800">
                          {formatPrice(book.price)}
                        </span>
                        {book.originalPrice > book.price && (
                          <span className="text-[10px] text-zinc-400 line-through">
                            {formatPrice(book.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Move to Cart & Remove */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            addToCart(book, 1);
                            removeFromWishlist(book.id);
                          }}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>কার্টে নিন</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeFromWishlist(book.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="উইশলিস্ট থেকে মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer actions */}
          {wishlist.length > 0 && (
            <div className="p-4 border-t border-zinc-200 bg-white">
              <button
                type="button"
                onClick={() => {
                  wishlist.forEach((b) => addToCart(b, 1));
                  setIsWishlistOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
              >
                <span>সবগুলো কার্টে যোগ করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
