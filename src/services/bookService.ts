import { Book } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BOOKS as INITIAL_BOOKS } from '../data/books';

export const BOOKS_STORAGE_KEY = 'shesher_pata_books_v1';
export const BOOKS_CHANGED_EVENT = 'shesher_pata_books_changed';

/**
 * Convert database row to frontend Book model.
 * Handles both snake_case and camelCase, as well as field aliases.
 */
export function rowToBook(row: any): Book {
  const banglaName = row.bangla_name || row.title_bn || row.title || '';
  const englishName = row.english_name || '';
  const title = banglaName || englishName || row.title || '';

  const price = row.price !== undefined && row.price !== null ? Number(row.price) : 0;
  const originalPrice =
    row.original_price !== undefined && row.original_price !== null
      ? Number(row.original_price)
      : row.old_price !== undefined && row.old_price !== null
      ? Number(row.old_price)
      : price;

  const oldPrice =
    row.old_price !== undefined && row.old_price !== null
      ? Number(row.old_price)
      : originalPrice;

  let tagsArray: string[] = [];
  if (Array.isArray(row.tags)) {
    tagsArray = row.tags;
  } else if (typeof row.tags === 'string') {
    try {
      const parsed = JSON.parse(row.tags);
      tagsArray = Array.isArray(parsed) ? parsed : [row.tags];
    } catch {
      tagsArray = row.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
  }

  let sectionIdsArray: string[] = ['new-arrivals'];
  if (Array.isArray(row.section_ids)) {
    sectionIdsArray = row.section_ids;
  } else if (Array.isArray(row.sectionIds)) {
    sectionIdsArray = row.sectionIds;
  } else if (typeof row.section_ids === 'string') {
    try {
      const parsed = JSON.parse(row.section_ids);
      sectionIdsArray = Array.isArray(parsed) ? parsed : [row.section_ids];
    } catch {
      sectionIdsArray = [row.section_ids];
    }
  }

  let galleryArray: string[] = [];
  if (Array.isArray(row.gallery)) {
    galleryArray = row.gallery;
  } else if (typeof row.gallery === 'string') {
    try {
      const parsed = JSON.parse(row.gallery);
      if (Array.isArray(parsed)) galleryArray = parsed;
    } catch {
      // ignore
    }
  }

  return {
    id: String(row.id),
    title,
    title_bn: banglaName,
    bangla_name: banglaName,
    english_name: englishName,
    author: row.author || '',
    publisher: row.publisher || 'বাতিঘর',
    category: row.category || 'উপন্যাস',
    description: row.description || '',
    description_bn: row.description_bn || row.description || '',
    image: row.image || row.cover_image || '',
    cover_image: row.cover_image || row.image || '',
    banner_image: row.banner_image || '',
    pdf_url: row.pdf_url || '',
    gallery: galleryArray,
    price,
    originalPrice,
    old_price: oldPrice,
    discount: row.discount !== undefined && row.discount !== null ? Number(row.discount) : 0,
    rating: row.rating !== undefined && row.rating !== null ? Number(row.rating) : 5.0,
    reviewCount:
      row.review_count !== undefined && row.review_count !== null
        ? Number(row.review_count)
        : row.reviewCount || 0,
    stock: row.stock !== undefined && row.stock !== null ? Number(row.stock) : 0,
    isbn: row.isbn || '',
    pages: row.pages !== undefined && row.pages !== null ? Number(row.pages) : 0,
    edition: row.edition || '১ম সংস্করণ',
    language: row.language || 'বাংলা',
    tags: tagsArray,
    isBestseller: Boolean(row.is_bestseller ?? row.isBestseller),
    isNew: Boolean(row.is_new ?? row.isNew),
    isNewRelease: Boolean(row.is_new_release ?? row.isNewRelease),
    isFeatured: Boolean(row.is_featured ?? row.featured ?? row.isFeatured),
    featured: Boolean(row.featured ?? row.is_featured ?? row.isFeatured),
    isInternational: Boolean(row.is_international ?? row.isInternational),
    is_active: row.is_active !== undefined ? Boolean(row.is_active) : true,
    status: (row.status as any) || 'published',
    sectionIds: sectionIdsArray,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

/**
 * Convert frontend Book to database row payload.
 */
export function bookToRow(book: Partial<Book>): Record<string, any> {
  const banglaName = book.bangla_name || book.title_bn || book.title || '';
  const englishName = book.english_name || '';
  const title = banglaName || englishName || book.title || '';

  const price = book.price !== undefined ? Number(book.price) : 0;
  const originalPrice =
    book.originalPrice !== undefined
      ? Number(book.originalPrice)
      : book.old_price !== undefined
      ? Number(book.old_price)
      : price;

  const oldPrice =
    book.old_price !== undefined
      ? Number(book.old_price)
      : originalPrice;

  const row: Record<string, any> = {
    title,
    title_bn: banglaName,
    bangla_name: banglaName,
    english_name: englishName,
    author: book.author || '',
    publisher: book.publisher || 'বাতিঘর',
    category: book.category || 'উপন্যাস',
    description: book.description || '',
    description_bn: book.description_bn || book.description || '',
    image: book.image || book.cover_image || '',
    cover_image: book.cover_image || book.image || '',
    banner_image: book.banner_image || '',
    pdf_url: book.pdf_url || '',
    gallery: Array.isArray(book.gallery) ? book.gallery : [],
    price,
    original_price: originalPrice,
    old_price: oldPrice,
    discount: book.discount !== undefined ? Number(book.discount) : 0,
    rating: book.rating !== undefined ? Number(book.rating) : 5.0,
    review_count: book.reviewCount !== undefined ? Number(book.reviewCount) : 0,
    stock: book.stock !== undefined ? Number(book.stock) : 0,
    isbn: book.isbn || '',
    pages: book.pages !== undefined ? Number(book.pages) : 0,
    edition: book.edition || '১ম সংস্করণ',
    language: book.language || 'বাংলা',
    tags: Array.isArray(book.tags) ? book.tags : [],
    is_bestseller: Boolean(book.isBestseller),
    is_new: Boolean(book.isNew),
    is_new_release: Boolean(book.isNewRelease),
    is_featured: Boolean(book.isFeatured ?? book.featured),
    featured: Boolean(book.featured ?? book.isFeatured),
    is_international: Boolean(book.isInternational),
    is_active: book.is_active !== undefined ? Boolean(book.is_active) : true,
    status: book.status || 'published',
    section_ids: Array.isArray(book.sectionIds) ? book.sectionIds : ['new-arrivals'],
    updated_at: new Date().toISOString(),
  };

  if (book.id) {
    row.id = book.id;
  }
  if (book.created_at) {
    row.created_at = book.created_at;
  }

  return row;
}

/**
 * Convert partial Book updates to database row payload,
 * only including fields explicitly specified to prevent overwriting existing columns.
 */
export function bookToRowPartial(book: Partial<Book>): Record<string, any> {
  const row: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (book.title !== undefined || book.bangla_name !== undefined || book.title_bn !== undefined) {
    const titleVal = (book.bangla_name || book.title_bn || book.title || '').trim();
    if (titleVal) {
      row.title = titleVal;
      row.title_bn = titleVal;
      row.bangla_name = titleVal;
    }
  }
  if (book.english_name !== undefined) row.english_name = book.english_name.trim();
  if (book.author !== undefined) row.author = book.author.trim();
  if (book.publisher !== undefined) row.publisher = book.publisher.trim();
  if (book.category !== undefined) row.category = book.category.trim();
  if (book.description !== undefined) row.description = book.description;
  if (book.description_bn !== undefined) row.description_bn = book.description_bn;
  if (book.image !== undefined) row.image = book.image;
  if (book.cover_image !== undefined) row.cover_image = book.cover_image;
  if (book.banner_image !== undefined) row.banner_image = book.banner_image;
  if (book.pdf_url !== undefined) row.pdf_url = book.pdf_url;
  if (book.gallery !== undefined) row.gallery = Array.isArray(book.gallery) ? book.gallery : [];
  if (book.price !== undefined) row.price = Number(book.price);
  if (book.originalPrice !== undefined) row.original_price = Number(book.originalPrice);
  if (book.old_price !== undefined) row.old_price = Number(book.old_price);
  if (book.discount !== undefined) row.discount = Number(book.discount);
  if (book.rating !== undefined) row.rating = Number(book.rating);
  if (book.reviewCount !== undefined) row.review_count = Number(book.reviewCount);
  if (book.stock !== undefined) row.stock = Number(book.stock);
  if (book.isbn !== undefined) row.isbn = book.isbn;
  if (book.pages !== undefined) row.pages = Number(book.pages);
  if (book.edition !== undefined) row.edition = book.edition;
  if (book.language !== undefined) row.language = book.language;
  if (book.tags !== undefined) row.tags = Array.isArray(book.tags) ? book.tags : [];
  if (book.isBestseller !== undefined) row.is_bestseller = Boolean(book.isBestseller);
  if (book.isNew !== undefined) row.is_new = Boolean(book.isNew);
  if (book.isNewRelease !== undefined) row.is_new_release = Boolean(book.isNewRelease);
  if (book.isFeatured !== undefined || book.featured !== undefined) {
    const feat = Boolean(book.isFeatured ?? book.featured);
    row.is_featured = feat;
    row.featured = feat;
  }
  if (book.isInternational !== undefined) row.is_international = Boolean(book.isInternational);
  if (book.is_active !== undefined) row.is_active = Boolean(book.is_active);
  if (book.status !== undefined) row.status = book.status;
  if (book.sectionIds !== undefined) row.section_ids = Array.isArray(book.sectionIds) ? book.sectionIds : [];

  return row;
}

export const bookService = {
  /**
   * Get cached books from localStorage for immediate, zero-latency rendering.
   */
  getCachedBooks(): Book[] {
    if (typeof window === 'undefined') {
      return INITIAL_BOOKS;
    }
    try {
      const stored = localStorage.getItem(BOOKS_STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Ignore read errors
    }
    return INITIAL_BOOKS;
  },

  /**
   * Save books to localStorage cache and notify any listeners in the same window/tabs.
   */
  saveToCache(books: Book[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
      window.dispatchEvent(
        new CustomEvent(BOOKS_CHANGED_EVENT, { detail: books })
      );
    } catch (e) {
      console.error('[bookService] Failed to cache books in localStorage:', e);
    }
  },

  /**
   * Fetch all books from central database.
   * Priority: 1) /api/books server route (bypasses adblockers) -> 2) Direct Supabase -> 3) Local cache.
   */
  async fetchBooks(): Promise<Book[]> {
    const cached = this.getCachedBooks();

    // 1. Try Next.js server route /api/books
    try {
      const response = await fetch('/api/books', {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        const json = await response.json();
        if (json && Array.isArray(json.books)) {
          const mappedBooks = json.books.map(rowToBook);
          this.saveToCache(mappedBooks);
          return mappedBooks;
        }
      }
    } catch (apiErr) {
      console.warn('[bookService] /api/books fetch error, trying direct Supabase:', apiErr);
    }

    // 2. Direct Supabase client query
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && Array.isArray(data)) {
          const mappedBooks = data.map(rowToBook);
          this.saveToCache(mappedBooks);
          return mappedBooks;
        }
      } catch (err) {
        console.warn('[bookService] Exception querying Supabase books directly:', err);
      }
    }

    return cached;
  },

  /**
   * Fetch a single book by ID from Supabase.
   */
  async getBookById(id: string): Promise<Book | null> {
    if (!id) return null;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error) {
          if (data) return rowToBook(data);
          // Explicitly not found in central database (deleted)
          return null;
        }
      } catch (err) {
        console.warn(`[bookService] Exception fetching book ${id}:`, err);
      }
    }

    // Fallback: search local cache if offline
    const cached = this.getCachedBooks();
    return cached.find((b) => b.id === id) || null;
  },

  /**
   * Create a new book.
   * Sends the request to the secure server API route /api/admin/books
   * which verifies admin credentials and inserts into Supabase.
   */
  async createBook(bookData: Omit<Book, 'id'> & { id?: string }): Promise<Book> {
    const id = bookData.id || `book-sp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fullBook: Book = {
      ...bookData,
      id,
      title: bookData.title || bookData.bangla_name || bookData.english_name || '',
      bangla_name: bookData.bangla_name || bookData.title || '',
      english_name: bookData.english_name || '',
      image: bookData.image || bookData.cover_image || '',
      cover_image: bookData.cover_image || bookData.image || '',
      price: Number(bookData.price) || 0,
      originalPrice: Number(bookData.originalPrice) || Number(bookData.price) || 0,
      discount: Number(bookData.discount) || 0,
      stock: Number(bookData.stock) || 0,
      rating: bookData.rating !== undefined ? Number(bookData.rating) : 5.0,
      reviewCount: bookData.reviewCount !== undefined ? Number(bookData.reviewCount) : 1,
      tags: Array.isArray(bookData.tags) ? bookData.tags : [],
      sectionIds: Array.isArray(bookData.sectionIds) ? bookData.sectionIds : ['new-arrivals'],
      created_at: bookData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const response = await fetch('/api/admin/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullBook),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error('অননুমোদিত: বই আপলোড করার জন্য অ্যাডমিন লগইন প্রয়োজন।');
      }
      throw new Error(errorData.error || `বই সংরক্ষণে সমস্যা হয়েছে (Status: ${response.status})`);
    }

    const resData = await response.json();
    if (resData.book) {
      return rowToBook(resData.book);
    }

    return fullBook;
  },

  /**
   * Update an existing book by ID.
   */
  async updateBook(id: string, updates: Partial<Book>): Promise<Book> {
    const response = await fetch(`/api/admin/books?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error('অননুমোদিত: বই এডিট করার জন্য অ্যাডমিন লগইন প্রয়োজন।');
      }
      throw new Error(errorData.error || `বই আপডেট ব্যর্থ হয়েছে (Status: ${response.status})`);
    }

    const resData = await response.json();
    if (resData.book) {
      return rowToBook(resData.book);
    }

    const current = this.getCachedBooks().find((b) => b.id === id);
    return {
      ...(current || ({} as Book)),
      ...updates,
      id,
      updated_at: new Date().toISOString(),
    } as Book;
  },

  /**
   * Delete a book by ID.
   */
  async deleteBook(id: string): Promise<boolean> {
    const response = await fetch(`/api/admin/books?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error('অননুমোদিত: বই মুছে ফেলার জন্য অ্যাডমিন লগইন প্রয়োজন।');
      }
      throw new Error(errorData.error || `বই মুছে ফেলা সম্ভব হয়নি (Status: ${response.status})`);
    }

    return true;
  },

  /**
   * Upload an image file to Supabase Storage bucket ('book-covers' or 'book-banners').
   */
  async uploadImage(file: File, bucket = 'book-covers'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error('অননুমোদিত: ছবি আপলোডের জন্য অ্যাডমিন লগইন প্রয়োজন।');
      }
      throw new Error(errorData.error || 'ছবি আপলোড ব্যর্থ হয়েছে');
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error('সার্ভার থেকে ছবির লিঙ্ক পাওয়া যায়নি');
    }

    return data.url;
  },

  /**
   * Subscribe to Supabase Realtime changes on public.books.
   * Calls onInsert, onUpdate, onDelete callbacks as events arrive.
   */
  subscribeToRealtime(callbacks: {
    onInsert?: (book: Book) => void;
    onUpdate?: (book: Book) => void;
    onDelete?: (id: string) => void;
  }): () => void {
    if (!isSupabaseConfigured() || !supabase) {
      return () => {};
    }

    try {
      const channel = supabase
        .channel(`realtime-books-${Date.now()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'books' },
          (payload) => {
            if (payload.eventType === 'INSERT' && payload.new) {
              const book = rowToBook(payload.new);
              callbacks.onInsert?.(book);
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              const book = rowToBook(payload.new);
              callbacks.onUpdate?.(book);
            } else if (payload.eventType === 'DELETE' && payload.old) {
              const deletedId = String((payload.old as any).id);
              callbacks.onDelete?.(deletedId);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            // Channel ready
          }
        });

      return () => {
        try {
          supabase?.removeChannel(channel);
        } catch (e) {
          console.warn('[bookService] Error removing realtime channel:', e);
        }
      };
    } catch (err) {
      console.warn('[bookService] Failed to initialize realtime subscription:', err);
      return () => {};
    }
  },
};
