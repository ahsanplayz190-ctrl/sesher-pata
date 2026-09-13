'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BOOKS } from '../data/books';
import { Book } from '../types';
import { formatPrice } from '../utils/formatters';

interface SearchBarProps {
  onSelectBook: (book: Book) => void;
  onSearchSubmit?: (query: string) => void;
  isMobile?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectBook,
  onSearchSubmit,
  isMobile = false,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter books in real-time
  const searchResults = query.trim() === ''
    ? []
    : BOOKS.filter((book) => {
        const q = query.toLowerCase().trim();
        return (
          book.title.toLowerCase().includes(q) ||
          book.author.toLowerCase().includes(q) ||
          book.publisher.toLowerCase().includes(q) ||
          book.category.toLowerCase().includes(q) ||
          book.tags.some((t) => t.toLowerCase().includes(q))
        );
      }).slice(0, 6);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        onSelectBook(searchResults[0]);
        setIsOpen(false);
      } else if (onSearchSubmit) {
        onSearchSubmit(query);
        setIsOpen(false);
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${isMobile ? 'max-w-full' : 'max-w-xl'}`}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="বই, লেখক বা প্রকাশক খুঁজুন..."
          className="w-full bg-[#FAF8F4] sm:bg-white text-zinc-900 placeholder:text-zinc-400 pl-11 pr-10 py-2.5 sm:py-2.5 rounded-full border border-zinc-300/80 focus:border-[#D97706] focus:ring-2 focus:ring-[#F59E0B]/20 outline-none text-sm transition-all shadow-inner sm:shadow-sm"
        />

        <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 p-1 text-zinc-400 hover:text-zinc-700 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Animated Search Suggestion Dropdown */}
      <AnimatePresence>
        {isOpen && query.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-200/80 overflow-hidden z-50 divide-y divide-zinc-100"
          >
            <div className="p-2.5 bg-zinc-50/70 border-b border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>অনুসন্ধান ফলাফল ({searchResults.length})</span>
              {searchResults.length > 0 && (
                <span className="text-[11px] text-amber-700 font-medium">ক্লিক করে বিস্তারিত দেখুন</span>
              )}
            </div>

            {searchResults.length > 0 ? (
              <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100">
                {searchResults.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => {
                      onSelectBook(book);
                      setIsOpen(false);
                    }}
                    className="p-3 flex items-center gap-3.5 hover:bg-amber-50/60 cursor-pointer transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-16 rounded-md overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200 shadow-xs relative">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    </div>

                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-zinc-900 truncate group-hover:text-amber-800 transition-colors">
                        {book.title}
                      </h4>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">
                        {book.author} • <span className="text-zinc-400">{book.publisher}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-amber-700">
                          {formatPrice(book.price)}
                        </span>
                        {book.originalPrice > book.price && (
                          <span className="text-[11px] text-zinc-400 line-through">
                            {formatPrice(book.originalPrice)}
                          </span>
                        )}
                        <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                          {book.discount}% ছাড়
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-zinc-500">
                <BookOpen className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                <p className="text-sm font-medium text-zinc-700">
                  দুঃখিত, কোনো বই পাওয়া যায়নি
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  অন্য কোনো নাম, লেখক বা প্রকাশক দিয়ে চেষ্টা করুন
                </p>
              </div>
            )}

            {searchResults.length > 0 && onSearchSubmit && (
              <div className="p-2 bg-zinc-50 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onSearchSubmit(query);
                    setIsOpen(false);
                  }}
                  className="text-xs text-amber-700 hover:text-amber-800 font-semibold py-1 px-3 hover:underline"
                >
                  "{query}" সংক্রান্ত সব ফলাফল দেখুন →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
