'use client';

import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, X, BookOpen, Search } from 'lucide-react';
import { Book, Category } from '../types';
import { CATEGORIES } from '../data/categories';
import { ProductCard } from './ProductCard';
import { toBengaliNumber } from '../utils/formatters';

interface CatalogViewProps {
  books: Book[];
  initialCategory?: string;
  initialSearch?: string;
  onOpenDetails: (book: Book) => void;
  onQuickView: (book: Book) => void;
  onResetToHome: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  books,
  initialCategory,
  initialSearch,
  onOpenDetails,
  onQuickView,
  onResetToHome,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating' | 'discount'>('featured');
  const [searchFilter, setSearchFilter] = useState<string>(initialSearch || '');
  const [maxPrice, setMaxPrice] = useState<number>(1200);
  const [onlyDiscounted, setOnlyDiscounted] = useState<boolean>(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Filtered and Sorted list
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Category match
        if (selectedCategory !== 'all') {
          const cat = CATEGORIES.find((c) => c.id === selectedCategory);
          if (cat && book.category !== cat.name && !book.tags.includes(cat.name)) {
            return false;
          }
        }

        // Search text
        if (searchFilter.trim()) {
          const q = searchFilter.toLowerCase().trim();
          const match =
            book.title.toLowerCase().includes(q) ||
            book.author.toLowerCase().includes(q) ||
            book.publisher.toLowerCase().includes(q) ||
            book.category.toLowerCase().includes(q) ||
            book.tags.some((t) => t.toLowerCase().includes(q));
          if (!match) return false;
        }

        // Price filter
        if (book.price > maxPrice) return false;

        // Only discounted
        if (onlyDiscounted && book.discount <= 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'discount') return b.discount - a.discount;
        return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
      });
  }, [books, selectedCategory, searchFilter, maxPrice, onlyDiscounted, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 select-none">
      {/* Breadcrumb / Top Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <button onClick={onResetToHome} className="hover:text-amber-700 cursor-pointer">
              হোম
            </button>
            <span>/</span>
            <span className="text-zinc-800 font-semibold">বই ও ক্যাটালগ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-['Noto_Sans_Bengali']">
            বইয়ের সংগ্রহ
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            মোট {toBengaliNumber(filteredBooks.length)} টি বই পাওয়া গেছে
          </p>
        </div>

        {/* Sorting & Filter toggle */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Filter trigger */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden px-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>ফিল্টার</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-zinc-300 px-3 py-1.5 rounded-xl shadow-2xs text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-semibold text-zinc-800 outline-none cursor-pointer"
            >
              <option value="featured">ফিচার্ড ও বেস্টসেলার</option>
              <option value="price_low">মূল্য: কম থেকে বেশি</option>
              <option value="price_high">মূল্য: বেশি থেকে কম</option>
              <option value="rating">পাঠক রেটিং</option>
              <option value="discount">সর্বোচ্চ ছাড়</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Filters (Desktop) */}
        <aside
          className={`lg:col-span-3 space-y-6 ${
            isMobileFilterOpen
              ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto block'
              : 'hidden lg:block'
          }`}
        >
          {isMobileFilterOpen && (
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-4">
              <span className="font-bold text-base text-zinc-900">ফিল্টারসমূহ</span>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-lg bg-zinc-100 text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Search within catalog */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-zinc-800 block">বই অনুসন্ধান</span>
            <div className="relative">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="নাম বা লেখক..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-300 bg-zinc-50 focus:bg-white outline-none"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Categories list */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800">ক্যাটাগরি</span>
              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="text-[11px] text-amber-700 hover:underline font-semibold cursor-pointer"
                >
                  সব দেখুন
                </button>
              )}
            </div>

            <div className="space-y-1 text-xs max-h-60 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex justify-between items-center ${
                  selectedCategory === 'all'
                    ? 'bg-amber-100/70 text-amber-900 font-bold'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <span>সব ক্যাটাগরি</span>
                <span className="text-[10px] text-zinc-400">{toBengaliNumber(books.length)}</span>
              </button>

              {CATEGORIES.filter((c) => c.id !== 'more').map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex justify-between items-center ${
                    selectedCategory === cat.id
                      ? 'bg-amber-100/70 text-amber-900 font-bold'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] text-zinc-400">
                    {toBengaliNumber(books.filter((b) => b.category === cat.name).length)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-800">সর্বোচ্চ মূল্য</span>
              <span className="font-extrabold text-amber-800">৳{toBengaliNumber(maxPrice)}</span>
            </div>
            <input
              type="range"
              min={200}
              max={1500}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>৳২০০</span>
              <span>৳১৫০০+</span>
            </div>
          </div>

          {/* Discount Toggle */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-2xs">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-zinc-800">
              <input
                type="checkbox"
                checked={onlyDiscounted}
                onChange={(e) => setOnlyDiscounted(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
              />
              <span>শুধুমাত্র বিশেষ ছাড়ের বই</span>
            </label>
          </div>

          {/* Apply button on mobile modal */}
          {isMobileFilterOpen && (
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-3 bg-[#F59E0B] text-zinc-950 font-bold rounded-xl text-sm"
            >
              ফিল্টার প্রয়োগ করুন ({toBengaliNumber(filteredBooks.length)} টি বই)
            </button>
          )}
        </aside>

        {/* Right Main Grid */}
        <main className="lg:col-span-9">
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
              {filteredBooks.map((book) => (
                <ProductCard
                  key={book.id}
                  book={book}
                  onOpenDetails={onOpenDetails}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 space-y-3">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-zinc-800">
                দুঃখিত, কোনো বই পাওয়া যায়নি
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                আপনার নির্বাচিত ফিল্টারে কোনো বই খুঁজে পাওয়া যায়নি। ফিল্টার রিসেট করে পুনরায় চেষ্টা করুন।
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchFilter('');
                  setMaxPrice(1200);
                  setOnlyDiscounted(false);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-600 transition-colors"
              >
                সব ফিল্টার মুছুন
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
