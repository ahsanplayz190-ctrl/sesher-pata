'use client';

import React, { useState } from 'react';
import { Book, Category } from '../types';
import { ProductCard } from './ProductCard';
import { BookOpen, Feather } from 'lucide-react';
import { toBengaliNumber } from '../utils/formatters';
import { useData } from '../context/DataContext';

interface AuthorsViewProps {
  books: Book[];
  onOpenDetails: (book: Book) => void;
  onQuickView: (book: Book) => void;
  onResetToHome: () => void;
}

export const AuthorsView: React.FC<AuthorsViewProps> = ({
  books,
  onOpenDetails,
  onQuickView,
  onResetToHome,
}) => {
  const { authors } = useData();
  const [selectedAuthor, setSelectedAuthor] = useState<string>(authors[0]?.name || 'হুমায়ূন আহমেদ');

  const authorBooks = books.filter((b) => b.author.includes(selectedAuthor));
  const currentBio = authors.find((a) => a.name === selectedAuthor) || authors[0] || {
    name: selectedAuthor,
    era: '',
    role: 'লেখক',
    bio: '',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 select-none">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
        <button onClick={onResetToHome} className="hover:text-amber-700 cursor-pointer">
          হোম
        </button>
        <span>/</span>
        <span className="text-zinc-800 font-semibold">লেখক অঙ্গন</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-['Noto_Sans_Bengali']">
          জনপ্রিয় লেখক ও তাঁদের কালজয়ী বই
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          বাংলা সাহিত্যের প্রথিতযশা লেখকদের অনন্য রচনাবলি
        </p>
      </div>

      {/* Authors list carousel / pill tabs */}
      <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-3 mb-6">
        {authors.map((author) => {
          const isSelected = selectedAuthor === author.name;
          return (
            <button
              key={author.name}
              type="button"
              onClick={() => setSelectedAuthor(author.name)}
              className={`shrink-0 px-4 py-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2 text-xs sm:text-sm ${
                isSelected
                  ? 'border-amber-500 bg-amber-50 font-bold text-amber-950 shadow-xs ring-1 ring-amber-400'
                  : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
              }`}
            >
              <Feather className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-600' : 'text-zinc-400'}`} />
              <span>{author.name}</span>
            </button>
          );
        })}
      </div>

      {/* Author Profile Card */}
      <div className="p-6 bg-gradient-to-r from-[#FAF8F4] to-amber-50/40 rounded-3xl border border-amber-200/80 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-2xs">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-zinc-200 shrink-0 border border-amber-300 shadow-md">
          <img
            src={currentBio.image}
            alt={currentBio.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 font-['Noto_Sans_Bengali']">
              {currentBio.name}
            </h2>
            <span className="text-xs text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full font-semibold">
              {currentBio.era}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 font-medium mt-1">
            {currentBio.role}
          </p>
          <p className="text-xs sm:text-sm text-zinc-700 mt-2 max-w-2xl leading-relaxed">
            {currentBio.bio}
          </p>
        </div>
      </div>

      {/* Author Books Grid */}
      <div>
        <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-600" />
          <span>{currentBio.name}-এর বইসমূহ ({toBengaliNumber(authorBooks.length)} টি)</span>
        </h3>

        {authorBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {authorBooks.map((book) => (
              <ProductCard
                key={book.id}
                book={book}
                onOpenDetails={onOpenDetails}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-zinc-200 text-xs text-zinc-500">
            এই লেখকের আরও বই দ্রুতই শেষের পাতায় যুক্ত করা হচ্ছে।
          </div>
        )}
      </div>
    </div>
  );
};
