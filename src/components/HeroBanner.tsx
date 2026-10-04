'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, BookOpen, Sparkles, ChevronLeft, ChevronRight, Gift, Tag, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';

interface HeroBannerProps {
  onExploreClick: () => void;
  onBuyNowClick: () => void;
}

interface Slide {
  id: string;
  badge: string;
  badgeColor: string;
  headline: string;
  subheadline: string;
  description: string;
  highlightText: string;
  primaryCta: string;
  secondaryCta: string;
  theme: 'cream' | 'dark' | 'amber';
}

const HERO_SLIDES: Slide[] = [
  {
    id: 'slide-1',
    badge: '★ বিশ্বস্ত অনলাইন বুকশপ',
    badgeColor: 'bg-[#E5A913] text-zinc-950',
    headline: 'ঝামেলা ছাড়া বই কিনুন',
    subheadline: 'সর্বোচ্চ ছাড়ে, দ্রুত সময়ে!',
    description: 'অনলাইন বইয়ের নির্ভরযোগ্য আঙিনা — রবীন্দ্রনাথ, হুমায়ূন আহমেদ, ফেলুদা থেকে সমকালীন বেস্টসেলার বই শতভাগ অরিজিনাল প্রিন্টে।',
    highlightText: 'হটলাইন: ০১৭০০-০০০০০০ / ০১৯০০-০০০০০০',
    primaryCta: 'বইসমূহ ঘুরে দেখুন',
    secondaryCta: 'এখনই অর্ডার করুন',
    theme: 'cream',
  },
  {
    id: 'slide-2',
    badge: '🎉 বইমেলা বিশেষ আয়োজন',
    badgeColor: 'bg-[#D32F2F] text-white',
    headline: 'বইয়ের পাতায় নতুন গল্প',
    subheadline: 'ফ্ল্যাট ১০% অতিরিক্ত ছাড়!',
    description: 'যেকোনো ৩টি বা তার বেশি বই অর্ডারে সারা দেশে ফ্রি হোম ডেলিভারি ও বিশেষ গিফট বুকমার্ক। কুপন কোড: SHESHER10 ব্যবহার করুন।',
    highlightText: 'কুপন কোড: SHESHER10 (সীমিত সময়ের জন্য)',
    primaryCta: 'অফারের বই দেখুন',
    secondaryCta: 'কুপন ব্যবহার করুন',
    theme: 'amber',
  },
  {
    id: 'slide-3',
    badge: '📚 নতুন ও জনপ্রিয় প্রকাশনা',
    badgeColor: 'bg-[#1B1910] text-[#E5A913]',
    headline: 'সেরা লেখকদের বই এক ঠিকানায়',
    subheadline: 'হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি',
    description: 'উপন্যাস, থ্রিলার, সায়েন্স ফিকশন, কবিতা ও ইসলামিক সাহিত্যের বিশাল কালেকশন সরাসরি আপনার দরজায় দ্রুততম সময়ে পৌঁছে দিতে আমরা প্রস্তুত।',
    highlightText: 'সারা দেশে দ্রুততম হোম ডেলিভারি সুবিধা',
    primaryCta: 'ক্যাটালগ ব্রাউজ করুন',
    secondaryCta: 'বেস্টসেলার দেখুন',
    theme: 'cream',
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick, onBuyNowClick }) => {
  const { siteSettings } = useData();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, currentSlideIndex]);

  const currentSlide = HERO_SLIDES[currentSlideIndex];

  return (
    <section
      className="w-full my-3 sm:my-5 select-none font-['Noto_Sans_Bengali']"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-2xl sm:rounded-3xl bg-[#FEFDF9] border border-[#E9E4D6] shadow-sm overflow-hidden p-6 sm:p-9 md:p-11 min-h-[330px] sm:min-h-[380px] flex items-center">
          {/* Background brand texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30 bg-repeat bg-[length:320px_auto]"
            style={{
              backgroundImage: 'url("/images/background.png")',
              backgroundPosition: 'top left',
            }}
          />

          {/* Subtle background decorative shapes */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#E5A913]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#E5A913]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Slider Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8"
            >
              {/* Left Column: Text Content */}
              <div className="max-w-xl text-center md:text-left flex-1 space-y-3 sm:space-y-3.5">
                {/* Promo Badge */}
                <div className="inline-flex items-center gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black shadow-2xs ${currentSlide.badgeColor}`}>
                    {currentSlide.badge}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#1E1B13] tracking-tight leading-tight">
                  {currentSlide.headline}
                </h1>

                <p className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#2F2A1E]">
                  {currentSlide.subheadline}
                </p>

                <p className="text-xs sm:text-sm text-zinc-600 font-normal leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {currentSlide.description}
                </p>

                <div className="pt-0.5 text-xs text-zinc-700 font-semibold flex items-center justify-center md:justify-start gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#E5A913]" />
                  <span>
                    {currentSlide.id === 'slide-1' && siteSettings?.phone
                      ? `হটলাইন: ${siteSettings.phone}${siteSettings.alt_phone ? ` / ${siteSettings.alt_phone}` : ''}`
                      : currentSlide.highlightText}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <button
                    type="button"
                    onClick={onExploreClick}
                    className="px-6 py-2.5 rounded-lg bg-[#E5A913] hover:bg-[#D99600] text-zinc-950 font-extrabold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <BookOpen className="w-4 h-4 text-zinc-950" />
                    <span>{currentSlide.primaryCta}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onBuyNowClick}
                    className="px-5 py-2.5 rounded-lg bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-xs sm:text-sm border border-zinc-300 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <span>{currentSlide.secondaryCta}</span>
                  </button>
                </div>
              </div>

              {/* Curved Hand-Drawn Arrow Graphic in the center (Desktop) */}
              <div className="hidden lg:block relative z-10 shrink-0 opacity-75">
                <svg
                  className="w-24 h-16 text-zinc-700"
                  viewBox="0 0 100 60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10,10 C40,4 60,50 85,35" />
                  <polyline points="80,25 87,35 75,38" />
                </svg>
              </div>

              {/* Right Column: Interactive Phone Mockup Card */}
              <div className="relative z-10 shrink-0 flex items-center justify-center">
                <div className="relative w-52 sm:w-60 md:w-64 bg-white rounded-3xl border-4 border-[#282419] shadow-2xl overflow-hidden p-3.5 space-y-2.5">
                  <div className="w-16 h-1 bg-zinc-300 rounded-full mx-auto" />

                  <div className="bg-[#FAF8F3] rounded-2xl p-3 border border-zinc-200 text-center space-y-2">
                    <div className="w-9 h-9 rounded-full bg-[#E5A913] text-zinc-950 font-black flex items-center justify-center mx-auto shadow-xs text-xs">
                      বই
                    </div>
                    <h4 className="text-xs font-black text-zinc-900">শেষের পাতা মোবাইল শপ</h4>
                    <p className="text-[10px] text-zinc-500">সহজেই অর্ডার করুন পছন্দের আসল বই</p>

                    <div className="flex justify-center -space-x-2 pt-1">
                      <div className="w-8 h-11 bg-amber-700 rounded shadow-xs" />
                      <div className="w-8 h-11 bg-zinc-800 rounded shadow-xs" />
                      <div className="w-8 h-11 bg-emerald-700 rounded shadow-xs" />
                    </div>

                    <div className="pt-1">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#E5A913] text-zinc-950 font-bold text-[10px]">
                        ৪০% পর্যন্ত ছাড়
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Left / Right Carousel Controls */}
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-zinc-800 border border-zinc-200 shadow-md flex items-center justify-center transition-all cursor-pointer z-20"
            aria-label="পূর্ববর্তী স্লাইড"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-zinc-800 border border-zinc-200 shadow-md flex items-center justify-center transition-all cursor-pointer z-20"
            aria-label="পরবর্তী স্লাইড"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Pagination Indicators (Dots) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentSlideIndex === idx ? 'w-6 bg-[#E5A913]' : 'w-2 bg-zinc-300 hover:bg-zinc-400'
                }`}
                aria-label={`স্লাইড ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

