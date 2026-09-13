'use client';

import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, BookOpen, ShieldCheck, Heart } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onNavigate: (navId: string) => void;
  onOpenTrackOrder: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenTrackOrder }) => {
  return (
    <footer className="bg-[#111113] text-zinc-300 border-t border-zinc-800 pt-12 pb-24 lg:pb-12 mt-16 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Feature Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-zinc-800/80">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#F59E0B] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">১০০% আসল বই</h4>
              <p className="text-xs text-zinc-400 mt-0.5">সব বই সরাসরি নির্ভরযোগ্য প্রকাশনী থেকে সংগৃহীত</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#F59E0B] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">নিরাপদ পেমেন্ট</h4>
              <p className="text-xs text-zinc-400 mt-0.5">ক্যাশ অন ডেলিভারি, বিকাশ ও কার্ড পেমেন্ট</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#F59E0B] flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white"> সার্বক্ষণিক হেল্পলাইন</h4>
              <p className="text-xs text-zinc-400 mt-0.5">০১৭০০-০০০০০০ (সকাল ৯টা - রাত ১০টা)</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#F59E0B] flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">সহজ রিটার্ন পলিসি</h4>
              <p className="text-xs text-zinc-400 mt-0.5">ত্রুটিপূর্ণ বইয়ে ৭ দিনের মধ্যে বিনা খরচে রিটার্ন</p>
            </div>
          </div>
        </div>

        {/* 4 Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 py-12 border-b border-zinc-800/80">
          {/* Brand Info & Mission */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo variant="dark" size="lg" onClick={() => onNavigate('home')} />
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pr-4">
              "বইয়ের পাতায় খুঁজে নিন আপনার গল্প।" — শেষের পাতা বাংলাদেশের পাঠকদের জন্য একটি নান্দনিক ও বিশ্বস্ত অনলাইন বইয়ের বিপণি। ক্লাসিক থেকে সমকালীন, আপনার প্রিয় বই পৌঁছে যাবে আপনার দরজায়।
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-zinc-800/80 hover:bg-[#1877F2] text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="ফেসবুক"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-zinc-800/80 hover:bg-[#E4405F] text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="ইনস্টাগ্রাম"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-zinc-800/80 hover:bg-[#FF0000] text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="ইউটিউব"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 1: শেষের পাতা */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-['Noto_Sans_Bengali']">
              শেষের পাতা
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-amber-400 transition-colors"
                >
                  আমাদের সম্পর্কে
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-amber-400 transition-colors"
                >
                  যোগাযোগ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-amber-400 transition-colors"
                >
                  ক্যারিয়ার
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('authors')}
                  className="hover:text-amber-400 transition-colors"
                >
                  লেখক তালিকা
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: গ্রাহক সেবা */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-['Noto_Sans_Bengali']">
              গ্রাহক সেবা
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-amber-400 transition-colors"
                >
                  সাহায্য কেন্দ্র
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTrackOrder}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <span>অর্ডার ট্র্যাক করুন</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">লাইভ</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-amber-400 transition-colors"
                >
                  রিটার্ন ও রিফান্ড পলিসি
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-amber-400 transition-colors"
                >
                  ডেলিভারি তথ্য ও চার্জ
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: যোগাযোগ ও ঠিকানা */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-['Noto_Sans_Bengali']">
              যোগাযোগ
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>কাঁটাবন বইয়ের মার্কেট, নিউ এলিফ্যান্ট রোড, ঢাকা-১২০৫, বাংলাদেশ</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+৮৮০ ১৭০০-০০০০০০</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>support@shesherpata.com</span>
              </div>
            </div>

            {/* Google Play App badge representation */}
            <div className="pt-2">
              <span className="text-[11px] text-zinc-500 block mb-1">আমাদের মোবাইল অ্যাপ</span>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors cursor-pointer">
                <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500 rounded-sm flex items-center justify-center text-white text-[10px] font-bold">
                  ▶
                </div>
                <div className="text-left leading-tight">
                  <span className="text-[9px] text-zinc-400 uppercase block">GET IT ON</span>
                  <span className="text-xs font-bold text-white">Google Play</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods & Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-zinc-400 text-xs mr-2">নিরাপদ পেমেন্ট পার্টনার:</span>
            <span className="px-2.5 py-1 rounded bg-[#E2136E] text-white font-bold text-[11px]">
              বিকাশ
            </span>
            <span className="px-2.5 py-1 rounded bg-[#F7941D] text-white font-bold text-[11px]">
              নগদ
            </span>
            <span className="px-2.5 py-1 rounded bg-blue-700 text-white font-bold text-[11px]">
              VISA
            </span>
            <span className="px-2.5 py-1 rounded bg-[#EB001B] text-white font-bold text-[11px]">
              MasterCard
            </span>
            <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 font-semibold text-[11px]">
              ক্যাশ অন ডেলিভারি
            </span>
          </div>

          <p className="text-center md:text-right">
            © ২০২৬ শেষের পাতা। সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </div>
    </footer>
  );
};
