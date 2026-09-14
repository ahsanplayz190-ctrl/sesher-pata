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

  const islamicBooks = useMemo(
    () => BOOKS.filter((b) => b.category === 'ইসলামিক সাহিত্য' || b.category === 'ইসলামিক বই' || b.tags?.includes('ইসলামিক')),
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

  // Navigation router handling
  const handleNavClick = (navId: string) => {
    if (
      navId === 'novel' ||
      navId === 'thriller' ||
      navId === 'islamic' ||
      navId === 'children' ||
      navId === 'poetry' ||
      navId === 'english'
    ) {
      const categoryMap: Record<string, string> = {
        novel: 'উপন্যাস',
        thriller: 'গোয়েন্দা ও থ্রিলার',
        islamic: 'ইসলামিক সাহিত্য',
        children: 'কিশোর সাহিত্য',
        poetry: 'কবিতা',
        english: 'বিদেশি বই',
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
    <div className="min-h-screen text-zinc-900 flex flex-col selection:bg-amber-400 selection:text-zinc-950">
      {/* Header */}
      <Header
        currentNav={currentNav}
        onNavigate={handleNavClick}
        onSearchSubmit={handleSearchSubmit}
        onSelectBook={(book) => setSelectedBookForDetails(book)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 lg:pb-0">
        {currentNav === 'home' && (
          <div className="space-y-6 sm:space-y-10">
            {/* Hero Section with interactive multi-slide carousel */}
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

            {/* Section 1: আজকের অফার (Discounted) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <SectionHeader
                title="আজকের বিশেষ অফার"
                subtitle="সর্বোচ্চ ২০% থেকে ৪০% ছাড়ে পছন্দের সেরা বই"
                onViewAll={() => handleViewAllSection('all')}
              />
              <ProductCarousel
                books={discountedBooks}
                onOpenDetails={(book) => setSelectedBookForDetails(book)}
                onQuickView={(book) => setSelectedBookForQuickView(book)}
              />
            </section>

            {/* Section 2: পাঠকের পছন্দ (Bestsellers) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <SectionHeader
                title="পাঠকের পছন্দ ও জনপ্রিয় বই"
                subtitle="বাংলাদেশের সর্বাধিক পঠিত ও আলোচিত বইসমূহ"
                onViewAll={() => handleViewAllSection('all')}
              />
              <ProductCarousel
                books={bestsellerBooks}
                onOpenDetails={(book) => setSelectedBookForDetails(book)}
                onQuickView={(book) => setSelectedBookForQuickView(book)}
              />
            </section>

            {/* Mid-Page Promotional Banner: বইমেলা বিশেষ কুপন */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 my-4">
              <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#1B1910] via-[#282419] to-[#1B1910] border border-[#3A3423] p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5A913] text-zinc-950 text-xs font-black">
                    <Gift className="w-3.5 h-3.5" />
                    <span>বিশেষ সুযোগ</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    যেকোনো ৩টি বই কিনলেই সারা দেশে ফ্রি হোম ডেলিভারি!
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300">
                    চেকআউটে কুপন কোড ব্যবহার করুন: <strong className="text-[#E5A913] font-bold">SHESHER10</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentNav('books');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-xl bg-[#E5A913] hover:bg-[#D99600] text-zinc-950 font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer shrink-0 active:scale-95"
                >
                  অফার উপভোগ করুন ➔
                </button>
              </div>
            </div>

            {/* Section 3: নতুন প্রকাশনা (New Releases) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <SectionHeader
                title="নতুন প্রকাশনা"
                subtitle="সাম্প্রতিক প্রকাশিত নতুন ও আলোচিত বই"
                onViewAll={() => handleViewAllSection('all')}
              />
              <ProductCarousel
                books={newReleaseBooks}
                onOpenDetails={(book) => setSelectedBookForDetails(book)}
                onQuickView={(book) => setSelectedBookForQuickView(book)}
              />
            </section>

            {/* Section 4: থ্রিলার, গোয়েন্দা ও রহস্য */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <SectionHeader
                title="থ্রিলার, গোয়েন্দা ও রহস্য"
                subtitle="ফেলুদা, মিসির আলি ও টানটান উত্তেজনার রোমাঞ্চকর গল্প"
                onViewAll={() => handleViewAllSection('কিশোর সাহিত্য')}
              />
              <ProductCarousel
                books={juvenileAndMysteryBooks}
                onOpenDetails={(book) => setSelectedBookForDetails(book)}
                onQuickView={(book) => setSelectedBookForQuickView(book)}
              />
            </section>

            {/* Section 5: চিরায়ত বাংলা উপন্যাস ও কবিতা */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <SectionHeader
                title="চিরায়ত বাংলা উপন্যাস ও সাহিত্য"
                subtitle="রবীন্দ্রনাথ, নজরুল, শরৎচন্দ্র সহ কালজয়ী সাহিত্যসমগ্র"
                onViewAll={() => handleViewAllSection('উপন্যাস')}
              />
              <ProductCarousel
                books={classicAndNovelBooks}
                onOpenDetails={(book) => setSelectedBookForDetails(book)}
                onQuickView={(book) => setSelectedBookForQuickView(book)}
              />
            </section>

            {/* Section 6: ইসলামিক সাহিত্য */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <SectionHeader
                title="ইসলামিক সাহিত্য ও চিন্তাধারা"
                subtitle="আত্মশুদ্ধি, ইতিহাস ও জীবন গঠনের উপযোগী বইসমূহ"
                onViewAll={() => handleViewAllSection('ইসলামিক সাহিত্য')}
              />
              <ProductCarousel
                books={islamicBooks}
                onOpenDetails={(book) => setSelectedBookForDetails(book)}
                onQuickView={(book) => setSelectedBookForQuickView(book)}
              />
            </section>

            {/* Section 7: বিশ্বসাহিত্য ও অনুবাদ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <SectionHeader
                title="বিশ্বসাহিত্য ও অনুবাদ গ্রন্থ"
                subtitle="আন্তর্জাতিক পুরস্কারপ্রাপ্ত ও জনপ্রিয় বিদেশি অনুবাদ বই"
                onViewAll={() => handleViewAllSection('বিদেশি বই')}
              />
              <ProductCarousel
                books={internationalBooks}
                onOpenDetails={(book) => setSelectedBookForDetails(book)}
                onQuickView={(book) => setSelectedBookForQuickView(book)}
              />
            </section>

            {/* Trust Assurance Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-3xl border border-[#E8E3D5] shadow-xs text-center">
                <div className="space-y-1 p-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center mx-auto text-lg">
                    📖
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900">১০০% আসল বই</h4>
                  <p className="text-[11px] text-zinc-500">সকল প্রকাশনীর আসল প্রিন্ট</p>
                </div>

                <div className="space-y-1 p-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center mx-auto text-lg">
                    🚀
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900">সারা দেশে ডেলিভারি</h4>
                  <p className="text-[11px] text-zinc-500">দ্রুততম সময়ে সরাসরি আপনার দরজায়</p>
                </div>

                <div className="space-y-1 p-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center mx-auto text-lg">
                    💵
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900">ক্যাশ অন ডেলিভারি</h4>
                  <p className="text-[11px] text-zinc-500">বই পেয়ে মূল্য পরিশোধের সুবিধা</p>
                </div>

                <div className="space-y-1 p-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center mx-auto text-lg">
                    🔄
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900">সহজ রিটার্ন</h4>
                  <p className="text-[11px] text-zinc-500">৭ দিনের মধ্যে পরিবর্তনের নিশ্চয়তা</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Books & Catalog View */}
        {(currentNav === 'books' || currentNav === 'publishers' || currentNav === 'packages') && (
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
