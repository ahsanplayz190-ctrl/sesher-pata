'use client';

import React, { ReactNode } from 'react';
import { ToastProvider } from './ToastContext';
import { WishlistProvider } from './WishlistContext';
import { CartProvider } from './CartContext';

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
      <WishlistProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </WishlistProvider>
    </ToastProvider>
  );
};
