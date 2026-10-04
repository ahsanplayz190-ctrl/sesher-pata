'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { Book } from '../types';
import { formatPrice } from '../utils/formatters';
import { trackSearch } from '../utils/metaPixel';

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
  const { books = [] } = useData() || {};
  const activeBooks = Array.isArray(books) ? books : [];
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter books in real-time
  const searchResults = query.trim() === ''
    ? []
    : activeBooks.filter((book) => {
        const q = query.toLowerCase().trim();
        return (
          (book.title && book.title.toLowerCase().includes(q)) ||
          (book.bangla_name && book.bangla_name.toLowerCase().includes(q)) ||
          (book.english_name && book.english_name.toLowerCase().includes(q)) ||
          (book.author && book.author.toLowerCase().includes(q)) ||
          (book.publisher && book.publisher.toLowerCase().includes(q)) ||
          (book.category && book.category.toLowerCase().includes(q)) ||
          (book.isbn && book.isbn.toLowerCase().includes(q)) ||
          (Array.isArray(book.tags) && book.tags.some((t) => t.toLowerCase().includes(q)))
        );
      }).slice(0, 8);

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
      if (query.trim()) {
        trackSearch(query.trim());
      }
      if (searchResults.length > 0) {
        onSelectBook(searchResults[0]);
        setIsOpen(false);
      } else if (onSearchSubmit) {
        onSearchSubmit(query);
        setIsOpen(false);
      }
    }
  };

  const handleSearchClick = () => {
    if (query.trim()) {
      trackSearch(query.trim());
    }
    if (searchResults.length > 0) {
      onSelectBook(searchResults[0]);
      setIsOpen(false);
    } else if (onSearchSubmit) {
      onSearchSubmit(query);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${isMobile ? 'max-w-full' : 'max-w-xl'}`}>
      <div className="relative flex items-center shadow-xs rounded-lg overflow-hidden border border-amber-300/40 focus-within:border-[#E5A913] bg-white transition-all">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="বই, লেখক বা প্রকাশনী খুঁজুন..."
          className="w-full bg-white text-zinc-900 placeholder:text-zinc-400 px-4 py-2.5 outline-none text-sm font-medium"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={handleSearchClick}
          className="bg-[#E5A913] hover:bg-[#D99600] text-zinc-950 font-extrabold px-5 py-2.5 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          aria-label="খুঁজুন"
        >
          <Search className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
        </button>
      </div>

      {/* Animated Search Suggestion Dropdown */}
      <AnimatePresence>
        {isOpen && (query.trim().length > 0 || searchResults.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-200/80 overflow-hidden z-50 divide-y divide-zinc-100 font-['Noto_Sans_Bengali']"
          >
            <div className="p-2.5 bg-zinc-50/90 border-b border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>অনুসন্ধান ফলাফল ({searchResults.length})</span>
              {searchResults.length > 0 && (
                <span className="text-[11px] text-[#E5A913] font-bold">ক্লিক করে বিস্তারিত দেখুন</span>
              )}
            </div>

            {searchResults.length > 0 ? (
              <div className="py-1 max-h-80 overflow-y-auto divide-y divide-zinc-50">
                {searchResults.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => {
                      onSelectBook(book);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-amber-50/60 cursor-pointer transition-colors"
                  >
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-10 h-13 object-cover rounded-md shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-zinc-900 truncate">{book.title}</h4>
                      <p className="text-xs text-zinc-500 truncate">{book.author} — <span className="text-zinc-400">{book.category}</span></p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-black text-[#B45309]">{formatPrice(book.price)}</span>
                        {book.originalPrice > book.price && (
                          <span className="text-[10px] text-zinc-400 line-through">
                            {formatPrice(book.originalPrice)}
                          </span>
                        )}
                        <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-bold ml-auto">
                          {book.publisher}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-zinc-500 space-y-3">
                <BookOpen className="w-8 h-8 text-zinc-300 mx-auto" />
                <div>
                  <p className="font-bold text-zinc-700 text-sm">কোনো বই পাওয়া যায়নি</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">অন্য কোনো নাম, লেখক বা ক্যাটাগরি লিখে খুঁজুন</p>
                </div>

                {/* Popular Tags Quick Search */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-zinc-400 block mb-2">জনপ্রিয় অনুসন্ধান:</span>
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {['মিসির আলি', 'ফেলুদা', 'উপন্যাস', 'ইসলামিক', 'হুমায়ূন আহমেদ', 'রবীন্দ্রনাথ'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setQuery(tag);
                          setIsOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-[#E5A913] text-zinc-800 hover:text-zinc-950 font-medium text-[11px] border border-amber-200/70 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
