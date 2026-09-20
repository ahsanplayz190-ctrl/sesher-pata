'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  Gift,
  Flame,
  Star,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Compass,
  Heart,
  Bookmark,
  Send,
  Instagram,
  Tag,
  ShieldCheck,
  Truck,
  Check,
} from 'lucide-react';
import { Book, Banner } from '../../types';
import { EnglishBookCard } from './EnglishBookCard';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useData } from '../../context/DataContext';

interface EnglishHomeProps {
  books: Book[];
  onSelectCategory: (categoryId: string) => void;
  catalogCategory: string;
  onViewAllSection: (categoryId: string) => void;
  onOpenDetails: (book: Book) => void;
  onQuickView: (book: Book) => void;
  onBuyNow: (book?: Book) => void;
  onExploreClick: () => void;
}

export const EnglishHome: React.FC<EnglishHomeProps> = ({
  books,
  onSelectCategory,
  catalogCategory,
  onViewAllSection,
  onOpenDetails,
  onQuickView,
  onBuyNow,
  onExploreClick,
}) => {
  const { banners } = useData();
  const { getBookDisplayName, getBannerImage, formatPrice } = useLanguage();
  const { addToCart } = useCart();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Active banners
  const activeBanners = useMemo(() => {
    return banners.filter((b) => b.status === 'active').sort((a, b) => a.sort_order - b.sort_order);
  }, [banners]);

  // Book sets for different sections
  const bestsellers = useMemo(
    () => books.filter((b) => b.isBestseller || b.rating >= 4.8).slice(0, 8),
    [books]
  );

  const fictionAndThrillers = useMemo(
    () =>
      books.filter(
        (b) =>
          b.category === 'থ্রিলার ও গোয়েন্দা' ||
          b.category === 'উপন্যাস' ||
          b.category === 'কিশোর সাহিত্য' ||
          b.tags?.includes('থ্রিলার') ||
          b.tags?.includes('উপন্যাস')
      ).slice(0, 8),
    [books]
  );

  const newReleases = useMemo(
    () => books.filter((b) => b.isNew || b.isNewRelease || b.rating >= 4.7).slice(0, 8),
    [books]
  );

  // Arched Stationery showcase items (signature BookOwls reference)
  const archedStationeryItems = [
    {
      id: 'arch-1',
      title: 'Velvet Plum Journal',
      category: 'Notebooks',
      price: 380,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
      color: 'from-[#4A1525] to-[#2D0B16]',
    },
    {
      id: 'arch-2',
      title: 'Forest Emerald Diary',
      category: 'Hardcover',
      price: 420,
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
      color: 'from-[#123824] to-[#0A1F14]',
    },
    {
      id: 'arch-3',
      title: 'Warm Taupe Sketchbook',
      category: 'Artisan Paper',
      price: 350,
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
      color: 'from-[#382E25] to-[#1E1813]',
    },
    {
      id: 'arch-4',
      title: 'Midnight Navy Planner',
      category: 'Annual Planner',
      price: 450,
      image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=400&q=80',
      color: 'from-[#132238] to-[#0B1422]',
    },
    {
      id: 'arch-5',
      title: 'Artisan Foil Bookmark Set',
      category: 'Metal Bookmarks',
      price: 190,
      image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=400&q=80',
      color: 'from-[#3A2D13] to-[#201809]',
    },
  ];

  // Shop by Genre - 12 illustrated genres
  const genreBadges = [
    { name: 'Dark Academia', icon: '🏛️', count: '48 Books', tag: 'উপন্যাস' },
    { name: 'Romance & Drama', icon: '🌹', count: '65 Books', tag: 'উপন্যাস' },
    { name: 'Thriller & Mystery', icon: '🕵️', count: '52 Books', tag: 'গোয়েন্দা ও থ্রিলার' },
    { name: 'Sci-Fi & Speculative', icon: '🚀', count: '34 Books', tag: 'কিশোর সাহিত্য' },
    { name: 'Fantasy & Myth', icon: '🐉', count: '41 Books', tag: 'কিশোর সাহিত্য' },
    { name: 'Poetry & Prose', icon: '✒️', count: '29 Books', tag: 'কবিতা' },
    { name: 'History & Politics', icon: '📜', count: '38 Books', tag: 'ইতিহাস ও ঐতিহ্য' },
    { name: 'Self-Help & Mindset', icon: '🌱', count: '44 Books', tag: 'আত্মউন্নয়ন ও মোটিভেশন' },
    { name: 'Psychology & Society', icon: '🧠', count: '31 Books', tag: 'বিজ্ঞান ও প্রযুক্তি' },
    { name: 'Classics & Nobel', icon: '🏆', count: '50 Books', tag: 'বিদেশি বই' },
    { name: 'Manga & Graphic Novels', icon: '🎨', count: '26 Books', tag: 'কিশোর সাহিত্য' },
    { name: 'Spirituality & Ethics', icon: '🕊️', count: '35 Books', tag: 'ইসলামিক সাহিত্য' },
  ];

  // Bookish Bundles
  const bookBundles = [
    {
      title: 'Modern Japanese Classics Set',
      description: 'Murakami, Kawabata & Dazai curated collection in protective slipcase',
      price: 1450,
      originalPrice: 1950,
      discount: '25% OFF',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'The Great Detective Omnibus',
      description: 'Feluda, Byomkesh & Sherlock complete mystery box sets',
      price: 1690,
      originalPrice: 2200,
      discount: '23% OFF',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Mindset & Peak Productivity Pack',
      description: 'Atomic Habits, Psychology of Money, Ikigai & Deep Work',
      price: 1550,
      originalPrice: 2100,
      discount: '26% OFF',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Bengali Renaissance Poetry Box',
      description: 'Rabindranath Tagore & Kazi Nazrul Islam deluxe hardcovers',
      price: 1250,
      originalPrice: 1700,
      discount: '26% OFF',
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=500&q=80',
    },
  ];

  // Customer Reviews (Clipped Paper / Polaroid note cards)
  const reviews = [
    {
      name: 'Sadia Rahman',
      location: 'Dhanmondi, Dhaka',
      rating: 5,
      note: '“Shesher Pata is my sanctuary for authentic international paperbacks. The packaging arrived crisp, zero bent edges, and the bookmark gifts are gorgeous!”',
      book: 'Norwegian Wood by Murakami',
    },
    {
      name: 'Farhan Tanvir',
      location: 'GEC Circle, Chittagong',
      rating: 5,
      note: '“The switch to English mode is flawless. I found rare editions of classics with super fast delivery in 48 hours. Absolute 10/10 service.”',
      book: 'Atomic Habits & Sapiens',
    },
    {
      name: 'Anika Tabassum',
      location: 'Zindabazar, Sylhet',
      rating: 5,
      note: '“The aesthetic of the journals and books is unmatched. Feels like shopping at an upscale European indie bookstore right from Bangladesh.”',
      book: 'Studio Ghibli Diary & Planner',
    },
    {
      name: 'Tahmid Hasan',
      location: 'Motihar, Rajshahi',
      rating: 5,
      note: '“Cash on delivery was smooth and the coupon code SHESHER10 worked instantly at checkout. Truly dependable bookshop!”',
      book: 'Feluda & Byomkesh Omnibus',
    },
  ];

  // Instagram Community Wall Photos
  const communityPhotos = [
    { img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&h=300&q=80', tag: '@reader.tales' },
    { img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=300&h=300&q=80', tag: '@cozy.pages' },
    { img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&h=300&q=80', tag: '@bookish.dhaka' },
    { img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=300&h=300&q=80', tag: '@literature.vibes' },
    { img: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=300&h=300&q=80', tag: '@nocturnal.reader' },
    { img: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=300&h=300&q=80', tag: '@coffee.and.chapters' },
    { img: 'https://images.unsplash.com/photo-1507842229440-1926b0147983?auto=format&fit=crop&w=300&h=300&q=80', tag: '@shesher.moments' },
    { img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=300&h=300&q=80', tag: '@bookowls.reader' },
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setIsSubscribed(true);
      setNewsletterEmail('');
    }
  };

  const currentBanner = activeBanners[currentSlideIndex] || activeBanners[0];

  return (
    <div className="space-y-12 sm:space-y-16 pb-12 bg-[#12110e] text-zinc-100 font-sans">
      {/* 1. Hero Banner Slider (English specific display) */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="relative rounded-3xl overflow-hidden border border-[#2e281b] bg-[#1a1712] min-h-[360px] sm:min-h-[440px] md:min-h-[500px] flex items-center shadow-2xl">
          {/* Banner Background Image */}
          {currentBanner && (
            <div className="absolute inset-0 z-0">
              <img
                src={getBannerImage(currentBanner)}
                alt={currentBanner.english_title || currentBanner.title}
                className="w-full h-full object-cover object-center filter brightness-60 contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#12110e] via-[#12110e]/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12110e] via-transparent to-transparent opacity-80" />
            </div>
          )}

          {/* Banner Content */}
          <div className="relative z-10 p-6 sm:p-12 md:p-16 max-w-2xl space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5A913] text-zinc-950 text-xs font-black tracking-wide uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentBanner?.badge || 'Featured Collection'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black text-white leading-tight tracking-tight drop-shadow-md">
              {currentBanner?.english_title || currentBanner?.title || 'Studio Ghibli Inspired Stationery Collection'}
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed max-w-xl">
              {currentBanner?.english_subtitle || currentBanner?.subtitle || 'Curated journals, handmade bookmarks, and premium collector editions delivered nationwide.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onExploreClick}
                className="px-6 py-3 rounded-full bg-[#E5A913] hover:bg-[#d99a07] text-zinc-950 font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>Browse Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onBuyNow(bestsellers[0])}
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer backdrop-blur-md"
              >
                Order Bestseller
              </button>
            </div>
          </div>

          {/* Slide Navigation Controls */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-5 right-6 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setCurrentSlideIndex((prev) =>
                    (prev - 1 + activeBanners.length) % activeBanners.length
                  )
                }
                className="p-2 rounded-full bg-black/60 text-white hover:bg-[#E5A913] hover:text-zinc-950 transition-colors backdrop-blur-sm cursor-pointer"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentSlideIndex((prev) => (prev + 1) % activeBanners.length)
                }
                className="p-2 rounded-full bg-black/60 text-white hover:bg-[#E5A913] hover:text-zinc-950 transition-colors backdrop-blur-sm cursor-pointer"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 2. Crimson Announcement Strip (from BookOwls screenshot) */}
      <div className="w-full bg-[#8E1B1B] text-white py-2.5 px-4 text-center text-xs sm:text-sm font-bold tracking-wide shadow-inner flex items-center justify-center gap-2">
        <Flame className="w-4 h-4 fill-white shrink-0 animate-pulse" />
        <span>
          Spring Reading Carnival: Use coupon code{' '}
          <strong className="underline decoration-2 font-black">SHESHER10</strong> for an extra 10% off on all orders!
        </span>
      </div>

      {/* 3. Featured Spotlight & 4 Product Tiles (as seen in screenshot) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="space-y-6">
          <div className="text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E5A913]">
              Editor's Spotlight
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-white">
              Curated Book of the Season
            </h2>
          </div>

          {/* Large Hero Card with Book Showcase */}
          <div className="rounded-3xl bg-[#1b1813] border border-[#30281b] p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl">
            <div className="relative w-full md:w-1/2 rounded-2xl overflow-hidden bg-black/40 aspect-4/3 flex items-center justify-center group">
              <img
                src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80"
                alt="Atomic Habits Spotlight"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-[#E5A913] text-zinc-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Bookmark className="w-6 h-6 stroke-[2.5]" />
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#292214] border border-[#483a1e] text-[#E5A913] text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-[#E5A913]" />
                <span>#1 International Bestseller</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-black text-white">
                Atomic Habits: Tiny Changes, Remarkable Results
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                No matter your goals, Atomic Habits offers a proven framework for improving every day.
                James Clear reveals practical strategies that will teach you exactly how to form good
                habits, break bad ones, and master the tiny behaviors that lead to remarkable results.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div>
                  <span className="text-xl sm:text-2xl font-black text-[#E5A913]">৳490</span>
                  <span className="ml-2 text-xs sm:text-sm text-zinc-500 line-through">৳700</span>
                </div>
                <button
                  type="button"
                  onClick={() => onBuyNow(bestsellers[0])}
                  className="px-6 py-2.5 rounded-xl bg-[#E5A913] hover:bg-[#d99a07] text-zinc-950 font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer active:scale-95"
                >
                  Buy Now ➔
                </button>
              </div>
            </div>
          </div>

          {/* 4 Feature Photo Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {[
              {
                title: 'Collector Editions',
                subtitle: 'Hardcovers & Clothbound',
                img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
              },
              {
                title: 'Handmade Journals',
                subtitle: 'Artisan Paper & Leather',
                img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
              },
              {
                title: 'Bookmarks & Pins',
                subtitle: 'Enamel & Metal Crafts',
                img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
              },
              {
                title: 'Bookish Gift Sets',
                subtitle: 'Curated Reader Boxes',
                img: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=400&q=80',
              },
            ].map((tile, i) => (
              <div
                key={i}
                onClick={onExploreClick}
                className="group relative rounded-2xl overflow-hidden aspect-4/3 border border-[#2d261a] cursor-pointer shadow-md"
              >
                <img
                  src={tile.img}
                  alt={tile.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-3.5 text-left">
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#E5A913] transition-colors">
                    {tile.title}
                  </h4>
                  <span className="text-[10px] text-zinc-400">{tile.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Bestseller Books Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-6">
          <div className="text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E5A913]">
              Readers' Favorites
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-white">
              Bestselling Titles
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onViewAllSection('all')}
            className="px-4 py-1.5 rounded-full border border-[#3b3425] hover:border-[#E5A913] text-xs font-bold text-zinc-300 hover:text-[#E5A913] transition-colors cursor-pointer"
          >
            View All ➔
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {bestsellers.map((b) => (
            <EnglishBookCard
              key={b.id}
              book={b}
              onOpenDetails={onOpenDetails}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </section>

      {/* 5. Arched Stationery & Notebooks Showcase (Distinctive BookOwls visual) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-[#181611] border border-[#2d261a] p-6 sm:p-10 text-center space-y-8 shadow-2xl">
          <div className="max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E5A913]">
              Handcrafted Essentials
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
              Notebooks & Journal Collection
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Acid-free Italian paper, lay-flat thread binding, and gold foil stamped covers for daily reflections.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {archedStationeryItems.map((item) => (
              <div
                key={item.id}
                onClick={onExploreClick}
                className="group cursor-pointer flex flex-col items-center text-center space-y-3"
              >
                {/* Arched Top Container */}
                <div className="relative w-full aspect-3/4 rounded-t-full rounded-b-2xl overflow-hidden border border-[#3b3323] group-hover:border-[#E5A913] transition-colors shadow-lg bg-[#242017]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    {item.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#E5A913] transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <span className="text-xs font-black text-[#E5A913]">
                    {formatPrice(item.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Trending Fiction & International Suspense */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-6">
          <div className="text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E5A913]">
              Page Turners
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-white">
              Trending Fiction & Thrillers
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onViewAllSection('উপন্যাস')}
            className="px-4 py-1.5 rounded-full border border-[#3b3425] hover:border-[#E5A913] text-xs font-bold text-zinc-300 hover:text-[#E5A913] transition-colors cursor-pointer"
          >
            Explore Fiction ➔
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {fictionAndThrillers.map((b) => (
            <EnglishBookCard
              key={b.id}
              book={b}
              onOpenDetails={onOpenDetails}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </section>

      {/* 7. Shop by Genre - 12 Illustrated Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E5A913]">
            Curated Categories
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
            Explore Books by Genre
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {genreBadges.map((genre, i) => (
            <div
              key={i}
              onClick={() => onSelectCategory(genre.tag)}
              className="group p-4 rounded-2xl bg-[#1a1712] border border-[#2d261a] hover:border-[#E5A913] hover:bg-[#241f17] transition-all cursor-pointer flex flex-col items-center text-center space-y-2.5 shadow-md active:scale-95"
            >
              <div className="w-12 h-12 rounded-full bg-[#282216] border border-[#403522] group-hover:bg-[#E5A913] group-hover:text-zinc-950 transition-colors flex items-center justify-center text-xl shadow-inner">
                <span>{genre.icon}</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#E5A913] transition-colors line-clamp-1">
                  {genre.name}
                </h4>
                <span className="text-[10px] text-zinc-400">{genre.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Bookish Bundles & Box Sets */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-6">
          <div className="text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E5A913]">
              Special Sets
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-white">
              Bookish Bundles & Box Sets
            </h2>
          </div>
          <button
            type="button"
            onClick={onExploreClick}
            className="px-4 py-1.5 rounded-full border border-[#3b3425] hover:border-[#E5A913] text-xs font-bold text-zinc-300 hover:text-[#E5A913] transition-colors cursor-pointer"
          >
            All Bundles ➔
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {bookBundles.map((bundle, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#1c1914] border border-[#2e271c] p-4 flex flex-col justify-between space-y-4 shadow-lg hover:border-[#E5A913]/60 transition-all text-left"
            >
              <div className="space-y-3">
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-[#242017]">
                  <img
                    src={bundle.image}
                    alt={bundle.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#D32F2F] text-white text-[10px] font-black uppercase">
                    {bundle.discount}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white line-clamp-1">
                  {bundle.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {bundle.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#292317] flex items-center justify-between">
                <div>
                  <span className="text-base font-black text-[#E5A913]">
                    {formatPrice(bundle.price)}
                  </span>
                  <span className="ml-2 text-xs text-zinc-500 line-through">
                    {formatPrice(bundle.originalPrice)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onBuyNow(bestsellers[0])}
                  className="px-3 py-1.5 rounded-lg bg-[#E5A913] hover:bg-[#d99a07] text-zinc-950 font-bold text-xs transition-all cursor-pointer"
                >
                  Order Set
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Customer Reviews & Clipped Love Notes (Signature BookOwls element) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E5A913]">
            Reader Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
            Notes From Our Readers
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {reviews.map((rev, i) => (
            <div
              key={i}
              className="relative p-5 rounded-2xl bg-[#1b1812] border border-[#30281b] shadow-xl text-left flex flex-col justify-between space-y-4 pt-7"
            >
              {/* Paper Clip Visual at top center */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-7 rounded-full border-2 border-zinc-400 bg-[#252017] shadow-xs" />

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, r) => (
                    <Star key={r} className="w-3.5 h-3.5 text-[#E5A913] fill-[#E5A913]" />
                  ))}
                </div>
                <p className="text-xs text-zinc-300 italic leading-relaxed">
                  {rev.note}
                </p>
              </div>

              <div className="pt-3 border-t border-[#292215]">
                <h4 className="text-xs font-bold text-white">{rev.name}</h4>
                <span className="text-[10px] text-zinc-400 block">{rev.location}</span>
                <span className="text-[10px] text-[#E5A913] font-medium block mt-0.5">
                  Ordered: {rev.book}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Instagram / Reader Community Wall (Warm Mustard Banner) */}
      <section className="w-full bg-[#E5A913] text-zinc-950 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6 text-center">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
              <Instagram className="w-4 h-4" />
              <span>Join Our Reader Community</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black">
              Tag @shesherpata.bd on Instagram
            </h2>
            <p className="text-xs sm:text-sm font-medium text-zinc-800">
              Share your reading corners & book mail unboxings to be featured in our monthly reader spotlight!
            </p>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-2.5">
            {communityPhotos.map((item, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl overflow-hidden aspect-square border-2 border-zinc-950/15 shadow-sm"
              >
                <img
                  src={item.img}
                  alt={item.tag}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-[9px] text-white font-bold">
                  {item.tag}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Royal Navy Newsletter Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#0E2038] via-[#122A4A] to-[#0E2038] border border-[#1E3A63] p-8 sm:p-12 text-center text-white space-y-4 shadow-2xl">
          <div className="max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#E5A913]">
              The Secret Bookshelf
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black">
              Subscribe For Exclusive Collector Drops
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              Receive secret discounts, author interview previews, and first-access alerts for limited edition hardcovers.
            </p>
          </div>

          {isSubscribed ? (
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-white/10 border border-white/20 text-xs text-[#E5A913] font-bold flex items-center justify-center gap-2">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Welcome to the Secret Bookshelf! Check your inbox for your 10% voucher code.</span>
            </div>
          ) : (
            <form
              onSubmit={handleNewsletterSubmit}
              className="max-w-md mx-auto flex flex-col sm:flex-row items-center gap-2"
            >
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-400 text-xs focus:outline-hidden focus:border-[#E5A913]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#E5A913] hover:bg-[#d99a07] text-zinc-950 font-black text-xs shrink-0 transition-all cursor-pointer active:scale-95"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
