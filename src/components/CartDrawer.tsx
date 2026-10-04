'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, toBengaliNumber } from '../utils/formatters';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onExploreBooks: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onExploreBooks,
}) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    couponCode,
    applyCoupon,
    removeCoupon,
    deliveryOption,
    setDeliveryOption,
    deliveryFee,
    insideDhakaFee,
    outsideDhakaFee,
    grandTotal,
    totalItemsCount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      applyCoupon(inputCoupon);
      setInputCoupon('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-[#FAF8F4]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 leading-tight">
                  আপনার শপিং কার্ট
                </h2>
                <span className="text-xs text-zinc-500">
                  {toBengaliNumber(totalItemsCount)} টি বই নির্বাচিত • শেষের পাতা
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="কার্ট বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              /* Empty Cart State */
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 mb-2">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-zinc-800">
                  আপনার কার্ট এখনো খালি
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 max-w-xs leading-relaxed">
                  পছন্দের বইগুলো কার্টে যোগ করে সহজেই অর্ডার সম্পন্ন করুন। বইয়ের পাতায় খুঁজে নিন আপনার গল্প।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    onExploreBooks();
                  }}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-zinc-950 font-bold text-sm transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  বই দেখুন
                </button>
              </div>
            ) : (
              /* Cart Items List */
              <div className="space-y-3.5">
                {cart.map((item) => (
                  <div
                    key={item.book.id}
                    className="p-3 bg-zinc-50/70 border border-zinc-200/80 rounded-2xl flex gap-3 items-center group"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                      <img
                        src={item.book.image}
                        alt={item.book.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                        {item.book.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 truncate">{item.book.author}</p>
                      <div className="text-xs font-extrabold text-amber-800 mt-1">
                        {formatPrice(item.book.price)}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-zinc-300 rounded-lg bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                            className="p-1 hover:bg-zinc-100 text-zinc-600 rounded-l cursor-pointer"
                            aria-label="কমান"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-zinc-900">
                            {toBengaliNumber(item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                            disabled={item.book.stock !== undefined && item.quantity >= item.book.stock}
                            className="p-1 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-600 rounded-r cursor-pointer"
                            aria-label="বাড়ান"
                            title={item.book.stock !== undefined && item.quantity >= item.book.stock ? 'সর্বোচ্চ স্টক সংখ্যায় পৌঁছে গেছে' : '১ বাড়ান'}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.book.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Delivery Option Toggle */}
                <div className="p-3.5 bg-amber-50/50 border border-amber-200/60 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-zinc-800 block">
                    ডেলিভারি এরিয়া নির্বাচন করুন:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label
                      onClick={() => setDeliveryOption('inside_dhaka')}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        deliveryOption === 'inside_dhaka'
                          ? 'border-amber-500 bg-white font-bold text-amber-900 shadow-2xs'
                          : 'border-zinc-200 bg-white/60 text-zinc-600 hover:bg-white'
                      }`}
                    >
                      <span>ঢাকা শহরের ভিতরে</span>
                      <span className="text-[11px] text-zinc-500 font-semibold">{formatPrice(insideDhakaFee)} (২-৩ দিন)</span>
                    </label>

                    <label
                      onClick={() => setDeliveryOption('outside_dhaka')}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        deliveryOption === 'outside_dhaka'
                          ? 'border-amber-500 bg-white font-bold text-amber-900 shadow-2xs'
                          : 'border-zinc-200 bg-white/60 text-zinc-600 hover:bg-white'
                      }`}
                    >
                      <span>ঢাকার বাইরে</span>
                      <span className="text-[11px] text-zinc-500 font-semibold">{formatPrice(outsideDhakaFee)} (৩-৫ দিন)</span>
                    </label>
                  </div>
                </div>

                {/* Promo Code Box */}
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  {couponCode ? (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <Tag className="w-3.5 h-3.5" />
                        <span>কুপন '{couponCode}' প্রয়োগ করা হয়েছে! (-{formatPrice(discountAmount)})</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
                      >
                        বাতিল
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={inputCoupon}
                        onChange={(e) => setInputCoupon(e.target.value)}
                        placeholder="কুপন কোড (যেমন: SHESHER10)"
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-zinc-300 bg-white outline-none focus:border-amber-500 uppercase"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-[#18181B] text-white text-xs font-semibold rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        প্রয়োগ
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-zinc-200 bg-white space-y-3 shadow-lg">
              <div className="space-y-1.5 text-xs sm:text-sm text-zinc-600">
                <div className="flex justify-between">
                  <span>সাবটোটাল</span>
                  <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>কুপন ছাড়</span>
                    <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="font-semibold text-zinc-900">{formatPrice(deliveryFee)}</span>
                </div>
                <div className="pt-2 border-t border-zinc-200 flex justify-between text-base font-extrabold text-zinc-950">
                  <span>সর্বমোট প্রদেয়</span>
                  <span className="text-amber-800">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#E5A913] hover:bg-[#D99600] text-zinc-950 font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
              >
                <span>অর্ডার সম্পন্ন করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>শেষের পাতা — ১০০% নিরাপদ ও বিশ্বস্ত পেমেন্ট</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
