'use client';

import React from 'react';
import { Home, Grid, ShoppingBag, Heart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toBengaliNumber } from '../utils/formatters';

interface MobileBottomNavProps {
  currentNav: string;
  onNavigate: (navId: string) => void;
  onOpenAccount: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentNav,
  onNavigate,
  onOpenAccount,
}) => {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { wishlist, setIsWishlistOpen } = useWishlist();

  const navItems = [
    {
      id: 'home',
      label: 'হোম',
      icon: Home,
      action: () => onNavigate('home'),
      isActive: currentNav === 'home',
    },
    {
      id: 'categories',
      label: 'ক্যাটাগরি',
      icon: Grid,
      action: () => onNavigate('categories'),
      isActive: currentNav === 'categories',
    },
    {
      id: 'cart',
      label: 'কার্ট',
      icon: ShoppingBag,
      action: () => setIsCartOpen(true),
      badge: totalItemsCount > 0 ? toBengaliNumber(totalItemsCount) : undefined,
      isActive: false,
    },
    {
      id: 'wishlist',
      label: 'উইশলিস্ট',
      icon: Heart,
      action: () => setIsWishlistOpen(true),
      badge: wishlist.length > 0 ? toBengaliNumber(wishlist.length) : undefined,
      isActive: false,
    },
    {
      id: 'account',
      label: 'অ্যাকাউন্ট',
      icon: User,
      action: onOpenAccount,
      isActive: false,
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all select-none cursor-pointer ${
                item.isActive ? 'text-[#D97706]' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    item.isActive ? 'scale-110 stroke-[2.4]' : 'scale-100'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#F59E0B] text-zinc-950 text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-0.5 ${item.isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>

              {item.isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
