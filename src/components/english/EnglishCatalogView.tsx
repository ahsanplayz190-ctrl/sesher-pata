'use client';

import React, { useState, useMemo } from 'react';
import { Filter, X, ArrowUpDown, RotateCcw, BookOpen } from 'lucide-react';
import { Book } from '../../types';
import { EnglishBookCard } from './EnglishBookCard';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';

interface EnglishCatalogViewProps {
  books: Book[];
  initialCategory?: string;
  initialSearch?: string;
  onOpenDetails: (book: Book) => void;
  onQuickView: (book: Book) => void;
  onResetToHome?: () => void;
}

const PRICE_RANGES = [
  { id: 'all', label: 'All Prices' },
  { id: 'under_300', label: 'Under ৳300', min: 0, max: 300 },
  { id: '300_600', label: '৳300 - ৳600', min: 300, max: 600 },
  { id: '600_1000', label: '৳600 - ৳1,000', min: 600, max: 1000 },
  { id: 'over_1000', label: 'Over ৳1,000', min: 1000, max: 99999 },
];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Most Relevant' },
  { id: 'popularity', label: 'Most Popular' },
  { id: 'newest', label: 'New Releases' },
  { id: 'price_low', label: 'Price: Low to High' },
  { id: 'price_high', label: 'Price: High to Low' },
  { id: 'rating', label: 'Highest Rated' },
];

export const EnglishCatalogView: React.FC<EnglishCatalogViewProps> = ({
  books,
  initialCategory = 'all',
  initialSearch = '',
  onOpenDetails,
  onQuickView,
  onResetToHome,
}) => {
  const { categories } = useData();
  const { getCategoryDisplayName } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [selectedPublisher, setSelectedPublisher] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(16);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Extract author and publisher options
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

  // Filtering
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      if (
        selectedCategory !== 'all' &&
        b.category !== selectedCategory &&
        (b as any).categoryEn !== selectedCategory
      ) {
        return false;
      }

      if (selectedAuthor !== 'all' && b.author !== selectedAuthor) {
        return false;
      }

      if (selectedPublisher !== 'all' && b.publisher !== selectedPublisher) {
        return false;
      }

      if (selectedPriceRange !== 'all') {
        const range = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
        if (range && (b.price < range.min! || b.price > range.max!)) {
          return false;
        }
      }

      if (inStockOnly && (b.stock || 0) <= 0) {
        return false;
      }

      if (initialSearch.trim()) {
        const q = initialSearch.toLowerCase();
        const titleEn = (b.english_name || '').toLowerCase();
        const titleBn = (b.bangla_name || b.title || '').toLowerCase();
        const author = (b.author || '').toLowerCase();
        const cat = (b.category || '').toLowerCase();
        const isbn = (b.isbn || '').toLowerCase();
        const match =
          titleEn.includes(q) ||
          titleBn.includes(q) ||
          author.includes(q) ||
          cat.includes(q) ||
          isbn.includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [
    books,
    selectedCategory,
    selectedAuthor,
    selectedPublisher,
    selectedPriceRange,
    inStockOnly,
    initialSearch,
  ]);

  // Sorting
  const sortedBooks = useMemo(() => {
    const list = [...filteredBooks];
    switch (sortBy) {
      case 'popularity':
        return list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      case 'newest':
        return list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      case 'price_low':
        return list.sort((a, b) => a.price - b.price);
      case 'price_high':
        return list.sort((a, b) => b.price - a.price);
      case 'rating':
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return list;
    }
  }, [filteredBooks, sortBy]);

  const displayedBooks = sortedBooks.slice(0, visibleCount);

  const resetFilters = () => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-zinc-100 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#2a2418]">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-white flex items-center gap-2">
            <span>Book Catalog</span>
            {initialSearch && (
              <span className="text-xs font-sans font-normal text-[#E5A913] bg-[#292215] px-2.5 py-1 rounded-lg border border-[#3e3421]">
                Search: "{initialSearch}"
              </span>
            )}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Showing {displayedBooks.length} of {sortedBooks.length} books found
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile filter toggle */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#221e17] border border-[#393121] text-xs font-bold text-[#E5A913]"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#221e17] border border-[#393121] text-xs text-white focus:outline-hidden focus:border-[#E5A913] cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-[#1c1913]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="p-2 rounded-xl bg-[#221e17] text-zinc-400 hover:text-white border border-[#393121]"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-6">
        {/* Sidebar Filters */}
        <aside
          className={`space-y-6 ${
            isMobileFilterOpen
              ? 'block fixed inset-0 z-50 bg-[#15130f] p-6 overflow-y-auto'
              : 'hidden md:block'
          }`}
        >
          {isMobileFilterOpen && (
            <div className="flex items-center justify-between pb-4 border-b border-[#2e261a]">
              <h3 className="font-bold text-base text-white">Filter Books</h3>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Categories */}
          <div className="space-y-2 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E5A913]">
              Categories
            </h4>
            <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[#E5A913] text-zinc-950 font-bold'
                    : 'text-zinc-300 hover:bg-[#221e17]'
                }`}
              >
                All Categories ({books.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedCategory === cat.name
                      ? 'bg-[#E5A913] text-zinc-950 font-bold'
                      : 'text-zinc-300 hover:bg-[#221e17]'
                  }`}
                >
                  <span className="truncate">{getCategoryDisplayName(cat)}</span>
                  <span className="text-[10px] text-zinc-500 shrink-0 ml-1">
                    {cat.bookCount || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E5A913]">
              Price Range
            </h4>
            <div className="space-y-1">
              {PRICE_RANGES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedPriceRange(r.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    selectedPriceRange === r.id
                      ? 'bg-[#E5A913] text-zinc-950 font-bold'
                      : 'text-zinc-300 hover:bg-[#221e17]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded border-[#393121] bg-[#221e17] text-[#E5A913] focus:ring-0 cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {isMobileFilterOpen && (
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-2.5 bg-[#E5A913] text-zinc-950 font-bold rounded-xl text-xs mt-4"
            >
              Apply Filters ({sortedBooks.length})
            </button>
          )}
        </aside>

        {/* Books Grid */}
        <main className="md:col-span-3">
          {displayedBooks.length === 0 ? (
            <div className="p-12 text-center space-y-3 rounded-2xl bg-[#1a1712] border border-[#2b251a]">
              <BookOpen className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Books Found</h3>
              <p className="text-xs text-zinc-400">
                Try adjusting your search terms or filters to find what you are looking for.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-[#E5A913] text-zinc-950 font-bold text-xs"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {displayedBooks.map((b) => (
                  <EnglishBookCard
                    key={b.id}
                    book={b}
                    onOpenDetails={onOpenDetails}
                    onQuickView={onQuickView}
                  />
                ))}
              </div>

              {visibleCount < sortedBooks.length && (
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="px-8 py-3 rounded-full bg-[#242017] hover:bg-[#2f291e] border border-[#3e3423] text-xs font-bold text-white transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    Load More Books ({sortedBooks.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
