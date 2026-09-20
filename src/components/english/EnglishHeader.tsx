'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Phone,
  Truck,
  Compass,
  BookOpen,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSwitcher } from '../shared/LanguageSwitcher';
import { Book } from '../../types';

interface EnglishHeaderProps {
  currentNav: string;
  onNavigate: (navId: string) => void;
  onSelectBook: (book: Book) => void;
  onSearchSubmit: (query: string) => void;
  onOpenAccount: () => void;
  onOpenTrackOrder?: () => void;
}

export const EnglishHeader: React.FC<EnglishHeaderProps> = ({
  currentNav,
  onNavigate,
  onSelectBook,
  onSearchSubmit,
  onOpenAccount,
  onOpenTrackOrder,
}) => {
  const { totalItemsCount, subtotal, setIsCartOpen } = useCart();
  const { wishlist, setIsWishlistOpen } = useWishlist();
  const { books, categories } = useData();
  const { getBookDisplayName, formatPrice } = useLanguage();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter books for live search preview
  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return books
      .filter((b) => {
        const titleEn = (b.english_name || '').toLowerCase();
        const titleBn = (b.bangla_name || b.title || '').toLowerCase();
        const author = (b.author || '').toLowerCase();
        const cat = (b.category || '').toLowerCase();
        const isbn = (b.isbn || '').toLowerCase();
        return (
          titleEn.includes(q) ||
          titleBn.includes(q) ||
          author.includes(q) ||
          cat.includes(q) ||
          isbn.includes(q)
        );
      })
      .slice(0, 6);
  }, [searchQuery, books]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        onSearchSubmit(searchQuery.trim());
        setIsSearchOpen(false);
      }
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'books', label: 'All Books' },
    { id: 'novel', label: 'Fiction & Literature' },
    { id: 'thriller', label: 'Mystery & Thriller' },
    { id: 'children', label: 'Young Adult' },
    { id: 'authors', label: 'Authors' },
    { id: 'offers', label: 'Bestsellers & Deals' },
    { id: 'stationery', label: 'Stationery & Merch' },
  ];

  return (
    <>
      {/* Top Notification Bar */}
      <div className="bg-[#12110e] text-zinc-300 text-xs py-1.5 px-4 border-b border-[#28241b]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] sm:text-xs">
            <span className="bg-[#E5A913] text-zinc-950 font-black px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
              Free Shipping
            </span>
            <span className="text-zinc-300">
              Nationwide free home delivery on orders of 3+ books with code{' '}
              <strong className="text-[#E5A913] font-bold">SHESHER10</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-zinc-400 text-[11px] shrink-0">
            <button
              type="button"
              onClick={onOpenTrackOrder}
              className="hidden sm:flex items-center gap-1 hover:text-[#E5A913] transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#E5A913]" />
              <span>Track Order</span>
            </button>
            <div className="hidden md:flex items-center gap-1 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5 text-[#E5A913]" />
              <span>01700-000000</span>
            </div>
            {/* Language Selector Toggle placed exactly as in Bangla mode */}
            <LanguageSwitcher size="sm" />
          </div>
        </div>
      </div>

      {/* Main Sticky Dark Header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 border-b border-[#28241b] bg-[#181612]/95 backdrop-blur-md text-white ${
          isScrolled ? 'py-2.5 shadow-xl' : 'py-3.5 sm:py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-800/60"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo (BookOwls / Shesher Pata aesthetic) */}
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 cursor-pointer select-none shrink-0 group"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#E5A913] via-[#ffc633] to-[#e5a913] p-0.5 shadow-md shadow-amber-950/30 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-200">
                <img
                  src="/images/logo.jpg"
                  alt="Shesher Pata Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5 group-hover:text-[#E5A913] transition-colors">
                  SHESHER PATA
                  <span className="text-[#E5A913] text-xs font-sans font-bold px-1.5 py-0.2 rounded bg-[#2a2417] border border-[#443a23]">
                    BOOKS
                  </span>
                </span>
                <span className="text-[10px] text-zinc-400 tracking-wider uppercase font-medium">
                  Curated Bookstore & Stationery
                </span>
              </div>
            </div>

            {/* Central Search Bar */}
            <div
              ref={searchContainerRef}
              className="hidden md:block flex-1 max-w-xl relative"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search by title, author, genre, or ISBN..."
                  className="w-full pl-10 pr-10 py-2 sm:py-2.5 rounded-full bg-[#242017] border border-[#3b3425] text-zinc-100 placeholder-zinc-500 text-sm focus:outline-hidden focus:border-[#E5A913] focus:ring-1 focus:ring-[#E5A913] transition-all"
                />
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 p-0.5 text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Live Preview Dropdown */}
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#201c15] border border-[#3c3425] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="p-2 border-b border-[#2e281c] flex items-center justify-between text-xs text-zinc-400 px-3">
                    <span>Search Results ({searchResults.length})</span>
                    <button
                      type="button"
                      onClick={() => {
                        onSearchSubmit(searchQuery);
                        setIsSearchOpen(false);
                      }}
                      className="text-[#E5A913] hover:underline font-bold"
                    >
                      View All
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-[#2a2419]">
                    {searchResults.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => {
                          onSelectBook(b);
                          setIsSearchOpen(false);
                        }}
                        className="p-3 flex items-center gap-3 hover:bg-[#2c261c] cursor-pointer transition-colors"
                      >
                        <img
                          src={b.cover_image || b.image}
                          alt={b.english_name || b.title}
                          className="w-10 h-14 object-cover rounded shadow-xs shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">
                            {getBookDisplayName(b)}
                          </h4>
                          <p className="text-xs text-zinc-400 truncate">
                            {b.author}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-[#E5A913]">
                              {formatPrice(b.price)}
                            </span>
                            {b.originalPrice > b.price && (
                              <span className="text-[11px] text-zinc-500 line-through">
                                {formatPrice(b.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Action Icons: User Account, Wishlist, Cart */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              {/* User Account */}
              <button
                type="button"
                onClick={onOpenAccount}
                className="p-2 text-zinc-300 hover:text-[#E5A913] hover:bg-[#252017] rounded-full transition-colors cursor-pointer"
                title="Account"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <button
                type="button"
                onClick={() => setIsWishlistOpen(true)}
                className="relative p-2 text-zinc-300 hover:text-[#E5A913] hover:bg-[#252017] rounded-full transition-colors cursor-pointer"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-0 right-0 bg-[#E5A913] text-zinc-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart Button */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#E5A913] hover:bg-[#d99a07] text-zinc-950 font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                  {totalItemsCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-zinc-950 text-white font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {totalItemsCount}
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm font-black hidden sm:inline">
                  {formatPrice(subtotal)}
                </span>
              </button>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center justify-between gap-1 pt-3 mt-3 border-t border-[#292419] text-xs font-semibold tracking-wide">
            <div className="flex items-center gap-6">
              {navLinks.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`py-1 transition-colors cursor-pointer ${
                    currentNav === item.id
                      ? 'text-[#E5A913] font-bold border-b-2 border-[#E5A913]'
                      : 'text-zinc-300 hover:text-[#E5A913]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#E5A913] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Genuine Print Guaranteed</span>
            </div>
          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#1a1712] border-t border-[#2f281a] px-4 py-4 space-y-4 animate-in slide-in-from-top-2">
            {/* Mobile Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search books, authors, genres..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#231f17] border border-[#3b3424] text-white text-xs placeholder-zinc-500 focus:outline-hidden focus:border-[#E5A913]"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            </div>

            {/* Language Switcher in Mobile Menu */}
            <div className="flex items-center justify-between py-2 border-b border-[#2a2419]">
              <span className="text-xs text-zinc-400">Language / ভাষা:</span>
              <LanguageSwitcher size="sm" />
            </div>

            {/* Mobile Navigation List */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {navLinks.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    currentNav === item.id
                      ? 'bg-[#E5A913] text-zinc-950 font-bold'
                      : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
