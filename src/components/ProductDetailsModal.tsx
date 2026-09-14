'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, ShoppingBag, Star, Share2, Check, ArrowRight, ShieldCheck, Truck, RefreshCw, BookOpen } from 'lucide-react';
import { Book } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, toBengaliNumber } from '../utils/formatters';

interface ProductDetailsModalProps {
  book: Book;
  allBooks: Book[];
  onClose: () => void;
  onSelectBook: (book: Book) => void;
  onBuyNow: (book: Book, quantity: number) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  book,
  allBooks,
  onClose,
  onSelectBook,
  onBuyNow,
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(book.image);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'specifications'>('description');

  const isWished = isInWishlist(book.id);

  // Gallery images (fallback to main cover)
  const gallery = book.gallery && book.gallery.length > 0 ? book.gallery : [book.image];

  // Related books based on category or author
  const relatedBooks = allBooks
    .filter((b) => b.id !== book.id && (b.category === book.category || b.author === book.author))
    .slice(0, 4);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('বইয়ের লিংক কপি করা হয়েছে!', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header Close Button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-8">
          {/* Top Section: Gallery + Main Specs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Book Image Gallery */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-200 shadow-xl">
                <img
                  src={activeImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                {book.discount > 0 && (
                  <div className="absolute top-3 left-3 bg-[#DC2626] text-white text-xs font-black px-2.5 py-1 rounded-md shadow-sm">
                    {toBengaliNumber(book.discount)}% ছাড়
                  </div>
                )}
              </div>

              {/* Thumbnails if gallery exists */}
              {gallery.length > 1 && (
                <div className="flex items-center gap-2 mt-3">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`w-14 h-18 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImage === img ? 'border-amber-500 scale-105' : 'border-zinc-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="প্রিভিউ" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Book Info Column */}
            <div className="md:col-span-7 flex flex-col">
              {/* Category & Rating */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-amber-100/70 text-amber-900 text-xs font-bold">
                  {book.category}
                </span>

                <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="font-bold text-zinc-900">{toBengaliNumber(book.rating)}</span>
                  <span className="text-zinc-400">({toBengaliNumber(book.reviewCount)} রিভিউ)</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18181B] leading-tight mb-1 font-['Noto_Sans_Bengali']">
                {book.title}
              </h1>

              {/* Author & Publisher */}
              <p className="text-sm sm:text-base text-zinc-700 font-medium mb-1">
                লেখক: <span className="font-bold text-amber-800">{book.author}</span>
              </p>
              <p className="text-xs sm:text-sm text-zinc-500 mb-4">
                প্রকাশনী: <span className="font-semibold text-zinc-700">{book.publisher}</span>
                {book.edition && ` • সংস্করণ: ${book.edition}`}
              </p>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-[#FAF8F4] border border-amber-200/60 mb-6">
                <span className="text-2xl sm:text-3xl font-black text-[#18181B]">
                  {formatPrice(book.price)}
                </span>
                {book.originalPrice > book.price && (
                  <span className="text-sm sm:text-base text-zinc-400 line-through">
                    {formatPrice(book.originalPrice)}
                  </span>
                )}
                {book.discount > 0 && (
                  <span className="text-xs sm:text-sm font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    সেভ {formatPrice(book.originalPrice - book.price)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 text-xs font-semibold mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700">ইন স্টক ({toBengaliNumber(book.stock)} টি কপি উপলব্ধ)</span>
              </div>

              {/* Quantity Selector & Action Buttons */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-zinc-700">পরিমাণ:</span>
                  <div className="flex items-center rounded-xl border border-zinc-300 bg-zinc-50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-zinc-700 hover:bg-zinc-200 font-bold transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 font-bold text-sm text-zinc-900">
                      {toBengaliNumber(quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(book.stock, q + 1))}
                      className="px-3 py-1.5 text-zinc-700 hover:bg-zinc-200 font-bold transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(book, quantity);
                    }}
                    className="flex-1 min-w-[140px] px-6 py-3 rounded-xl bg-[#E5A913] hover:bg-[#D99600] text-zinc-950 font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>কার্টে যোগ করুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onBuyNow(book, quantity);
                      onClose();
                    }}
                    className="flex-1 min-w-[140px] px-6 py-3 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>এখনই কিনুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Wishlist & Share */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(book)}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                      isWished
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                    }`}
                    title="উইশলিস্ট"
                  >
                    <Heart className={`w-5 h-5 ${isWished ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors cursor-pointer"
                    title="শেয়ার করুন"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Assurance / Trust badges */}
              <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-zinc-100 text-center text-[11px] text-zinc-500">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                  <span>১০০% আসল বই</span>
                </div>
                <div className="flex flex-col items-center">
                  <Truck className="w-4 h-4 text-amber-600 mb-1" />
                  <span>দ্রুততম ডেলিভারি</span>
                </div>
                <div className="flex flex-col items-center">
                  <RefreshCw className="w-4 h-4 text-blue-600 mb-1" />
                  <span>৭ দিনে সহজ রিটার্ন</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section: Tabs (Description / Specifications / Reviews) */}
          <div className="border-t border-zinc-200 pt-6">
            <div className="flex items-center gap-4 border-b border-zinc-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('description')}
                className={`pb-2 text-sm sm:text-base font-bold transition-colors relative cursor-pointer ${
                  activeTab === 'description' ? 'text-amber-800' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                বইয়ের সারসংক্ষেপ
                {activeTab === 'description' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F59E0B] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('specifications')}
                className={`pb-2 text-sm sm:text-base font-bold transition-colors relative cursor-pointer ${
                  activeTab === 'specifications' ? 'text-amber-800' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                বই পরিচিতি ও স্পেসিফিকেশন
                {activeTab === 'specifications' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F59E0B] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`pb-2 text-sm sm:text-base font-bold transition-colors relative cursor-pointer ${
                  activeTab === 'reviews' ? 'text-amber-800' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                পাঠক রিভিউ ({toBengaliNumber(book.reviewCount)})
                {activeTab === 'reviews' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F59E0B] rounded-full" />
                )}
              </button>
            </div>

            <div className="py-4 text-sm sm:text-base text-zinc-700 leading-relaxed">
              {activeTab === 'description' && (
                <div className="space-y-3">
                  <p>{book.description}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {book.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-zinc-50 rounded-xl flex justify-between">
                    <span className="text-zinc-500">বইয়ের শিরোনাম:</span>
                    <span className="font-semibold text-zinc-800">{book.title}</span>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-xl flex justify-between">
                    <span className="text-zinc-500">লেখক:</span>
                    <span className="font-semibold text-zinc-800">{book.author}</span>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-xl flex justify-between">
                    <span className="text-zinc-500">প্রকাশক:</span>
                    <span className="font-semibold text-zinc-800">{book.publisher}</span>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-xl flex justify-between">
                    <span className="text-zinc-500">আইএসবিএন (ISBN):</span>
                    <span className="font-semibold text-zinc-800">{book.isbn}</span>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-xl flex justify-between">
                    <span className="text-zinc-500">পৃষ্ঠা সংখ্যা:</span>
                    <span className="font-semibold text-zinc-800">{toBengaliNumber(book.pages || 220)} পৃষ্ঠা</span>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-xl flex justify-between">
                    <span className="text-zinc-500">ভাষা:</span>
                    <span className="font-semibold text-zinc-800">{book.language}</span>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black text-zinc-900">{toBengaliNumber(book.rating)}</span>
                      <span className="text-sm text-zinc-500"> / ৫.০</span>
                      <p className="text-xs text-zinc-600 mt-0.5">সব পাঠকই বইটি সুপারিশ করেছেন</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold bg-amber-500 text-zinc-950 px-3 py-1 rounded-full">
                        ভেরিফায়েড পাঠক
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 border border-zinc-100 rounded-xl">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-zinc-800">রাকিবুল হাসান</span>
                        <span className="text-zinc-400">৩ দিন আগে</span>
                      </div>
                      <div className="flex text-amber-500 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-zinc-600">
                        অসাধারণ একটি বই! কাগজ ও বাঁধাইয়ের মান খুবই উন্নত। শেষের পাতার দ্রুত ডেলিভারি সার্ভিসের জন্য ধন্যবাদ।
                      </p>
                    </div>

                    <div className="p-3.5 border border-zinc-100 rounded-xl">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-zinc-800">ফারহানা তানজিম</span>
                        <span className="text-zinc-400">১ সপ্তাহ আগে</span>
                      </div>
                      <div className="flex text-amber-500 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-zinc-600">
                        বইমেলা থেকে মিস করেছিলাম, শেষের পাতা থেকে অরিজিনাল কপিটি পেয়ে ভীষণ আনন্দিত।
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Books */}
          {relatedBooks.length > 0 && (
            <div className="border-t border-zinc-200 pt-6">
              <h3 className="text-lg font-bold text-zinc-900 mb-3">
                সম্পর্কিত বইসমূহ
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedBooks.map((relBook) => (
                  <div
                    key={relBook.id}
                    onClick={() => {
                      onSelectBook(relBook);
                      setActiveImage(relBook.image);
                      setQuantity(1);
                    }}
                    className="p-2.5 rounded-xl border border-zinc-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all cursor-pointer group"
                  >
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-zinc-100 mb-2">
                      <img
                        src={relBook.image}
                        alt={relBook.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h4 className="text-xs font-bold text-zinc-900 truncate group-hover:text-amber-800">
                      {relBook.title}
                    </h4>
                    <p className="text-[10px] text-zinc-500 truncate">{relBook.author}</p>
                    <span className="text-xs font-black text-amber-800 mt-1 block">
                      {formatPrice(relBook.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
