'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, Gift, ArrowRight, ShieldCheck } from 'lucide-react';
import { Book } from '../types';

interface HeroBannerProps {
  onExploreClick: () => void;
  onBuyNowClick: (book?: Book) => void;
}

interface Slide {
  id: number;
  tag: string;
  headline: string;
  subtext: string;
  primaryBtn: string;
  secondaryBtn: string;
  image: string;
  floatingBadge: string;
  badgeSub: string;
  accentColor: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick, onBuyNowClick }) => {
  const slides: Slide[] = [
    {
      id: 1,
      tag: 'শেষের পাতা বিশেষ সমাহার',
      headline: 'বইয়ের পাতায় খুঁজে নিন আপনার গল্প',
      subtext: 'আপনার পছন্দের বই, এখন শেষের পাতায়। দেশি-বিদেশি অমর সাহিত্যকর্ম ও সাম্প্রতিক প্রকাশনা সরাসরি আপনার ঠিকানায়।',
      primaryBtn: 'বই দেখুন',
      secondaryBtn: 'এখনই কিনুন',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
      floatingBadge: '৩০% পর্যন্ত ছাড়',
      badgeSub: 'বইমেলা বিশেষ অফার',
      accentColor: '#F59E0B',
    },
    {
      id: 2,
      tag: 'কালজয়ী উপন্যাস ও কবিতা',
      headline: 'রবীন্দ্রনাথ থেকে হুমায়ূন — সাহিত্যের অমীয় ধারা',
      subtext: 'বাংলা সাহিত্যের চিরন্তন ক্লাসিক এবং প্রিয় চরিত্রদের সাথে কাটুক অবসর। মিসির আলি, হিমু, ফেলুদা আর ব্যোমকেশের রোমাঞ্চকর সব বই।',
      primaryBtn: 'ক্লাসিক সিরিজ দেখুন',
      secondaryBtn: 'অর্ডার করুন',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      floatingBadge: 'সেরা উপহার সংগ্রহ',
      badgeSub: 'প্রিমিয়াম বাঁধাই সংস্করণ',
      accentColor: '#D97706',
    },
    {
      id: 3,
      tag: 'অনূদিত ও আন্তর্জাতিক বই',
      headline: 'বিশ্বসাহিত্যের শ্রেষ্ঠ রত্ন আপনার আঙিনায়',
      subtext: 'মার্কেস, পাওলো কোয়েলহো, জর্জ অরওয়েল ও হারারির বিশ্বখ্যাত বইগুলো সহজ ও প্রাঞ্জল বাংলা অনুবাদে সংগ্রহ করুন এখনই।',
      primaryBtn: 'আন্তর্জাতিক সংগ্রহ',
      secondaryBtn: 'এখনই কিনুন',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
      floatingBadge: 'নতুন সংস্করণ',
      badgeSub: 'অরিজিনাল প্রিন্ট',
      accentColor: '#B45309',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Autoplay loop with pause on hover
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Touch Swipe for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  const activeSlide = slides[currentSlide];

  return (
    <section
      className="relative w-full overflow-hidden my-4 sm:my-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#18181B] text-white shadow-xl min-h-[440px] sm:min-h-[460px] md:min-h-[500px] flex items-center border border-zinc-800">
          {/* Subtle Golden Ambient Background Glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#D97706]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Elegant geometric line patterns */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:20px_20px]" />

          {/* Slide Content with Framer Motion */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 md:p-12 relative z-10"
            >
              {/* Left Column: Text with staggered animation */}
              <div className="lg:col-span-7 flex flex-col justify-center text-left">
                {/* Tag */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-semibold mb-4 w-fit"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>{activeSlide.tag}</span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.15 }}
                  className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight md:leading-tight mb-4 font-['Noto_Sans_Bengali']"
                >
                  {activeSlide.headline}
                </motion.h1>

                {/* Supporting Text */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.2 }}
                  className="text-zinc-300 text-sm sm:text-base md:text-lg leading-relaxed mb-6 max-w-xl"
                >
                  {activeSlide.subtext}
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.25 }}
                  className="flex flex-wrap items-center gap-3 sm:gap-4"
                >
                  <button
                    type="button"
                    onClick={onExploreClick}
                    className="cursor-pointer px-6 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-zinc-950 font-bold text-sm sm:text-base transition-all duration-200 shadow-lg shadow-amber-500/20 active:scale-95 flex items-center gap-2 group"
                  >
                    <BookOpen className="w-4 h-4 text-zinc-950" />
                    <span>{activeSlide.primaryBtn}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onBuyNowClick()}
                    className="cursor-pointer px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base transition-all duration-200 backdrop-blur-xs border border-white/15 active:scale-95 flex items-center gap-2"
                  >
                    <span>{activeSlide.secondaryBtn}</span>
                  </button>
                </motion.div>

                {/* Trust mini banner */}
                <div className="mt-8 pt-6 border-t border-zinc-800/80 flex items-center gap-4 text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>১০০% আসল বই</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-zinc-600" />
                  <span>দ্রুত ডেলিভারি</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-600" />
                  <span>সহজ রিটার্ন</span>
                </div>
              </div>

              {/* Right Column: Book Imagery & Floating Elements */}
              <div className="lg:col-span-5 relative flex items-center justify-center">
                {/* Main Book Visual Card with 3D feel */}
                <motion.div
                  initial={{ opacity: 0, x: 40, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative w-64 sm:w-72 md:w-80 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/30 group"
                >
                  <img
                    src={activeSlide.image}
                    alt={activeSlide.headline}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle inner shadow and golden border glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  {/* Spine edge illusion */}
                  <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 via-white/15 to-transparent" />
                </motion.div>

                {/* Floating Promotional Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.35 }}
                  className="absolute -bottom-4 -left-4 sm:left-4 bg-[#18181B]/95 backdrop-blur-md border border-[#F59E0B]/40 rounded-2xl p-3.5 shadow-xl flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black shrink-0 shadow-xs">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-sm text-amber-400">
                      {activeSlide.floatingBadge}
                    </span>
                    <span className="block text-[11px] text-zinc-300">
                      {activeSlide.badgeSub}
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls: Prev / Next buttons */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
            aria-label="পূর্ববর্তী স্লাইড"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
            aria-label="পরবর্তী স্লাইড"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Navigation Indicator Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentSlide === idx
                    ? 'w-7 h-2 bg-[#F59E0B]'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
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
