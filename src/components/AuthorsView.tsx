'use client';

import React, { useState } from 'react';
import { Book, Category } from '../types';
import { ProductCard } from './ProductCard';
import { BookOpen, Feather } from 'lucide-react';
import { toBengaliNumber } from '../utils/formatters';

interface AuthorsViewProps {
  books: Book[];
  onOpenDetails: (book: Book) => void;
  onQuickView: (book: Book) => void;
  onResetToHome: () => void;
}

interface AuthorBio {
  name: string;
  era: string;
  role: string;
  bio: string;
  image: string;
}

const AUTHORS_LIST: AuthorBio[] = [
  {
    name: 'হুমায়ূন আহমেদ',
    era: '১৯৪৮ – ২০১২',
    role: 'কথাসাহিত্যিক, নাট্যকার ও চলচ্চিত্র নির্মাতা',
    bio: 'আধুনিক বাংলা সাহিত্যের সবচেয়ে জনপ্রিয় কথাসাহিত্যিক। মিসির আলি ও হিমু চরিত্রের স্রষ্টা।',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'রবীন্দ্রনাথ ঠাকুর',
    era: '১৮৬১ – ১৯৪১',
    role: 'বিশ্বকবি, নোবেল বিজয়ী সাহিত্যিক',
    bio: 'বাংলা ভাষা ও সাহিত্যের রূপকার। গীতাঞ্জলি কাব্যের জন্য ১৯১৩ সালে নোবেল পুরস্কার লাভ করেন।',
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'কাজী নজরুল ইসলাম',
    era: '১৮৯৯ – ১৯৭৬',
    role: 'জাতীয় কবি, বিদ্রোহী কবি ও সুরস্রষ্টা',
    bio: 'বাংলা সাহিত্যের অন্যতম শ্রেষ্ঠ কবি, দ্রোহ ও ভালোবাসার অবিসংবাদিত কণ্ঠস্বর।',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'সত্যজিৎ রায়',
    era: '১৯২১ – ১৯৯২',
    role: 'চলচ্চিত্রকার, লেখক ও চিত্রশিল্পী',
    bio: 'অস্কারজয়ী চলচ্চিত্রকার এবং বাংলা সাহিত্যের জনপ্রিয় গোয়েন্দা ফেলুদা ও প্রফেসর শঙ্কুর স্রষ্টা।',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'সুনীল গঙ্গোপাধ্যায়',
    era: '১৯৩৪ – ২০১২',
    role: 'কবি, ঔপন্যাসিক ও ছোটগল্পকার',
    bio: 'নীললোহিত ছদ্মনামে খ্যাত। সেই সময়, প্রথম আলো এবং কাকাবাবু সিরিজের অমর স্রষ্টা।',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'শরৎচন্দ্র চট্টোপাধ্যায়',
    era: '১৮৭৬ – ১৯৩৮',
    role: 'অপরাজেয় কথাশিল্পী',
    bio: 'বাঙালি সমাজজীবনের নিখুঁত রূপকার। দেবদাস, চরিত্রহীন, শ্রীকান্ত উপন্যাসের লেখক।',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
];

export const AuthorsView: React.FC<AuthorsViewProps> = ({
  books,
  onOpenDetails,
  onQuickView,
  onResetToHome,
}) => {
  const [selectedAuthor, setSelectedAuthor] = useState<string>(AUTHORS_LIST[0].name);

  const authorBooks = books.filter((b) => b.author.includes(selectedAuthor));
  const currentBio = AUTHORS_LIST.find((a) => a.name === selectedAuthor) || AUTHORS_LIST[0];

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
        {AUTHORS_LIST.map((author) => {
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
