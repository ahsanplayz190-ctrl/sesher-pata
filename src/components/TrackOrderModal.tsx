'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import { toBengaliNumber } from '../utils/formatters';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [tracked, setTracked] = useState(false);

  if (!isOpen) return null;

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setTracked(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 p-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-900 flex items-center justify-center">
            <Truck className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900">অর্ডার ট্র্যাক করুন</h3>
            <p className="text-xs text-zinc-500">আপনার অর্ডার নম্বর বা ফোন নম্বর দিয়ে স্থিতি জানুন</p>
          </div>
        </div>

        <form onSubmit={handleTrack} className="flex gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="অর্ডার নম্বর (যেমন: SP-2026-89421)"
            className="flex-1 px-3.5 py-2 rounded-xl border border-zinc-300 text-xs sm:text-sm bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>খুঁজুন</span>
          </button>
        </form>

        {tracked ? (
          <div className="space-y-4 pt-2 border-t border-zinc-100">
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex justify-between items-center text-xs">
              <div>
                <span className="text-zinc-500 block">অর্ডার আইডি:</span>
                <span className="font-bold text-zinc-900">{query.toUpperCase()}</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                কুরিয়ারে হস্তান্তর হয়েছে
              </span>
            </div>

            {/* Tracking Milestones */}
            <div className="space-y-4 pl-2 text-xs">
              <div className="flex items-start gap-3 relative">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900">অর্ডার গ্রহণ করা হয়েছে</h4>
                  <p className="text-zinc-500 text-[11px]">গতকাল, বিকেল ৪:২০</p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Package className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900">প্যাকেজিং সম্পন্ন ও সুরক্ষিত বাঁধাই</h4>
                  <p className="text-zinc-500 text-[11px]">আজ, সকাল ১০:১৫</p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 animate-pulse">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900">কুরিয়ার ডেলিভারি রাইডারের পথে</h4>
                  <p className="text-zinc-500 text-[11px]">আজ, দুপুর ১:০০ • পেপারফ্লাই / রেডএক্স</p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative opacity-50">
                <div className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-500 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-700">বই ডেলিভারি সম্পন্ন হবে</h4>
                  <p className="text-zinc-500 text-[11px]">আনুমানিক: আগামী ২৪-৪৮ ঘণ্টার মধ্যে</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-zinc-400 text-xs">
            <Package className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
            <p>আপনার অর্ডার নম্বর দিয়ে ট্র্যাক করুন</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
