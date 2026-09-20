'use client';

import React, { useState, useMemo } from 'react';
import { useToast } from '../src/context/ToastContext';
import { useCart } from '../src/context/CartContext';
import { useWishlist } from '../src/context/WishlistContext';
import { useData } from '../src/context/DataContext';
import { useLanguage } from '../src/context/LanguageContext';
import { Book } from '../src/types';
import { trackSearch } from '../src/utils/metaPixel';

// Bangla UI Components
import { Header } from '../src/components/Header';
import { BanglaHome } from '../src/components/bangla/BanglaHome';
import { CatalogView } from '../src/components/CatalogView';
import { AuthorsView } from '../src/components/AuthorsView';
import { Footer } from '../src/components/Footer';
import { MobileBottomNav } from '../src/components/MobileBottomNav';

// English UI Components (BookOwls Inspired)
import { EnglishHeader } from '../src/components/english/EnglishHeader';
import { EnglishHome } from '../src/components/english/EnglishHome';
import { EnglishCatalogView } from '../src/components/english/EnglishCatalogView';
import { EnglishFooter } from '../src/components/english/EnglishFooter';

// Shared Drawers and Modals
import { ProductDetailsModal } from '../src/components/ProductDetailsModal';
import { QuickViewModal } from '../src/components/QuickViewModal';
import { CartDrawer } from '../src/components/CartDrawer';
import { WishlistDrawer } from '../src/components/WishlistDrawer';
import { CheckoutModal } from '../src/components/CheckoutModal';
import { TrackOrderModal } from '../src/components/TrackOrderModal';
import { AccountModal } from '../src/components/AccountModal';

export default function HomePage() {
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const { setIsWishlistOpen } = useWishlist();
  const { books } = useData();
  const { language } = useLanguage();

  // Navigation state
  const [currentNav, setCurrentNav] = useState<string>('home');
  const [catalogCategory, setCatalogCategory] = useState<string>('all');
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  // Modals & Drawers
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<Book | null>(null);
  const [selectedBookForQuickView, setSelectedBookForQuickView] = useState<Book | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);

  // Handlers
  const handleSelectCategory = (categoryId: string) => {
    setCatalogCategory(categoryId);
    setCatalogSearch('');
    setCurrentNav('books');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      trackSearch(query.trim());
    }
    setCatalogSearch(query);
    setCatalogCategory('all');
    setCurrentNav('books');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllSection = (categoryId: string) => {
    setCatalogCategory(categoryId);
    setCatalogSearch('');
    setCurrentNav('books');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuyNow = (book?: Book, quantity = 1) => {
    if (book) {
      addToCart(book, quantity);
    }
    setIsCheckoutOpen(true);
  };

  // Navigation router handling
  const handleNavClick = (navId: string) => {
    if (
      navId === 'novel' ||
      navId === 'thriller' ||
      navId === 'islamic' ||
      navId === 'children' ||
      navId === 'poetry' ||
      navId === 'english' ||
      navId === 'stationery'
    ) {
      const categoryMap: Record<string, string> = {
        novel: 'উপন্যাস',
        thriller: 'গোয়েন্দা ও থ্রিলার',
        islamic: 'ইসলামিক সাহিত্য',
        children: 'কিশোর সাহিত্য',
        poetry: 'কবিতা',
        english: 'বিদেশি বই',
        stationery: 'all',
      };
      setCatalogCategory(categoryMap[navId] || 'all');
      setCatalogSearch('');
      setCurrentNav('books');
    } else if (navId === 'home') {
      setCatalogCategory('all');
      setCatalogSearch('');
      setCurrentNav('home');
    } else {
      setCurrentNav(navId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen flex flex-col ${language === 'en' ? 'bg-[#12110e] text-zinc-100' : 'bg-[#FEFDF9] text-zinc-900'} selection:bg-amber-400 selection:text-zinc-950`}>
      {/* Dynamic Header based on active language */}
      {language === 'bn' ? (
        <Header
          currentNav={currentNav}
          onNavigate={handleNavClick}
          onSearchSubmit={handleSearchSubmit}
          onSelectBook={(book) => setSelectedBookForDetails(book)}
          onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
        />
      ) : (
        <EnglishHeader
          currentNav={currentNav}
          onNavigate={handleNavClick}
          onSearchSubmit={handleSearchSubmit}
          onSelectBook={(book) => setSelectedBookForDetails(book)}
          onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <main className={`flex-1 ${language === 'bn' ? 'pb-16 lg:pb-0 font-[\'Noto_Sans_Bengali\']' : 'pb-12'}`}>
        {/* Home View */}
        {currentNav === 'home' && (
          language === 'bn' ? (
            <BanglaHome
              books={books}
              catalogCategory={catalogCategory}
              onSelectCategory={handleSelectCategory}
              onViewAllSection={handleViewAllSection}
              onOpenDetails={(book) => setSelectedBookForDetails(book)}
              onQuickView={(book) => setSelectedBookForQuickView(book)}
              onBuyNow={handleBuyNow}
              onExploreClick={() => {
                setCurrentNav('books');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : (
            <EnglishHome
              books={books}
              catalogCategory={catalogCategory}
              onSelectCategory={handleSelectCategory}
              onViewAllSection={handleViewAllSection}
              onOpenDetails={(book) => setSelectedBookForDetails(book)}
              onQuickView={(book) => setSelectedBookForQuickView(book)}
              onBuyNow={handleBuyNow}
              onExploreClick={() => {
                setCurrentNav('books');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )
        )}

        {/* Books & Catalog View */}
        {(currentNav === 'books' || currentNav === 'publishers' || currentNav === 'packages' || currentNav === 'stationery') && (
          language === 'bn' ? (
            <CatalogView
              books={books}
              initialCategory={catalogCategory}
              initialSearch={catalogSearch}
              onOpenDetails={(book) => setSelectedBookForDetails(book)}
              onQuickView={(book) => setSelectedBookForQuickView(book)}
              onResetToHome={() => {
                setCurrentNav('home');
                setCatalogCategory('all');
                setCatalogSearch('');
              }}
            />
          ) : (
            <EnglishCatalogView
              books={books}
              initialCategory={catalogCategory}
              initialSearch={catalogSearch}
              onOpenDetails={(book) => setSelectedBookForDetails(book)}
              onQuickView={(book) => setSelectedBookForQuickView(book)}
              onResetToHome={() => {
                setCurrentNav('home');
                setCatalogCategory('all');
                setCatalogSearch('');
              }}
            />
          )
        )}

        {/* Authors View */}
        {currentNav === 'authors' && (
          <AuthorsView
            books={books}
            onOpenDetails={(book) => setSelectedBookForDetails(book)}
            onQuickView={(book) => setSelectedBookForQuickView(book)}
            onResetToHome={() => setCurrentNav('home')}
          />
        )}

        {/* About / Contact / Offers static views */}
        {(currentNav === 'about' || currentNav === 'contact' || currentNav === 'offers') && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
            <div className={`p-8 rounded-3xl border shadow-xs space-y-4 ${language === 'en' ? 'bg-[#1a1712] border-[#2e271c] text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'}`}>
              <h1 className="text-2xl sm:text-3xl font-black">
                {language === 'bn'
                  ? currentNav === 'about'
                    ? 'আমাদের সম্পর্কে — শেষের পাতা'
                    : currentNav === 'contact'
                    ? 'যোগাযোগ ও সহায়তা — শেষের পাতা'
                    : 'চলমান অফার — শেষের পাতা'
                  : currentNav === 'about'
                  ? 'About Us — Shesher Pata'
                  : currentNav === 'contact'
                  ? 'Contact & Help — Shesher Pata'
                  : 'Active Offers & Discounts — Shesher Pata'}
              </h1>
              <div className="w-12 h-1 bg-[#F59E0B] rounded-full" />

              {currentNav === 'offers' ? (
                <div className="space-y-4">
                  <div className={`p-5 rounded-2xl border space-y-2 ${language === 'en' ? 'bg-[#252016] border-[#443820] text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                    <h3 className="font-bold text-lg text-amber-400">
                      {language === 'bn' ? '🎉 বইমেলা বিশেষ কুপন: SHESHER10' : '🎉 Spring Book Fair Code: SHESHER10'}
                    </h3>
                    <p className="text-sm">
                      {language === 'bn'
                        ? 'যেকোনো ৩টি বইয়ের সাথে পান ফ্রি হোম ডেলিভারি এবং ফ্ল্যাট ১০% ডিসকাউন্ট!'
                        : 'Enjoy free nationwide home delivery and a flat 10% discount on 3 or more books!'}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm sm:text-base leading-relaxed opacity-90">
                    {language === 'bn'
                      ? '"শেষের পাতা" কেবল একটি অনলাইন বইয়ের দোকান নয়, এটি প্রতিটি বইপ্রেমীর মনের একটি শান্তির আঙিনা। আমরা বিশ্বাস করি একটি ভালো বই একজন মানুষের জীবন বদলে দিতে পারে।'
                      : 'Shesher Pata is more than just an online bookstore; it is a peaceful haven for every book lover. We believe that the right book at the right time can change a person’s world.'}
                  </p>
                  <div className={`p-4 border rounded-2xl text-xs space-y-1 ${language === 'en' ? 'bg-[#221e17] border-[#382f1f] text-zinc-300' : 'bg-[#FAF8F4] border-amber-200 text-zinc-700'}`}>
                    <p><strong>{language === 'bn' ? 'ঠিকানা:' : 'Address:'}</strong> Katabon Book Market, New Elephant Road, Dhaka-1205</p>
                    <p><strong>{language === 'bn' ? 'হেল্পলাইন:' : 'Hotline:'}</strong> +880 1700-000000 (9 AM - 10 PM)</p>
                    <p><strong>{language === 'bn' ? 'ইমেইল:' : 'Email:'}</strong> support@shesherpata.com</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Dynamic Footer based on active language */}
      {language === 'bn' ? (
        <>
          <Footer
            onNavigate={(navId) => {
              setCurrentNav(navId);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
          />
          <MobileBottomNav
            currentNav={currentNav}
            onNavigate={(navId) => {
              if (navId === 'categories') {
                setCurrentNav('books');
                setCatalogCategory('all');
              } else {
                setCurrentNav(navId);
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAccount={() => setIsAccountOpen(true)}
          />
        </>
      ) : (
        <EnglishFooter
          onNavigate={(navId) => {
            setCurrentNav(navId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        />
      )}

      {/* Drawers and Modals (shared inventory and state across both languages) */}
      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onExploreBooks={() => {
          setCurrentNav('books');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <WishlistDrawer
        onExploreBooks={() => {
          setCurrentNav('books');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenDetails={(book) => setSelectedBookForDetails(book)}
      />

      {selectedBookForDetails && (
        <ProductDetailsModal
          book={selectedBookForDetails}
          allBooks={books}
          onClose={() => setSelectedBookForDetails(null)}
          onSelectBook={(b) => setSelectedBookForDetails(b)}
          onBuyNow={(b, qty) => handleBuyNow(b, qty)}
        />
      )}

      {selectedBookForQuickView && (
        <QuickViewModal
          book={selectedBookForQuickView}
          onClose={() => setSelectedBookForQuickView(null)}
          onOpenFullDetails={(b) => {
            setSelectedBookForQuickView(null);
            setSelectedBookForDetails(b);
          }}
        />
      )}

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={() => {
          setIsCheckoutOpen(false);
          showToast(
            language === 'bn'
              ? 'ধন্যবাদ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।'
              : 'Thank you! Your order has been placed successfully.',
            'success'
          );
        }}
      />

      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onOpenOrders={() => {
          setIsAccountOpen(false);
          setIsTrackOrderOpen(true);
        }}
        onOpenWishlist={() => {
          setIsAccountOpen(false);
          setIsWishlistOpen(true);
        }}
      />
    </div>
  );
}
