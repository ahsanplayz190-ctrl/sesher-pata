import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BOOKS } from '../../../src/data/books';
import { Book } from '../../../src/types';
import BookDetailClient from './BookDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const book = BOOKS.find((b) => b.id === id);

  if (!book) {
    return {
      title: 'বই পাওয়া যায়নি — শেষের পাতা',
    };
  }

  return {
    title: `${book.title} — ${book.author} | শেষের পাতা`,
    description: book.description.substring(0, 160),
    openGraph: {
      title: `${book.title} — ${book.author}`,
      description: book.description,
      images: [
        {
          url: book.image,
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
  const book = BOOKS.find((b) => b.id === id);

  if (!book) {
    notFound();
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
    image: book.image,
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
      <BookDetailClient book={book} allBooks={BOOKS} />
    </>
  );
}
