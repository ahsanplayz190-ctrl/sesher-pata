'use client';

import React, { useState } from 'react';
import { Book } from '../../../src/types';
import { Header } from '../../../src/components/Header';
import { Footer } from '../../../src/components/Footer';
import { EnglishHeader } from '../../../src/components/english/EnglishHeader';
import { EnglishFooter } from '../../../src/components/english/EnglishFooter';
import { ProductDetailsModal } from '../../../src/components/ProductDetailsModal';
import { CartDrawer } from '../../../src/components/CartDrawer';
import { WishlistDrawer } from '../../../src/components/WishlistDrawer';
import { CheckoutModal } from '../../../src/components/CheckoutModal';
import { TrackOrderModal } from '../../../src/components/TrackOrderModal';
import { AccountModal } from '../../../src/components/AccountModal';
import { useCart } from '../../../src/context/CartContext';
import { useToast } from '../../../src/context/ToastContext';
import { useLanguage } from '../../../src/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { trackSearch } from '../../../src/utils/metaPixel';

interface BookDetailClientProps {
  book: Book;
  allBooks: Book[];
}

export default function BookDetailClient({ book, allBooks }: BookDetailClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const { language } = useLanguage();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col ${language === 'en' ? 'bg-[#12110e] text-zinc-100' : 'bg-[#FEFDF9] text-zinc-900'}`}>
      {language === 'bn' ? (
        <Header
          currentNav="books"
          onNavigate={(navId) => {
            if (navId === 'home') {
              router.push('/');
            } else {
              router.push('/' + (navId === 'books' ? '' : navId));
            }
          }}
          onSearchSubmit={(query) => {
            if (query?.trim()) trackSearch(query.trim());
            router.push('/');
          }}
          onSelectBook={(selectedBook) => router.push(`/book/${selectedBook.id}`)}
          onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
        />
      ) : (
        <EnglishHeader
          currentNav="books"
          onNavigate={(navId) => {
            if (navId === 'home') {
              router.push('/');
            } else {
              router.push('/' + (navId === 'books' ? '' : navId));
            }
          }}
          onSearchSubmit={(query) => {
            if (query?.trim()) trackSearch(query.trim());
            router.push('/');
          }}
          onSelectBook={(selectedBook) => router.push(`/book/${selectedBook.id}`)}
          onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
        />
      )}

      <main className="flex-1 py-8">
        <ProductDetailsModal
          book={book}
          allBooks={allBooks}
          onClose={() => router.push('/')}
          onSelectBook={(b) => router.push(`/book/${b.id}`)}
          onBuyNow={(b, qty) => {
            addToCart(b, qty);
            setIsCheckoutOpen(true);
          }}
        />
      </main>

      {language === 'bn' ? (
        <Footer
          onNavigate={() => router.push('/')}
          onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        />
      ) : (
        <EnglishFooter
          onNavigate={() => router.push('/')}
          onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        />
      )}

      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onExploreBooks={() => router.push('/')}
      />

      <WishlistDrawer
        onExploreBooks={() => router.push('/')}
        onOpenDetails={(b) => router.push(`/book/${b.id}`)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={() => showToast('আপনার অর্ডারটি গ্রহণ করা হয়েছে!', 'success')}
      />

      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onOpenOrders={() => setIsTrackOrderOpen(true)}
        onOpenWishlist={() => {}}
      />
    </div>
  );
}
