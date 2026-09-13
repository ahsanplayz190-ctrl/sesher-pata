'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book } from '../types';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlist: Book[];
  toggleWishlist: (book: Book) => void;
  isInWishlist: (bookId: string) => boolean;
  removeFromWishlist: (bookId: string) => void;
  clearWishlist: () => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'shesher_pata_wishlist_items';

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [wishlist, setWishlist] = useState<Book[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);

  // Read initial wishlist on client mount to prevent SSR hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save changes to localStorage after mounting
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist, isMounted]);

  const isInWishlist = (bookId: string) => {
    return wishlist.some((book) => book.id === bookId);
  };

  const toggleWishlist = (book: Book) => {
    if (isInWishlist(book.id)) {
      setWishlist((prev) => prev.filter((b) => b.id !== book.id));
      showToast(`"${book.title}" উইশলিস্ট থেকে সরানো হয়েছে`, 'info');
    } else {
      setWishlist((prev) => [...prev, book]);
      showToast(`"${book.title}" আপনার উইশলিস্টে যুক্ত করা হয়েছে ❤️`, 'wishlist');
    }
  };

  const removeFromWishlist = (bookId: string) => {
    const book = wishlist.find((b) => b.id === bookId);
    setWishlist((prev) => prev.filter((b) => b.id !== bookId));
    if (book) {
      showToast(`"${book.title}" উইশলিস্ট থেকে সরানো হয়েছে`, 'info');
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
