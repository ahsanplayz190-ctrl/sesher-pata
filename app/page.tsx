'use client';

import React, { useState, useMemo } from 'react';
import { useToast } from '../src/context/ToastContext';
import { useCart } from '../src/context/CartContext';
import { Header } from '../src/components/Header';
import { HeroBanner } from '../src/components/HeroBanner';
import { CategoryCarousel } from '../src/components/CategoryCarousel';
import { SectionHeader } from '../src/components/SectionHeader';
import { ProductCarousel } from '../src/components/ProductCarousel';
import { ProductDetailsModal } from '../src/components/ProductDetailsModal';
import { QuickViewModal } from '../src/components/QuickViewModal';
import { CartDrawer } from '../src/components/CartDrawer';
import { WishlistDrawer } from '../src/components/WishlistDrawer';
import { CheckoutModal } from '../src/components/CheckoutModal';
import { TrackOrderModal } from '../src/components/TrackOrderModal';
import { AccountModal } from '../src/components/AccountModal';
import { CatalogView } from '../src/components/CatalogView';
import { AuthorsView } from '../src/components/AuthorsView';
import { Footer } from '../src/components/Footer';
import { MobileBottomNav } from '../src/components/MobileBottomNav';
import { BOOKS } from '../src/data/books';
import { Book } from '../src/types';
import { BookMarked, ArrowRight, Gift, Flame } from 'lucide-react';

export default function HomePage() {
  const { showToast } = useToast();
  const { addToCart } = useCart();

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

  // Filtered Book Sections for Homepage Carousels
  const internationalBooks = useMemo(
    () => BOOKS.filter((b) => b.isInternational || b.sectionIds?.includes('international') || b.category === 'বিদেশি বই' || b.tags?.includes('অনুবাদ')),
    []
  );

  const bestsellerBooks = useMemo(
    () => BOOKS.filter((b) => b.isBestseller || b.sectionIds?.includes('bestseller')),
    []
  );

  const newReleaseBooks = useMemo(
    () => BOOKS.filter((b) => b.isNew || b.isNewRelease || b.sectionIds?.includes('new_releases') || b.rating >= 4.8),
    []
  );

  const discountedBooks = useMemo(
    () => BOOKS.filter((b) => b.discount >= 20),
    []
  );

  const classicAndNovelBooks = useMemo(
    () => BOOKS.filter((b) => b.category === 'উপন্যাস' || b.category === 'কবিতা'),
    []
  );

  const juvenileAndMysteryBooks = useMemo(
    () => BOOKS.filter((b) => b.category === 'কিশোর সাহিত্য' || b.category === 'গোয়েন্দা ও থ্রিলার' || b.tags?.includes('ফেলুদা')),
    []
  );

  // Handlers
  const handleSelectCategory = (categoryId: string) => {
    setCatalogCategory(categoryId);
    setCatalogSearch('');
    setCurrentNav('books');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (query: string) => {
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

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-zinc-900 flex flex-col selection:bg-amber-400 selection:text-zinc-950">
      {/* Header */}
      <Header
        currentNav={currentNav}
        onNavigate={(navId) => {
          setCurrentNav(navId);
          if (navId === 'home') {
            setCatalogCategory('all');
            setCatalogSearch('');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSearchSubmit={handleSearchSubmit}
        onSelectBook={(book) => setSelectedBookForDetails(book)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 lg:pb-0">
        {currentNav === 'home' && (
          <div className="space-y-6 sm:space-y-10">
            {/* Hero Section with interactive slider */}
            <HeroBanner
              onExploreClick={() => {
                setCurrentNav('books');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBuyNowClick={() => handleBuyNow(bestsellerBooks[0])}
            />

            {/* Category Carousel */}
            <CategoryCarousel
              onSelectCategory={handleSelectCategory}
              activeCategoryId={catalogCategory}
            />

            {/* Carousel 1: আন্তর্জাতিক অঙ্গন (World Literature & Translations) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <SectionHeader
                title="আন্তর্জাতিক অঙ্গন"
                subtitle="বিশ্বসাহিত্যের বিখ্যাত ক্লাসিক ও আধুনিক সেরা বইয়ের বাংলা রূপান্তর"
                onViewAll={() => handleViewAllSection('foreign')}
              />
              <ProductCarousel
                books={internationalBooks}
                onOpenDetails={(book) => setSelectedBookForDetails(book)}
                onQuickView={(book) => setSelectedBookForQuickView(book)}
              />
            </section>

            {/* Carousel 2: বেস্টসেলার বই (Bestsellers) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wide">
                  সর্বাধিক পঠিত
                </span>
              </div>
              <SectionHeader
                title="বেস্টসেলার বই"
                subtitle="পাঠকদের সর্বাধিক ভালোবাসাপ্রাপ্ত সেরা সাহিত্য ও উপন্যাস"
                onViewAll={() => handleViewAllSection('all')}
              />
              <ProductCarousel
                books={bestsellerBooks}
                onOpenDetails={(book) => setSelectedBookForDetails(book)}
                onQuickView={(book) => setSelectedBookForQuickView(book)}
              />
            </section>

            {/* Promotional Literary Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#292524] via-[#1C1917] to-[#18181B] text-white p-6 sm:p-8 md:p-10 shadow-lg border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-left max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                    <Gift className="w-3.5 h-3.5" />
                    <span>বিশেষ বইপ্রেমী অফার</span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                    যেকোনো ৩টি বই অর্ডারে ফ্রি হোম ডেলিভারি!
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300">
                    চেকআউটের সময় কুপন কোড ব্যবহার করুন: <span className="font-mono font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">SHESHER10</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentNav('books');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="shrink-0 px-6 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-zinc-950 font-bold rounded-xl text-sm sm:text-base transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
                >
                  <span>অফারটি নিন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </section>

            {/* Carousel 3: সাম্প্রতিক প্রকাশনা (New Releases) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center gap-2 mb-1">
                <BookMarked className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                  টাটকা প্রকাশনা
                </span>
              </div>
              <SectionHeader
                title="সাম্প্রতিক প্রকাশনা"
                subtitle="এ বছরের আলোচিত ও প্রশংসিত নতুন সংস্করণ"
                onViewAll={() => handleViewAllSection('all')}
              />
              <ProductCarousel
                books={newReleaseBooks}
                onOpenDetails={(book) => setSelectedBookForDetails(book)}
                onQuickView={(book) => setSelectedBookForQuickView(book)}
              />
            </section>

            {/* Carousel 4: বিশেষ ছাড়ের বই (Discounted Books) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <SectionHeader
                title="বিশেষ ছাড়ের বই"
                subtitle="২০% থেকে ৩৫% পর্যন্ত বিশেষ ছাড়ে আপনার পছন্দের বই কিনুন"
                onViewAll={() => handleViewAllSection('all')}
              />
              <ProductCarousel
                books={discountedBooks}
                onOpenDetails={(book) => setSelectedBookForDetails(book)}
                onQuickView={(book) => setSelectedBookForQuickView(book)}
              />
            </section>

            {/* Carousel 5: কিশোর সাহিত্য ও গোয়েন্দা (Detective & Juvenile) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <SectionHeader
                title="কিশোর সাহিত্য ও গোয়েন্দা"
                subtitle="ফেলুদা, ব্যোমকেশ, প্রফেসর শঙ্কু এবং রোমাঞ্চকর অ্যাডভেঞ্চার"
                onViewAll={() => handleViewAllSection('children')}
              />
              <ProductCarousel
                books={juvenileAndMysteryBooks}
                onOpenDetails={(book) => setSelectedBookForDetails(book)}
                onQuickView={(book) => setSelectedBookForQuickView(book)}
              />
            </section>

            {/* Carousel 6: কালজয়ী উপন্যাস ও কবিতা */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <SectionHeader
                title="কালজয়ী উপন্যাস ও সাহিত্য"
                subtitle="বাঙালি মননের অম্লান সৃষ্টি — রবীন্দ্রনাথ, নজরুল ও শরৎচন্দ্রের রচনা"
                onViewAll={() => handleViewAllSection('novel')}
              />
              <ProductCarousel
                books={classicAndNovelBooks}
                onOpenDetails={(book) => setSelectedBookForDetails(book)}
                onQuickView={(book) => setSelectedBookForQuickView(book)}
              />
            </section>

            {/* Literary Inspiration Card */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
              <div className="bg-amber-100/50 border border-amber-200/80 rounded-3xl p-8 text-center space-y-3">
                <span className="text-amber-800 text-xs font-bold uppercase tracking-widest block">
                  — পাঠক অনুপ্রেরণা —
                </span>
                <blockquote className="text-lg sm:text-2xl font-bold text-zinc-800 max-w-2xl mx-auto leading-snug">
                  "মানুষ বই পড়ে শখ করে নয়, মানুষ বই পড়ে বাঁচার প্রয়োজনে।"
                </blockquote>
                <p className="text-xs sm:text-sm text-amber-900 font-semibold">
                  — প্রমথ চৌধুরী
                </p>
              </div>
            </section>
          </div>
        )}

        {/* Books & Catalog View */}
        {currentNav === 'books' && (
          <CatalogView
            books={BOOKS}
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
        )}

        {/* Authors View */}
        {currentNav === 'authors' && (
          <AuthorsView
            books={BOOKS}
            onOpenDetails={(book) => setSelectedBookForDetails(book)}
            onQuickView={(book) => setSelectedBookForQuickView(book)}
            onResetToHome={() => setCurrentNav('home')}
          />
        )}

        {/* About / Contact / Offers static views */}
        {(currentNav === 'about' || currentNav === 'contact' || currentNav === 'offers') && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900">
                {currentNav === 'about'
                  ? 'আমাদের সম্পর্কে — শেষের পাতা'
                  : currentNav === 'contact'
                  ? 'যোগাযোগ ও সহায়তা — শেষের পাতা'
                  : 'চলমান অফার — শেষের পাতা'}
              </h1>
              <div className="w-12 h-1 bg-[#F59E0B] rounded-full" />
              
              {currentNav === 'offers' ? (
                <div className="space-y-4">
                  <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                    <h3 className="font-bold text-lg text-amber-900">🎉 বইমেলা বিশেষ কুপন: SHESHER10</h3>
                    <p className="text-sm text-amber-800">যেকোনো ৩টি বইয়ের সাথে পান ফ্রি হোম ডেলিভারি এবং ফ্ল্যাট ১০% ডিসকাউন্ট!</p>
                  </div>
                  <div className="p-5 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                    <h3 className="font-bold text-lg text-rose-900">🔥 ২০% ডিসকাউন্ট কুপন: BOIMELA20</h3>
                    <p className="text-sm text-rose-800">১৫০০ টাকার বেশি কেনাকাটায় পান বিশেষ ২০% অতিরিক্ত ডিসকাউন্ট।</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm sm:text-base text-zinc-700 leading-relaxed">
                    "শেষের পাতা" কেবল একটি অনলাইন বইয়ের দোকান নয়, এটি প্রতিটি বইপ্রেমীর মনের একটি শান্তির আঙিনা। আমরা বিশ্বাস করি একটি ভালো বই একজন মানুষের জীবন বদলে দিতে পারে।
                  </p>
                  <p className="text-sm sm:text-base text-zinc-700 leading-relaxed">
                    আমাদের লক্ষ্য বাংলাদেশের প্রতিটি প্রান্তে শতভাগ আসল ও মানসম্মত বই দ্রুততম সময়ে পাঠকদের হাতে পৌঁছে দেওয়া।
                  </p>
                  <div className="p-4 bg-[#FAF8F4] border border-amber-200 rounded-2xl text-xs space-y-1 text-zinc-700">
                    <p><strong>ঠিকানা:</strong> কাঁটাবন বইয়ের মার্কেট, নিউ এলিফ্যান্ট রোড, ঢাকা-১২০৫</p>
                    <p><strong>হেল্পলাইন:</strong> +৮৮০ ১৭০০-০০০০০০ (সকাল ৯টা - রাত ১০টা)</p>
                    <p><strong>ইমেইল:</strong> support@shesherpata.com</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(navId) => {
          setCurrentNav(navId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
      />

      {/* Mobile Fixed Bottom Navigation Bar */}
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

      {/* Drawers and Modals */}
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
          allBooks={BOOKS}
          onClose={() => setSelectedBookForDetails(null)}
          onSelectBook={(book) => setSelectedBookForDetails(book)}
          onBuyNow={(book, quantity) => handleBuyNow(book, quantity)}
        />
      )}

      {selectedBookForQuickView && (
        <QuickViewModal
          book={selectedBookForQuickView}
          onClose={() => setSelectedBookForQuickView(null)}
          onOpenFullDetails={(book) => {
            setSelectedBookForQuickView(null);
            setSelectedBookForDetails(book);
          }}
        />
      )}

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={() => {
          showToast('আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!', 'success');
        }}
      />

      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onOpenOrders={() => setIsTrackOrderOpen(true)}
        onOpenWishlist={() => {}}
      />
    </div>
  );
}
