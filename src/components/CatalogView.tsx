'use client';

import React, { useState, useMemo } from 'react';
import { Filter, X, ArrowUpDown, RotateCcw, BookOpen } from 'lucide-react';
import { Book } from '../types';
import { ProductCard } from './ProductCard';
import { toBengaliNumber } from '../utils/formatters';
import { useData } from '../context/DataContext';

interface CatalogViewProps {
  books: Book[];
  initialCategory?: string;
  initialSearch?: string;
  onOpenDetails: (book: Book) => void;
  onQuickView: (book: Book) => void;
  onResetToHome?: () => void;
}

const PRICE_RANGES = [
  { id: 'all', label: 'সকল দাম' },
  { id: 'under_200', label: '৳২০০ এর নিচে', min: 0, max: 200 },
  { id: '200_500', label: '৳২০০ - ৳৫০০', min: 200, max: 500 },
  { id: '500_1000', label: '৳৫০০ - ৳১,০০০', min: 500, max: 1000 },
  { id: 'over_1000', label: '৳১,০০০ এর বেশি', min: 1000, max: 99999 },
];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'প্রাসঙ্গিকতা' },
  { id: 'popularity', label: 'জনপ্রিয়তা' },
  { id: 'newest', label: 'নতুন বই' },
  { id: 'price_low', label: 'দাম: কম থেকে বেশি' },
  { id: 'price_high', label: 'দাম: বেশি থেকে কম' },
  { id: 'rating', label: 'সর্বোচ্চ রেটিং' },
];

export const CatalogView: React.FC<CatalogViewProps> = ({
  books,
  initialCategory = 'all',
  initialSearch = '',
  onOpenDetails,
  onQuickView,
  onResetToHome,
}) => {
  const { categories } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [selectedPublisher, setSelectedPublisher] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(18);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Dynamic Authors and Publishers list from books
  const authorsList = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.author) set.add(b.author);
    });
    return Array.from(set).slice(0, 10);
  }, [books]);

  const publishersList = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.publisher) set.add(b.publisher);
    });
    return Array.from(set).slice(0, 8);
  }, [books]);

  // Filter & Sort Logic
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];

    // Search query filter
    if (initialSearch && initialSearch.trim() !== '') {
      const q = initialSearch.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.publisher.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(
        (b) =>
          b.category.includes(selectedCategory) ||
          b.tags.some((t) => selectedCategory.includes(t) || t.includes(selectedCategory))
      );
    }

    // Author filter
    if (selectedAuthor !== 'all') {
      result = result.filter((b) => b.author.includes(selectedAuthor));
    }

    // Publisher filter
    if (selectedPublisher !== 'all') {
      result = result.filter((b) => b.publisher.includes(selectedPublisher));
    }

    // In stock filter
    if (inStockOnly) {
      result = result.filter((b) => b.stock > 0);
    }

    // Price range filter
    if (selectedPriceRange !== 'all') {
      const range = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
      if (range && range.min !== undefined && range.max !== undefined) {
        result = result.filter((b) => b.price >= range.min && b.price <= range.max);
      }
    }

    // Sorting
    if (sortBy === 'price_low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    } else if (sortBy === 'popularity') {
      result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }

    return result;
  }, [books, initialSearch, selectedCategory, selectedAuthor, selectedPublisher, inStockOnly, selectedPriceRange, sortBy]);

  const displayedBooks = filteredAndSortedBooks.slice(0, visibleCount);

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedAuthor('all');
    setSelectedPublisher('all');
    setSelectedPriceRange('all');
    setInStockOnly(false);
    setSortBy('relevance');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedAuthor !== 'all' ||
    selectedPublisher !== 'all' ||
    selectedPriceRange !== 'all' ||
    inStockOnly;

  return (
    <div className="w-full select-none font-['Noto_Sans_Bengali'] pb-12">
      {/* Breadcrumb & Section Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 mb-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onResetToHome}
              className="hover:text-amber-800 transition-colors cursor-pointer"
            >
              হোম
            </button>
            <span>/</span>
            <span className="font-bold text-zinc-900">বইসমূহ ও ক্যাটালগ</span>
            {selectedCategory !== 'all' && (
              <>
                <span>/</span>
                <span className="text-amber-700 font-semibold">{selectedCategory}</span>
              </>
            )}
          </div>

          <div className="text-xs font-bold text-zinc-700">
            মোট পাওয়া গেছে: <span className="text-amber-800">{toBengaliNumber(filteredAndSortedBooks.length)}</span> টি বই
          </div>
        </div>

        {/* Header Ribbon */}
        <div className="bg-[#211E15] text-[#FAF8F4] p-4 sm:p-6 rounded-2xl border border-[#3A3423] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {selectedCategory === 'all' ? 'আমাদের প্রকাশিত সকল বই' : `${selectedCategory} কালেকশন`}
            </h1>
            <p className="text-xs text-zinc-300 mt-1">
              শতভাগ আসল ও মানসম্মত বই সরাসরি আপনার ঠিকানায়
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 shrink-0 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#E5A913]" /> সাজান:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#14120B] text-zinc-200 border border-[#3A3423] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#E5A913] cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips & Mobile Filter Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4 flex items-center justify-between gap-3">
        {/* Active Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ফিল্টার মুছুন</span>
            </button>
          )}

          {selectedCategory !== 'all' && (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1 border border-amber-200">
              ক্যাটাগরি: {selectedCategory}
              <X
                className="w-3 h-3 cursor-pointer hover:text-amber-700"
                onClick={() => setSelectedCategory('all')}
              />
            </span>
          )}

          {selectedAuthor !== 'all' && (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1 border border-amber-200">
              লেখক: {selectedAuthor}
              <X
                className="w-3 h-3 cursor-pointer hover:text-amber-700"
                onClick={() => setSelectedAuthor('all')}
              />
            </span>
          )}

          {selectedPriceRange !== 'all' && (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1 border border-amber-200">
              দাম: {PRICE_RANGES.find((r) => r.id === selectedPriceRange)?.label}
              <X
                className="w-3 h-3 cursor-pointer hover:text-amber-700"
                onClick={() => setSelectedPriceRange('all')}
              />
            </span>
          )}
        </div>

        {/* Mobile Filter Toggle Button */}
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden px-4 py-2 bg-[#211E15] text-[#E5A913] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>ফিল্টার</span>
        </button>
      </div>

      {/* Main Layout: Left Sidebar Filters + Right Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Left Sidebar Filters */}
        <aside
          className={`w-full lg:w-60 xl:w-64 shrink-0 space-y-6 ${
            isMobileFilterOpen
              ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto block'
              : 'hidden lg:block'
          }`}
        >
          {isMobileFilterOpen && (
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-4">
              <span className="font-bold text-base text-zinc-900">ফিল্টার</span>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-100 text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Section 1: Categories */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E3D5] shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-2">
              ক্যাটাগরি
            </h4>
            <div className="space-y-2 max-h-56 overflow-y-auto text-xs text-zinc-700 pr-1">
              <label
                onClick={() => setSelectedCategory('all')}
                className="flex items-center gap-2 cursor-pointer hover:text-amber-800 transition-colors"
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    selectedCategory === 'all' ? 'border-[#E5A913] bg-white' : 'border-zinc-300'
                  }`}
                >
                  {selectedCategory === 'all' && <span className="w-2 h-2 rounded-full bg-[#E5A913]" />}
                </span>
                <span className={selectedCategory === 'all' ? 'font-bold text-zinc-950' : 'text-zinc-600'}>
                  সকল ক্যাটাগরি
                </span>
              </label>

              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <label
                    key={cat.id}
                    onClick={() => setSelectedCategory(isSelected ? 'all' : cat.name)}
                    className="flex items-center justify-between gap-2 cursor-pointer hover:text-amber-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[#E5A913] bg-white' : 'border-zinc-300'
                        }`}
                      >
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#E5A913]" />}
                      </span>
                      <span className={isSelected ? 'font-bold text-zinc-950' : 'text-zinc-600'}>
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-medium">({toBengaliNumber(cat.bookCount)})</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 2: Authors */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E3D5] shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-2">
              লেখক
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto text-xs text-zinc-700 pr-1">
              {authorsList.map((auth) => {
                const isSelected = selectedAuthor === auth;
                return (
                  <label
                    key={auth}
                    onClick={() => setSelectedAuthor(isSelected ? 'all' : auth)}
                    className="flex items-center gap-2 cursor-pointer hover:text-amber-800 transition-colors"
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#E5A913] bg-white' : 'border-zinc-300'
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#E5A913]" />}
                    </span>
                    <span className={`line-clamp-1 ${isSelected ? 'font-bold text-zinc-950' : 'text-zinc-600'}`}>
                      {auth}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 3: Price Range */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E3D5] shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-2">
              মূল্য পরিসীমা
            </h4>
            <div className="space-y-2 text-xs text-zinc-700">
              {PRICE_RANGES.map((range) => {
                const isSelected = selectedPriceRange === range.id;
                return (
                  <label
                    key={range.id}
                    onClick={() => setSelectedPriceRange(range.id)}
                    className="flex items-center gap-2 cursor-pointer hover:text-amber-800 transition-colors"
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#E5A913] bg-white' : 'border-zinc-300'
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#E5A913]" />}
                    </span>
                    <span className={isSelected ? 'font-bold text-zinc-950' : 'text-zinc-600'}>
                      {range.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 4: In Stock Checkbox */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E3D5] shadow-2xs">
            <label className="flex items-center gap-2.5 text-xs text-zinc-800 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#E5A913] focus:ring-[#E5A913]"
              />
              <span>কেবল স্টকে থাকা বই দেখান</span>
            </label>
          </div>
        </aside>

        {/* Right Main Product Area: 5-Column Grid */}
        <main className="flex-1 min-w-0">
          {displayedBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {displayedBooks.map((book) => (
                <div key={book.id} className="h-full">
                  <ProductCard
                    book={book}
                    onOpenDetails={onOpenDetails}
                    onQuickView={onQuickView}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center space-y-4">
              <BookOpen className="w-12 h-12 text-zinc-300 mx-auto" />
              <h3 className="text-lg font-bold text-zinc-800">কোনো বই পাওয়া যায়নি</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                আপনার নির্বাচিত ফিল্টারে কোনো বই খুঁজে পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-5 py-2 rounded-xl bg-[#E5A913] text-zinc-950 font-bold text-xs shadow-xs hover:bg-[#D99600] transition-colors cursor-pointer"
              >
                সকল ফিল্টার রিসেট করুন
              </button>
            </div>
          )}

          {/* Load More Button */}
          {visibleCount < filteredAndSortedBooks.length && (
            <div className="text-center mt-10">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="bg-[#211E15] hover:bg-black text-[#E5A913] hover:text-white font-bold px-8 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition-all cursor-pointer active:scale-95 border border-[#3A3423]"
              >
                <span>আরও দেখুন ({toBengaliNumber(filteredAndSortedBooks.length - visibleCount)} টি অবশিষ্ট)</span>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};


