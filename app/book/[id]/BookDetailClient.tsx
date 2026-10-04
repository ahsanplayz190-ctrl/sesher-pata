'use client';

import React, { useState } from 'react';
import { Book } from '../../../src/types';
import { Header } from '../../../src/components/Header';
import { Footer } from '../../../src/components/Footer';
import { ProductDetailsModal } from '../../../src/components/ProductDetailsModal';
import { CartDrawer } from '../../../src/components/CartDrawer';
import { WishlistDrawer } from '../../../src/components/WishlistDrawer';
import { CheckoutModal } from '../../../src/components/CheckoutModal';
import { TrackOrderModal } from '../../../src/components/TrackOrderModal';
import { AccountModal } from '../../../src/components/AccountModal';
import { useCart } from '../../../src/context/CartContext';
import { useToast } from '../../../src/context/ToastContext';
import { useRouter } from 'next/navigation';
import { trackSearch } from '../../../src/utils/metaPixel';
import { useData } from '../../../src/context/DataContext';

interface BookDetailClientProps {
  book: Book;
  allBooks: Book[];
}

export default function BookDetailClient({ book, allBooks }: BookDetailClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const { books } = useData();

  // Pick live real-time book from DataContext so admin stock adjustments take immediate effect
  const liveBook = books.find((b) => b.id === book.id) || book;
  const liveAllBooks = books && books.length > 0 ? books : allBooks;

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFDF9] text-zinc-900 font-['Noto_Sans_Bengali']">
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

      <main className="flex-1 py-8">
        <ProductDetailsModal
          book={liveBook}
          allBooks={liveAllBooks}
          onClose={() => router.push('/')}
          onSelectBook={(b) => router.push(`/book/${b.id}`)}
          onBuyNow={(b, qty) => {
            addToCart(b, qty);
            setIsCheckoutOpen(true);
          }}
        />
      </main>

      <Footer
        onNavigate={() => router.push('/')}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
      />

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
