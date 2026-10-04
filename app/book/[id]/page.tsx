import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BOOKS } from '../../../src/data/books';
import { Book } from '../../../src/types';
import { getServerSupabaseClient } from '../../../src/lib/serverSupabase';
import { rowToBook } from '../../../src/services/bookService';
import BookDetailClient from './BookDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchBook(id: string): Promise<Book | null> {
  const supabase = getServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error) {
        if (data) return rowToBook(data);
        // Explicitly not found in central database (e.g. deleted by admin)
        return null;
      }
    } catch (err) {
      console.warn(`[BookPage] Supabase fetch error for id ${id}:`, err);
    }
  }

  // Fallback to static catalog only if Supabase client is completely unavailable/offline
  return BOOKS.find((b) => b.id === id) || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const book = await fetchBook(id);

  if (!book) {
    return {
      title: 'বইয়ের বিবরণ — শেষের পাতা',
    };
  }

  return {
    title: `${book.title} — ${book.author} | শেষের পাতা`,
    description: (book.description || '').substring(0, 160),
    openGraph: {
      title: `${book.title} — ${book.author}`,
      description: book.description || '',
      images: [
        {
          url: book.image || book.cover_image || '',
          width: 800,
          height: 1000,
          alt: book.title,
        },
      ],
    },
  };
}

export default async function BookPage({ params }: PageProps) {
  const { id } = await params;
  const book = await fetchBook(id);

  if (!book) {
    notFound();
  }

  // Fetch all books for related recommendations
  let allBooks: Book[] = BOOKS;
  const supabase = getServerSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase.from('books').select('*').limit(30);
      if (data && data.length > 0) {
        allBooks = data.map(rowToBook);
      }
    } catch {
      // Fallback to BOOKS
    }
  }

  // JSON-LD structured data for Google Books Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: {
      '@type': 'Person',
      name: book.author,
    },
    publisher: {
      '@type': 'Organization',
      name: book.publisher,
    },
    image: book.image || book.cover_image,
    isbn: book.isbn,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: book.price,
      availability: book.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BookDetailClient book={book} allBooks={allBooks} />
    </>
  );
}
