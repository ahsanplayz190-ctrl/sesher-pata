'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, CartItem } from '../types';
import { useToast } from './ToastContext';
import { trackAddToCart } from '../utils/metaPixel';

interface CartContextType {
  cart: CartItem[];
  addToCart: (book: Book, quantity?: number) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  discountAmount: number;
  couponCode: string;
  couponDiscountPercentage: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  deliveryOption: 'inside_dhaka' | 'outside_dhaka';
  setDeliveryOption: (option: 'inside_dhaka' | 'outside_dhaka') => void;
  deliveryFee: number;
  grandTotal: number;
  totalItemsCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'shesher_pata_cart_items';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const [couponCode, setCouponCode] = useState<string>('');
  const [couponDiscountPercentage, setCouponDiscountPercentage] = useState<number>(0);
  const [deliveryOption, setDeliveryOption] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Read initial cart on client mount to prevent SSR hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save cart changes to localStorage after mounting
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart, isMounted]);

  const addToCart = (book: Book, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.book.id === book.id);
      if (existing) {
        return prev.map((item) =>
          item.book.id === book.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { book, quantity }];
    });

    showToast(`"${book.title}" বইটি কার্টে যোগ হয়েছে ✓`, 'success');
    trackAddToCart(book, quantity);
  };

  const removeFromCart = (bookId: string) => {
    const item = cart.find((i) => i.book.id === bookId);
    setCart((prev) => prev.filter((item) => item.book.id !== bookId));
    if (item) {
      showToast(`"${item.book.title}" কার্ট থেকে সরানো হয়েছে`, 'info');
    }
  };

  const updateQuantity = (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.book.id === bookId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyCoupon = (code: string): boolean => {
    const normalized = code.trim().toUpperCase();
    if (normalized === 'SHESHER10' || normalized === 'BOI10') {
      setCouponCode(normalized);
      setCouponDiscountPercentage(10);
      showToast('১০% স্পেশাল কুপন ডিসকাউন্ট প্রয়োগ করা হয়েছে! 🎉', 'success');
      return true;
    } else if (normalized === 'BOIMELA20') {
      setCouponCode(normalized);
      setCouponDiscountPercentage(20);
      showToast('বইমেলা বিশেষ ২০% কুপন ডিসকাউন্ট প্রয়োগ হয়েছে! 🎉', 'success');
      return true;
    } else {
      showToast('দুঃখিত! কুপন কোডটি সঠিক নয়।', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscountPercentage(0);
    showToast('কুপন কোড সরানো হয়েছে', 'info');
  };

  // Subtotal calculated with current book price
  const subtotal = cart.reduce((acc, item) => acc + item.book.price * item.quantity, 0);

  // Additional coupon discount
  const discountAmount = Math.round((subtotal * couponDiscountPercentage) / 100);

  // Delivery fee: ৳60 inside Dhaka, ৳120 outside Dhaka (free if subtotal > 1500)
  const isFreeDelivery = subtotal >= 1500;
  const deliveryFee = cart.length === 0 ? 0 : isFreeDelivery ? 0 : deliveryOption === 'inside_dhaka' ? 60 : 120;

  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        discountAmount,
        couponCode,
        couponDiscountPercentage,
        applyCoupon,
        removeCoupon,
        deliveryOption,
        setDeliveryOption,
        deliveryFee,
        grandTotal,
        totalItemsCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
