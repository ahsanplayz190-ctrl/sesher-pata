'use client';

import React, { ReactNode } from 'react';
import { ToastProvider } from './ToastContext';
import { DataProvider } from './DataContext';
import { WishlistProvider } from './WishlistContext';
import { CartProvider } from './CartContext';
import { LanguageProvider } from './LanguageContext';
import { MetaPixelTracker } from '../components/MetaPixelTracker';

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <LanguageProvider>
      <ToastProvider>
        <DataProvider>
          <WishlistProvider>
            <CartProvider>
              <MetaPixelTracker />
              {children}
            </CartProvider>
          </WishlistProvider>
        </DataProvider>
      </ToastProvider>
    </LanguageProvider>
  );
};
