'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, ShoppingBag, Heart, MapPin, LogIn, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { trackCompleteRegistration } from '../utils/metaPixel';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrders: () => void;
  onOpenWishlist: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onOpenOrders,
  onOpenWishlist,
}) => {
  const { showToast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim()) {
      setIsLoggedIn(true);
      trackCompleteRegistration(phone.trim(), 'phone');
      showToast('লগইন সফল হয়েছে! স্বাগতম শেষের পাতায়।', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 p-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {isLoggedIn ? (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-900 flex items-center justify-center mx-auto">
              <User className="w-8 h-8 text-amber-700" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-zinc-900">{name || 'সম্মানিত পাঠক'}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">{phone || '০১৭০০-১২২৩৩৪'}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                প্রিমিয়াম পাঠক ক্লাব সদস্য
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-100 text-left text-xs">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWishlist();
                }}
                className="w-full p-3 rounded-xl border border-zinc-200 hover:bg-amber-50/50 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-zinc-700">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>সংরক্ষিত পছন্দের বই</span>
                </div>
                <span className="text-zinc-400">➔</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOrders();
                }}
                className="w-full p-3 rounded-xl border border-zinc-200 hover:bg-amber-50/50 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-zinc-700">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  <span>অর্ডার ইতিহাস ও ট্র্যাক</span>
                </div>
                <span className="text-zinc-400">➔</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsLoggedIn(false);
                showToast('লগআউট করা হয়েছে', 'info');
              }}
              className="text-xs text-rose-600 hover:underline cursor-pointer pt-2"
            >
              লগআউট করুন
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-900 flex items-center justify-center mx-auto mb-2">
                <LogIn className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">লগইন / সাইন আপ</h3>
              <p className="text-xs text-zinc-500">আপনার ফোন নম্বর দিয়ে সহজে লগইন করুন</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">আপনার নাম (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: অনির্বাণ ভট্টাচার্য"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-zinc-50 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">মোবাইল নম্বর</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-zinc-50 focus:bg-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-sm transition-all cursor-pointer mt-2"
              >
                ওটিপি পাঠান / লগইন করুন
              </button>
            </form>

            <p className="text-[11px] text-zinc-400 text-center">
              লগইন করার মাধ্যমে আপনি শেষের পাতার শর্তাবলীতে সম্মতি জানাচ্ছেন।
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
