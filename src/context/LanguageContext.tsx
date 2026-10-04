'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { Book, Banner, Category } from '../types';
import { toBengaliNumber } from '../utils/formatters';

export type Language = 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: string) => void;
  toggleLanguage: () => void;
  getBookDisplayName: (book?: Partial<Book> | null) => string;
  getBannerImage: (banner?: Partial<Banner> | null) => string;
  getCategoryDisplayName: (category?: Partial<Category> | null) => string;
  formatPrice: (price: number) => string;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    try {
      localStorage.removeItem('shesher_pata_language');
    } catch (e) {
      // ignore
    }
  }, []);

  const language: Language = 'bn';
  const setLanguage = () => {};
  const toggleLanguage = () => {};

  const getBookDisplayName = (book?: Partial<Book> | null): string => {
    if (!book) return '';
    return book.bangla_name || book.title || book.english_name || '';
  };

  const getBannerImage = (banner?: Partial<Banner> | null): string => {
    if (!banner) return '';
    return banner.bangla_image || (banner as any).image || banner.english_image || '';
  };

  const getCategoryDisplayName = (category?: Partial<Category> | null): string => {
    if (!category) return '';
    return category.bangla_name || category.name || category.englishName || '';
  };

  const formatPrice = (price: number): string => {
    return `৳${toBengaliNumber(price)}`;
  };

  const t = (key: string): string => {
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
