'use client';

import React from 'react';
import {
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface EnglishFooterProps {
  onNavigate?: (navId: string) => void;
  onOpenTrackOrder?: () => void;
}

export const EnglishFooter: React.FC<EnglishFooterProps> = ({
  onNavigate,
  onOpenTrackOrder,
}) => {
  return (
    <footer className="w-full bg-[#100f0c] text-zinc-400 border-t border-[#262117] pt-12 pb-8 text-left font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Top Feature Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-[#161410] border border-[#2b2418]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#282215] text-[#E5A913]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">100% Genuine Books</h4>
              <span className="text-[11px] text-zinc-500">Original publishers only</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#282215] text-[#E5A913]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Nationwide Shipping</h4>
              <span className="text-[11px] text-zinc-500">Fast doorstep delivery</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#282215] text-[#E5A913]">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">7-Day Replacement</h4>
              <span className="text-[11px] text-zinc-500">Hassle-free guarantee</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#282215] text-[#E5A913]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Cash on Delivery</h4>
              <span className="text-[11px] text-zinc-500">Pay upon parcel arrival</span>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E5A913] via-[#ffc633] to-[#e5a913] p-0.5 shadow-md overflow-hidden shrink-0">
                <img
                  src="/images/logo.jpg"
                  alt="Shesher Pata Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="font-serif text-lg font-bold text-white">
                SHESHER PATA BOOKS
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              An independent sanctuary for passionate book lovers. Bringing you curated world literature,
              bestselling fiction, thought-provoking non-fiction, and artisan stationery across Bangladesh.
            </p>

            <div className="space-y-1.5 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E5A913]" />
                <span>+880 1700-000000 / +880 1900-000000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#E5A913]" />
                <span>orders@shesherpata.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#E5A913]" />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('home')}
                  className="hover:text-[#E5A913] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('books')}
                  className="hover:text-[#E5A913] transition-colors cursor-pointer"
                >
                  All Books Catalog
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('novel')}
                  className="hover:text-[#E5A913] transition-colors cursor-pointer"
                >
                  Contemporary Fiction
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('thriller')}
                  className="hover:text-[#E5A913] transition-colors cursor-pointer"
                >
                  Mystery & Suspense
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('authors')}
                  className="hover:text-[#E5A913] transition-colors cursor-pointer"
                >
                  Featured Authors
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={onOpenTrackOrder}
                  className="hover:text-[#E5A913] transition-colors cursor-pointer"
                >
                  Track Your Order
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('contact')}
                  className="hover:text-[#E5A913] transition-colors cursor-pointer"
                >
                  Help & Contact
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('about')}
                  className="hover:text-[#E5A913] transition-colors cursor-pointer"
                >
                  About Our Bookstore
                </button>
              </li>
              <li>
                <span className="text-zinc-500">Delivery Information</span>
              </li>
              <li>
                <span className="text-zinc-500">Return & Refund Policy</span>
              </li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Secure Payments
            </h4>
            <p className="text-xs text-zinc-500">
              We support Cash on Delivery and encrypted mobile & card payments.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-md bg-[#252017] border border-[#3b3425] text-[10px] font-bold text-white">
                Cash On Delivery
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#E2136E]/20 border border-[#E2136E]/40 text-[10px] font-bold text-pink-400">
                bKash
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#F7931E]/20 border border-[#F7931E]/40 text-[10px] font-bold text-amber-400">
                Nagad
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#252017] border border-[#3b3425] text-[10px] font-bold text-zinc-300">
                Visa / Master
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#221e14] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Shesher Pata Books. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Crafted for passionate readers across Bangladesh</span>
            <Heart className="w-3.5 h-3.5 text-[#E5A913] fill-[#E5A913]" />
          </p>
        </div>
      </div>
    </footer>
  );
};
