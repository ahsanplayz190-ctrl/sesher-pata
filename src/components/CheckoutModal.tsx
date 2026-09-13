'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, ShieldCheck, Truck, CreditCard, Banknote, Smartphone, ArrowRight, Printer, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, toBengaliNumber } from '../utils/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: () => void;
}

const DISTRICTS = [
  'ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ',
  'কুমিল্লা', 'গাজীপুর', 'নারায়ণগঞ্জ', 'বগুড়া', 'দিনাজপুর', 'ফরিদপুর', 'যশোর', 'কুষ্টিয়া'
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const {
    cart,
    clearCart,
    subtotal,
    discountAmount,
    couponCode,
    deliveryOption,
    setDeliveryOption,
    deliveryFee,
    grandTotal,
  } = useCart();

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [thana, setThana] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'card'>('cod');
  const [orderNotes, setOrderNotes] = useState('');

  // Order Complete State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setFormError('দয়া করে আপনার নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা প্রদান করুন।');
      return;
    }

    if (phone.trim().length < 11) {
      setFormError('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01700000000)');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    // Simulate order placement
    setTimeout(() => {
      const orderId = `SP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setCompletedOrderId(orderId);
      setIsSubmitting(false);
      clearCart();
      onOrderSuccess();
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 my-auto max-h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-[#FAF8F4]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 leading-tight">
                শেষের পাতা — নিরাপদ অর্ডার
              </h2>
              <span className="text-xs text-zinc-500">
                ক্যাশ অন ডেলিভারি ও ডিজিটাল পেমেন্ট সুবিধা
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6">
          {completedOrderId ? (
            /* Order Success View */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-10 h-10 stroke-[2]" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  অর্ডার সফলভাবে গ্রহণ করা হয়েছে
                </span>
                <h3 className="text-2xl font-black text-zinc-900 mt-2 font-['Noto_Sans_Bengali']">
                  ধন্যবাদ, {name}!
                </h3>
                <p className="text-sm text-zinc-600 mt-1 max-w-md mx-auto">
                  আপনার অর্ডার নম্বর: <strong className="text-amber-800 font-mono text-base">{completedOrderId}</strong>।
                  আমাদের প্রতিনিধি দ্রুত আপনার সাথে ফোনে যোগাযোগ করবেন।
                </p>
              </div>

              {/* Order summary invoice receipt */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#FAF8F4] border border-zinc-200 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-zinc-200/80 pb-2">
                  <span className="text-zinc-500">গ্রাহকের নাম:</span>
                  <span className="font-semibold text-zinc-900">{name}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200/80 pb-2">
                  <span className="text-zinc-500">মোবাইল নম্বর:</span>
                  <span className="font-semibold text-zinc-900">{phone}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200/80 pb-2">
                  <span className="text-zinc-500">ডেলিভারি ঠিকানা:</span>
                  <span className="font-semibold text-zinc-900 text-right max-w-[240px]">{address}, {thana}, {district}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200/80 pb-2">
                  <span className="text-zinc-500">পেমেন্ট মেথড:</span>
                  <span className="font-semibold text-zinc-900">
                    {paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (বই পেয়ে টাকা পরিশোধ)' : paymentMethod === 'bkash' ? 'বিকাশ' : paymentMethod === 'nagad' ? 'নগদ' : 'কার্ড পেমেন্ট'}
                  </span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-bold text-zinc-950">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span className="text-amber-800">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>রসিদ প্রিন্ট করুন</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs sm:text-sm font-bold shadow-xs cursor-pointer active:scale-95"
                >
                  আরও বই দেখুন
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Column: Customer and Shipping Details */}
                <div className="md:col-span-7 space-y-4">
                  <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-600" />
                    <span>ডেলিভারি তথ্য</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">
                        আপনার পুরো নাম <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="যেমন: সাকিব আল হাসান"
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-zinc-700 mb-1">
                          মোবাইল নম্বর <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-zinc-700 mb-1">
                          ইমেইল এড্রেস (ঐচ্ছিক)
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="yourname@gmail.com"
                          className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">
                        সম্পূর্ণ ঠিকানা (বাসা/রোড/এলাকা) <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="যেমন: বাসা নং ১২, রোড নং ৪, ধানমন্ডি, ঢাকা"
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block font-semibold text-zinc-700 mb-1">জেলা</label>
                        <select
                          value={district}
                          onChange={(e) => {
                            setDistrict(e.target.value);
                            if (e.target.value === 'ঢাকা') {
                              setDeliveryOption('inside_dhaka');
                            } else {
                              setDeliveryOption('outside_dhaka');
                            }
                          }}
                          className="w-full px-2.5 py-2 rounded-xl border border-zinc-300 bg-zinc-50 focus:bg-white text-xs outline-none"
                        >
                          {DISTRICTS.map((dist) => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-zinc-700 mb-1">থানা / উপজেলা</label>
                        <input
                          type="text"
                          value={thana}
                          onChange={(e) => setThana(e.target.value)}
                          placeholder="যেমন: ধানমন্ডি"
                          className="w-full px-2.5 py-2 rounded-xl border border-zinc-300 bg-zinc-50 focus:bg-white text-xs outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-zinc-700 mb-1">পোস্ট কোড</label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="১২০৯"
                          className="w-full px-2.5 py-2 rounded-xl border border-zinc-300 bg-zinc-50 focus:bg-white text-xs outline-none"
                        />
                      </div>
                    </div>

                    {/* Delivery zone radio */}
                    <div className="pt-2">
                      <label className="block font-semibold text-zinc-700 mb-1.5">
                        ডেলিভারি এলাকা
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label
                          onClick={() => setDeliveryOption('inside_dhaka')}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                            deliveryOption === 'inside_dhaka'
                              ? 'border-amber-500 bg-amber-50/50 font-bold text-amber-950'
                              : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                          }`}
                        >
                          <span>ঢাকা সিটির ভিতরে</span>
                          <span className="text-zinc-500 font-semibold">৳৬০</span>
                        </label>

                        <label
                          onClick={() => setDeliveryOption('outside_dhaka')}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                            deliveryOption === 'outside_dhaka'
                              ? 'border-amber-500 bg-amber-50/50 font-bold text-amber-950'
                              : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                          }`}
                        >
                          <span>ঢাকার বাইরে</span>
                          <span className="text-zinc-500 font-semibold">৳১২০</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Payment & Order Summary */}
                <div className="md:col-span-5 space-y-4">
                  {/* Payment Options */}
                  <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    <span>পেমেন্ট পদ্ধতি নির্বাচন</span>
                  </h3>

                  <div className="space-y-2 text-xs">
                    <label
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-amber-500 bg-amber-50/60 font-bold text-zinc-900 shadow-xs'
                          : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block font-bold">ক্যাশ অন ডেলিভারি (COD)</span>
                        <span className="text-[11px] text-zinc-500 font-normal">বই হাতে পেয়ে মূল্য পরিশোধ করুন</span>
                      </div>
                    </label>

                    <label
                      onClick={() => setPaymentMethod('bkash')}
                      className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                        paymentMethod === 'bkash'
                          ? 'border-rose-500 bg-rose-50/50 font-bold text-zinc-900 shadow-xs'
                          : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 font-black text-xs">
                        বিকাশ
                      </div>
                      <div>
                        <span className="block font-bold">bKash (বিকাশ পেমেন্ট)</span>
                        <span className="text-[11px] text-zinc-500 font-normal">বিকাশ অ্যাপ/গেটওয়ে দিয়ে তাৎক্ষণিক পেমেন্ট</span>
                      </div>
                    </label>

                    <label
                      onClick={() => setPaymentMethod('nagad')}
                      className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                        paymentMethod === 'nagad'
                          ? 'border-orange-500 bg-orange-50/50 font-bold text-zinc-900 shadow-xs'
                          : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 font-black text-xs">
                        নগদ
                      </div>
                      <div>
                        <span className="block font-bold">Nagad (নগদ পেমেন্ট)</span>
                        <span className="text-[11px] text-zinc-500 font-normal">নগদ অ্যাকাউন্ট থেকে দ্রুত পেমেন্ট</span>
                      </div>
                    </label>

                    <label
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                        paymentMethod === 'card'
                          ? 'border-blue-500 bg-blue-50/50 font-bold text-zinc-900 shadow-xs'
                          : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block font-bold">ভিসা / মাস্টারকার্ড</span>
                        <span className="text-[11px] text-zinc-500 font-normal">যে কোনো ডেবিট বা ক্রেডিট কার্ড</span>
                      </div>
                    </label>
                  </div>

                  {/* Order Financials Summary */}
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
                    <span className="font-bold text-zinc-900 block pb-1 border-b border-zinc-200">
                      অর্ডার সামারি ({toBengaliNumber(cart.length)} টি বই)
                    </span>
                    <div className="flex justify-between text-zinc-600">
                      <span>সাবটোটাল</span>
                      <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>কুপন ছাড় ({couponCode})</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-zinc-600">
                      <span>ডেলিভারি চার্জ</span>
                      <span className="font-semibold text-zinc-900">{formatPrice(deliveryFee)}</span>
                    </div>
                    <div className="pt-2 border-t border-zinc-200 flex justify-between text-sm font-extrabold text-zinc-950">
                      <span>সর্বমোট</span>
                      <span className="text-amber-800 text-base">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || cart.length === 0}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-zinc-950 font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 active:scale-98"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>অর্ডার নিশ্চিত করুন</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
