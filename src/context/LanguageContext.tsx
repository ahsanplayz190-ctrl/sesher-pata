'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, Banner, Category } from '../types';
import { toBengaliNumber } from '../utils/formatters';

export type Language = 'bn' | 'en';

interface Translations {
  [key: string]: {
    bn: string;
    en: string;
  };
}

const UI_TRANSLATIONS: Translations = {
  home: { bn: 'হোম', en: 'Home' },
  books: { bn: 'বইসমূহ', en: 'Books' },
  categories: { bn: 'ক্যাটাগরি', en: 'Categories' },
  authors: { bn: 'লেখকবৃন্দ', en: 'Authors' },
  publishers: { bn: 'প্রকাশনী', en: 'Publishers' },
  offers: { bn: 'অফার ও ডিসকাউন্ট', en: 'Offers & Discounts' },
  bestsellers: { bn: 'বেস্টসেলার', en: 'Bestsellers' },
  new_arrivals: { bn: 'নতুন প্রকাশনা', en: 'New Arrivals' },
  cart: { bn: 'কার্ট', en: 'Cart' },
  wishlist: { bn: 'উইশলিস্ট', en: 'Wishlist' },
  account: { bn: 'অ্যাকাউন্ট', en: 'Account' },
  track_order: { bn: 'অর্ডার ট্র্যাকিং', en: 'Track Order' },
  about: { bn: 'আমাদের সম্পর্কে', en: 'About Us' },
  contact: { bn: 'যোগাযোগ', en: 'Contact' },
  search_placeholder: {
    bn: 'বইয়ের নাম, লেখক অথবা বিষয় দিয়ে খুঁজুন...',
    en: 'Search by title, author, category, or ISBN...',
  },
  add_to_cart: { bn: 'কার্টে যোগ করুন', en: 'Add to Cart' },
  buy_now: { bn: 'এখনই কিনুন', en: 'Buy Now' },
  quick_view: { bn: 'এক নজরে দেখুন', en: 'Quick View' },
  view_details: { bn: 'বিস্তারিত দেখুন', en: 'View Details' },
  in_stock: { bn: 'স্টকে আছে', en: 'In Stock' },
  out_of_stock: { bn: 'স্টক শেষ', en: 'Out of Stock' },
  view_all: { bn: 'সবগুলো দেখুন ➔', en: 'View All ➔' },
  free_delivery: { bn: 'সারা দেশে ফ্রি হোম ডেলিভারি', en: 'Free Delivery Nationwide' },
  reviews: { bn: 'রিভিউ', en: 'Reviews' },
  publisher_label: { bn: 'প্রকাশনী', en: 'Publisher' },
  author_label: { bn: 'লেখক', en: 'Author' },
  isbn_label: { bn: 'আইএসবিএন', en: 'ISBN' },
  pages_label: { bn: 'পৃষ্ঠা সংখ্যা', en: 'Pages' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  getBookDisplayName: (book?: Partial<Book> | null) => string;
  getBannerImage: (banner?: Partial<Banner> | null) => string;
  getCategoryDisplayName: (category?: Partial<Category> | null) => string;
  formatPrice: (price: number) => string;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'shesher_pata_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('bn');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
      if (stored === 'bn' || stored === 'en') {
        setLanguageState(stored);
      }
    } catch (e) {
      console.warn('Could not read language from localStorage', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  const getBookDisplayName = (book?: Partial<Book> | null): string => {
    if (!book) return '';
    if (language === 'bn') {
      return book.bangla_name || book.title || book.english_name || '';
    }
    return book.english_name || book.title || book.bangla_name || '';
  };

  const getBannerImage = (banner?: Partial<Banner> | null): string => {
    if (!banner) return '';
    if (language === 'bn') {
      return banner.bangla_image || (banner as any).image || banner.english_image || '';
    }
    return banner.english_image || (banner as any).image || banner.bangla_image || '';
  };

  const getCategoryDisplayName = (category?: Partial<Category> | null): string => {
    if (!category) return '';
    if (language === 'bn') {
      return category.bangla_name || category.name || category.englishName || '';
    }
    return category.english_name || category.englishName || category.name || '';
  };

  const formatPrice = (price: number): string => {
    if (language === 'en') {
      return `৳${price.toLocaleString('en-US')}`;
    }
    return `৳${toBengaliNumber(price)}`;
  };

  const t = (key: string): string => {
    if (UI_TRANSLATIONS[key]) {
      return UI_TRANSLATIONS[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        getBookDisplayName,
        getBannerImage,
        getCategoryDisplayName,
        formatPrice,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
