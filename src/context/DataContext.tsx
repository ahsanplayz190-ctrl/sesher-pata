'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, Banner, Category, Author, Publisher, OrderDetails, SiteSettings } from '../types';
import { BOOKS as INITIAL_BOOKS } from '../data/books';
import { CATEGORIES as INITIAL_CATEGORIES } from '../data/categories';
import { INITIAL_BANNERS } from '../data/banners';
import { settingsService, DEFAULT_SETTINGS } from '../services/settingsService';
import { bookService, BOOKS_CHANGED_EVENT } from '../services/bookService';

const INITIAL_AUTHORS: Author[] = [
  {
    id: 'author-humayun',
    name: 'হুমায়ূন আহমেদ',
    era: '১৯৪৮ – ২০১২',
    role: 'কথাসাহিত্যিক, নাট্যকার ও চলচ্চিত্র নির্মাতা',
    bio: 'আধুনিক বাংলা সাহিত্যের সবচেয়ে জনপ্রিয় কথাসাহিত্যিক। মিসির আলি, হিমু ও শুভ্র চরিত্রের স্রষ্টা।',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    bookCount: 45,
  },
  {
    id: 'author-rabindranath',
    name: 'রবীন্দ্রনাথ ঠাকুর',
    era: '১৮৬১ – ১৯৪১',
    role: 'বিশ্বকবি, নোবেল বিজয়ী সাহিত্যিক',
    bio: 'বাংলা ভাষা ও সাহিত্যের রূপকার। গীতাঞ্জলি কাব্যের জন্য ১৯১৩ সালে এশিয়ার প্রথম নোবেল পুরস্কার লাভ করেন।',
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80',
    bookCount: 38,
  },
  {
    id: 'author-nazrul',
    name: 'কাজী নজরুল ইসলাম',
    era: '১৮৯৯ – ১৯৭৬',
    role: 'জাতীয় কবি, বিদ্রোহী কবি ও সুরস্রষ্টা',
    bio: 'বাংলা সাহিত্যের অন্যতম শ্রেষ্ঠ কবি, দ্রোহ, সাম্য ও প্রেমের অবিসংবাদিত কণ্ঠস্বর।',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    bookCount: 29,
  },
  {
    id: 'author-satyajit',
    name: 'সত্যজিৎ রায়',
    era: '১৯২১ – ১৯৯২',
    role: 'চলচ্চিত্রকার, লেখক ও চিত্রশিল্পী',
    bio: 'অস্কারজয়ী চলচ্চিত্রকার এবং বাংলা সাহিত্যের জনপ্রিয় গোয়েন্দা চরিত্র ফেলুদা ও প্রফেসর শঙ্কুর অমর স্রষ্টা।',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    bookCount: 22,
  },
  {
    id: 'author-sunil',
    name: 'সুনীল গঙ্গোপাধ্যায়',
    era: '১৯৩৪ – ২০১২',
    role: 'কবি, ঔপন্যাসিক ও ছোটগল্পকার',
    bio: 'নীললোহিত ছদ্মনামে খ্যাত। সেই সময়, প্রথম আলো, পূর্ব-পশ্চিম এবং কাকাবাবু সিরিজের অমর স্রষ্টা।',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bookCount: 34,
  },
  {
    id: 'author-sharat',
    name: 'শরৎচন্দ্র চট্টোপাধ্যায়',
    era: '১৮৭৬ – ১৯৩৮',
    role: 'অপরাজেয় কথাশিল্পী',
    bio: 'বাঙালি সমাজজীবনের নিখুঁত রূপকার। দেবদাস, চরিত্রহীন, শ্রীকান্ত এবং পল্লীসমাজ উপন্যাসের অমর লেখক।',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bookCount: 26,
  },
  {
    id: 'author-zafar',
    name: 'মুহম্মদ জাফর ইকবাল',
    era: '১৯৫২ – বর্তমান',
    role: 'বিজ্ঞান কল্পকাহিনী লেখক ও শিক্ষাবিদ',
    bio: 'জনপ্রিয় বিজ্ঞান কল্পকাহিনী, কিশোর সাহিত্য ও গণিত অলিম্পিয়াডের স্বপ্নদ্রষ্টা।',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bookCount: 18,
  },
];

const INITIAL_PUBLISHERS: Publisher[] = [
  {
    id: 'pub-batighar',
    name: 'বাতিঘর',
    description: 'রুচিশীল প্রকাশনা ও বিশ্বমানের অনুবাদ সাহিত্যের পথিকৃৎ।',
    location: 'ঢাকা ও চট্টগ্রাম',
    established: '২০০৫',
    logo: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=120&q=80',
    bookCount: 42,
  },
  {
    id: 'pub-prothoma',
    name: 'প্রথমা প্রকাশন',
    description: 'মননশীল সাহিত্য, ইতিহাস ও গবেষণাভিত্তিক আস্থার প্রকাশনা সংস্থা।',
    location: 'কারওয়ান বাজার, ঢাকা',
    established: '২০০৮',
    logo: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=120&q=80',
    bookCount: 35,
  },
  {
    id: 'pub-anyaprokash',
    name: 'অন্যপ্রকাশ',
    description: 'হুমায়ূন আহমেদ সহ শীর্ষস্থানীয় লেখকদের প্রিয় প্রকাশনা প্রতিষ্ঠান।',
    location: 'বাংলাবাজার, ঢাকা',
    established: '১৯৯৭',
    logo: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=120&q=80',
    bookCount: 50,
  },
  {
    id: 'pub-ananya',
    name: 'অনন্যা প্রকাশনী',
    description: 'বাংলা সাহিত্যের জনপ্রিয় কথাসাহিত্য ও সমকালীন শ্রেষ্ঠ উপন্যাসের প্রকাশক।',
    location: 'ঢাকা',
    established: '১৯৮২',
    logo: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=120&q=80',
    bookCount: 28,
  },
  {
    id: 'pub-somoy',
    name: 'সময় প্রকাশন',
    description: 'মুক্তিযুদ্ধ, ইতিহাস এবং সমকালীন বাংলা সাহিত্যের সমৃদ্ধ সম্ভার।',
    location: 'বাংলাবাজার, ঢাকা',
    established: '১৯৮৮',
    logo: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=120&q=80',
    bookCount: 24,
  },
  {
    id: 'pub-oitijjhya',
    name: 'ঐতিহ্য',
    description: 'রবীন্দ্র রচনাবলি, নজরুল রচনাবলি সহ ক্লাসিক সাহিত্যের রাজকীয় সংকলক।',
    location: 'কাঁটাবন, ঢাকা',
    established: '২০০০',
    logo: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=120&q=80',
    bookCount: 31,
  },
];

const INITIAL_ORDERS: OrderDetails[] = [
  {
    orderId: 'SP-2026-89421',
    date: '২০২৬-০৩-১৪',
    customerName: 'তানভীর আহমেদ',
    phone: '01711223344',
    email: 'tanvir.ahmed@example.com',
    address: 'বাড়ি নং ১২, রোড ৫, ধানমন্ডি',
    district: 'ঢাকা',
    thana: 'ধানমন্ডি',
    postalCode: '1209',
    deliveryOption: 'inside_dhaka',
    deliveryFee: 60,
    paymentMethod: 'cod',
    items: [
      { book: INITIAL_BOOKS[0], quantity: 1 },
      { book: INITIAL_BOOKS[1], quantity: 1 },
    ],
    subtotal: 990,
    discountAmount: 100,
    couponCode: 'SHESHER10',
    total: 950,
    status: 'shipped',
    orderNotes: 'বিকেলের দিকে ডেলিভারি দিলে ভালো হয়।',
  },
  {
    orderId: 'SP-2026-73190',
    date: '২০২৬-০৩-১৫',
    customerName: 'নুসরাত জাহান',
    phone: '01899887766',
    email: 'nusrat.j@example.com',
    address: 'হিলভিউ আবাসিক এলাকা, জিইসি মোড়',
    district: 'চট্টগ্রাম',
    thana: 'পাঁচলাইশ',
    postalCode: '4000',
    deliveryOption: 'outside_dhaka',
    deliveryFee: 120,
    paymentMethod: 'bkash',
    items: [
      { book: INITIAL_BOOKS[2] || INITIAL_BOOKS[0], quantity: 2 },
    ],
    subtotal: 840,
    discountAmount: 0,
    total: 960,
    status: 'pending',
    orderNotes: 'বিকাশ ট্রানজ্যাকশন আইডি: 9K8X7L2M',
  },
  {
    orderId: 'SP-2026-95810',
    date: '২০২৬-০৩-১৬',
    customerName: 'রাকিবুল হাসান',
    phone: '01755667788',
    email: 'rakibul@example.com',
    address: 'বাড়ি ৭, রোড ৪, উত্তরা সেক্টর ৩',
    district: 'ঢাকা',
    thana: 'উত্তরা',
    postalCode: '1230',
    deliveryOption: 'inside_dhaka',
    deliveryFee: 60,
    paymentMethod: 'cod',
    items: [
      { book: INITIAL_BOOKS[0], quantity: 1 },
      { book: INITIAL_BOOKS[1] || INITIAL_BOOKS[0], quantity: 1 },
    ],
    subtotal: 990,
    discountAmount: 50,
    couponCode: 'SHESHER10',
    total: 1000,
    status: 'confirmed',
    orderNotes: 'আজকের জরুরি ডেলিভারি প্রয়োজন।',
  },
];

interface DataContextType {
  books: Book[];
  banners: Banner[];
  categories: Category[];
  authors: Author[];
  publishers: Publisher[];
  orders: OrderDetails[];
  
  // Book Actions
  isBooksLoading: boolean;
  addBook: (book: Omit<Book, 'id'> & { id?: string }) => Promise<Book>;
  updateBook: (id: string, updated: Partial<Book>) => Promise<Book>;
  deleteBook: (id: string) => Promise<boolean>;
  syncBooksWithSupabase: () => Promise<{ success: boolean; count?: number; message: string }>;

  // Banner Actions
  addBanner: (banner: Omit<Banner, 'id'> & { id?: string }) => Banner;
  updateBanner: (id: string, updated: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;

  // Category Actions
  addCategory: (category: Omit<Category, 'id'> & { id?: string }) => Category;
  updateCategory: (id: string, updated: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Author Actions
  addAuthor: (author: Omit<Author, 'id'> & { id?: string }) => Author;
  updateAuthor: (id: string, updated: Partial<Author>) => void;
  deleteAuthor: (id: string) => void;

  // Publisher Actions
  addPublisher: (publisher: Omit<Publisher, 'id'> & { id?: string }) => Publisher;
  updatePublisher: (id: string, updated: Partial<Publisher>) => void;
  deletePublisher: (id: string) => void;

  // Order Actions
  addOrder: (order: OrderDetails) => void;
  updateOrder: (orderId: string, updated: Partial<OrderDetails>) => void;
  updateOrderStatus: (orderId: string, status: OrderDetails['status']) => void;
  deleteOrder: (orderId: string) => void;

  // Site Settings
  siteSettings: SiteSettings;
  updateSiteSettings: (updates: Partial<SiteSettings>) => Promise<SiteSettings>;

  // Management & Backup
  resetAllData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BOOKS: 'shesher_pata_books_v1',
  BANNERS: 'shesher_pata_banners_v1',
  CATEGORIES: 'shesher_pata_categories_v1',
  AUTHORS: 'shesher_pata_authors_v1',
  PUBLISHERS: 'shesher_pata_publishers_v1',
  ORDERS: 'shesher_pata_orders_v1',
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(() => bookService.getCachedBooks());
  const [isBooksLoading, setIsBooksLoading] = useState<boolean>(true);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [authors, setAuthors] = useState<Author[]>(INITIAL_AUTHORS);
  const [publishers, setPublishers] = useState<Publisher[]>(INITIAL_PUBLISHERS);
  const [orders, setOrders] = useState<OrderDetails[]>(INITIAL_ORDERS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage and Supabase on mount
  useEffect(() => {
    try {
      // 1. Load cached books first for instant render
      const cached = bookService.getCachedBooks();
      if (cached && cached.length > 0) {
        setBooks(cached);
      }

      // 2. Fetch fresh books from central database
      setIsBooksLoading(true);
      bookService.fetchBooks()
        .then((remoteBooks) => {
          if (Array.isArray(remoteBooks)) {
            setBooks(remoteBooks);
          }
        })
        .finally(() => {
          setIsBooksLoading(false);
        });

      const storedBanners = localStorage.getItem(STORAGE_KEYS.BANNERS);
      if (storedBanners) {
        setBanners(JSON.parse(storedBanners));
      }

      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }

      const storedAuthors = localStorage.getItem(STORAGE_KEYS.AUTHORS);
      if (storedAuthors) {
        setAuthors(JSON.parse(storedAuthors));
      }

      const storedPublishers = localStorage.getItem(STORAGE_KEYS.PUBLISHERS);
      if (storedPublishers) {
        setPublishers(JSON.parse(storedPublishers));
      }

      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }

      // Initial cached settings
      setSiteSettings(settingsService.getCachedSettings());

      // Fetch from Supabase in background
      settingsService.fetchSettings().then((remoteSettings) => {
        if (remoteSettings) {
          setSiteSettings(remoteSettings);
        }
      });
    } catch (err) {
      console.error('Error loading data from localStorage:', err);
    } finally {
      setIsLoaded(true);
    }

    // 3. Supabase Realtime synchronization for books table
    const unsubscribeBooksRealtime = bookService.subscribeToRealtime({
      onInsert: (newBook) => {
        setBooks((prev) => {
          if (prev.some((b) => b.id === newBook.id)) {
            return prev.map((b) => (b.id === newBook.id ? newBook : b));
          }
          const updated = [newBook, ...prev];
          bookService.saveToCache(updated);
          return updated;
        });
      },
      onUpdate: (updatedBook) => {
        setBooks((prev) => {
          const updated = prev.map((b) => (b.id === updatedBook.id ? { ...b, ...updatedBook } : b));
          bookService.saveToCache(updated);
          return updated;
        });
      },
      onDelete: (deletedId) => {
        setBooks((prev) => {
          const updated = prev.filter((b) => b.id !== deletedId);
          bookService.saveToCache(updated);
          return updated;
        });
      },
    });

    // 4. Multi-tab / window sync for books
    const handleBooksChanged = (event: Event) => {
      const customEvent = event as CustomEvent<Book[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setBooks(customEvent.detail);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener(BOOKS_CHANGED_EVENT, handleBooksChanged);
    }

    // Subscribe to settings changes across components or tabs
    const unsubscribeSettings = settingsService.subscribe((updatedSettings) => {
      setSiteSettings(updatedSettings);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeBooksRealtime();
      if (typeof window !== 'undefined') {
        window.removeEventListener(BOOKS_CHANGED_EVENT, handleBooksChanged);
      }
    };
  }, []);

  // Save other changes to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
    } catch (e) {
      console.error('Failed to save banners to localStorage:', e);
    }
  }, [banners, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories to localStorage:', e);
    }
  }, [categories, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.AUTHORS, JSON.stringify(authors));
    } catch (e) {
      console.error('Failed to save authors to localStorage:', e);
    }
  }, [authors, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PUBLISHERS, JSON.stringify(publishers));
    } catch (e) {
      console.error('Failed to save publishers to localStorage:', e);
    }
  }, [publishers, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage:', e);
    }
  }, [orders, isLoaded]);

  // Book Methods (Synchronized with Supabase as single source of truth)
  const addBook = async (bookData: Omit<Book, 'id'> & { id?: string }): Promise<Book> => {
    const banglaName = (bookData.bangla_name || bookData.title || '').trim();
    const englishName = (bookData.english_name || '').trim();
    const title = banglaName || englishName || bookData.title || '';

    const newBook: Book = {
      ...bookData,
      id: bookData.id || `book-sp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      title_bn: banglaName,
      bangla_name: banglaName,
      english_name: englishName,
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

    // Save to central database first
    const savedBook = await bookService.createBook(newBook);

    // Update state and cache
    setBooks((prev) => {
      const next = [savedBook, ...prev.filter((b) => b.id !== savedBook.id)];
      bookService.saveToCache(next);
      return next;
    });

    // Also update category bookCount
    setCategories((prev) =>
      prev.map((cat) =>
        cat.name === savedBook.category || cat.englishName === savedBook.category
          ? { ...cat, bookCount: cat.bookCount + 1 }
          : cat
      )
    );

    return savedBook;
  };

  const updateBook = async (id: string, updated: Partial<Book>): Promise<Book> => {
    const savedBook = await bookService.updateBook(id, updated);

    setBooks((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, ...savedBook } : b));
      bookService.saveToCache(next);
      return next;
    });

    return savedBook;
  };

  const deleteBook = async (id: string): Promise<boolean> => {
    await bookService.deleteBook(id);

    setBooks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      bookService.saveToCache(next);
      return next;
    });

    return true;
  };

  const syncBooksWithSupabase = async (): Promise<{ success: boolean; count?: number; message: string }> => {
    try {
      // Fetch fresh live books from the central Supabase database
      const freshBooks = await bookService.fetchBooks();
      if (Array.isArray(freshBooks)) {
        setBooks(freshBooks);
        bookService.saveToCache(freshBooks);
        return {
          success: true,
          count: freshBooks.length,
          message: `সেন্ট্রাল ডাটাবেজের সাথে সফলভাবে সিঙ্ক ও রিফ্রেশ হয়েছে (মোট ${freshBooks.length}টি বই লাইভ)`,
        };
      }
      return { success: true, count: 0, message: 'ডাটাবেজ সিঙ্ক সম্পন্ন হয়েছে' };
    } catch (err: any) {
      return { success: false, message: err.message || 'সিঙ্ক ব্যর্থ হয়েছে' };
    }
  };

  const resetBooksToFactoryDefault = async (): Promise<{ success: boolean; count?: number; message: string }> => {
    try {
      const res = await fetch('/api/admin/books/seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ফ্যাক্টরি রিস্টোর ব্যর্থ হয়েছে');
      }
      const freshBooks = await bookService.fetchBooks();
      if (Array.isArray(freshBooks)) {
        setBooks(freshBooks);
      }
      return { success: true, count: data.count, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'ফ্যাক্টরি রিস্টোর ব্যর্থ হয়েছে' };
    }
  };

  // Banner Methods
  const addBanner = (bannerData: Omit<Banner, 'id'> & { id?: string }): Banner => {
    const newBanner: Banner = {
      ...bannerData,
      id: bannerData.id || `banner-${Date.now()}`,
      status: bannerData.status || 'active',
      sort_order: bannerData.sort_order ?? (banners.length + 1),
      created_at: bannerData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setBanners((prev) => [...prev, newBanner]);
    return newBanner;
  };

  const updateBanner = (id: string, updated: Partial<Banner>) => {
    setBanners((prev) =>
      prev.map((ban) =>
        ban.id === id
          ? { ...ban, ...updated, updated_at: new Date().toISOString() }
          : ban
      )
    );
  };

  const deleteBanner = (id: string) => {
    setBanners((prev) => prev.filter((ban) => ban.id !== id));
  };

  // Category Methods
  const addCategory = (catData: Omit<Category, 'id'> & { id?: string }): Category => {
    const newCat: Category = {
      ...catData,
      id: catData.id || `cat-${Date.now()}`,
      bookCount: catData.bookCount || 0,
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Author Methods
  const addAuthor = (authorData: Omit<Author, 'id'> & { id?: string }): Author => {
    const newAuthor: Author = {
      ...authorData,
      id: authorData.id || `auth-${Date.now()}`,
      bookCount: authorData.bookCount || 0,
    };
    setAuthors((prev) => [...prev, newAuthor]);
    return newAuthor;
  };

  const updateAuthor = (id: string, updated: Partial<Author>) => {
    setAuthors((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
  };

  const deleteAuthor = (id: string) => {
    setAuthors((prev) => prev.filter((a) => a.id !== id));
  };

  // Publisher Methods
  const addPublisher = (pubData: Omit<Publisher, 'id'> & { id?: string }): Publisher => {
    const newPub: Publisher = {
      ...pubData,
      id: pubData.id || `pub-${Date.now()}`,
      bookCount: pubData.bookCount || 0,
    };
    setPublishers((prev) => [...prev, newPub]);
    return newPub;
  };

  const updatePublisher = (id: string, updated: Partial<Publisher>) => {
    setPublishers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const deletePublisher = (id: string) => {
    setPublishers((prev) => prev.filter((p) => p.id !== id));
  };

  // Order Methods
  const addOrder = (newOrder: OrderDetails) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const updateOrder = (orderId: string, updated: Partial<OrderDetails>) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.orderId === orderId ? { ...ord, ...updated } : ord))
    );
  };

  const updateOrderStatus = (orderId: string, status: OrderDetails['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.orderId === orderId ? { ...ord, status } : ord))
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.orderId !== orderId));
  };

  // Site Settings Action
  const updateSiteSettings = async (updates: Partial<SiteSettings>): Promise<SiteSettings> => {
    const saved = await settingsService.saveSettings(updates);
    setSiteSettings(saved);
    return saved;
  };

  // Reset & Backup
  const resetAllData = () => {
    setBooks(INITIAL_BOOKS);
    setBanners(INITIAL_BANNERS);
    setCategories(INITIAL_CATEGORIES);
    setAuthors(INITIAL_AUTHORS);
    setPublishers(INITIAL_PUBLISHERS);
    setOrders(INITIAL_ORDERS);
    setSiteSettings(DEFAULT_SETTINGS);
    settingsService.saveSettings(DEFAULT_SETTINGS);

    localStorage.removeItem(STORAGE_KEYS.BOOKS);
    localStorage.removeItem(STORAGE_KEYS.BANNERS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.AUTHORS);
    localStorage.removeItem(STORAGE_KEYS.PUBLISHERS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
  };

  const exportDataJSON = (): string => {
    const bundle = {
      books,
      banners,
      categories,
      authors,
      publishers,
      orders,
      siteSettings,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    return JSON.stringify(bundle, null, 2);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.books && Array.isArray(parsed.books)) setBooks(parsed.books);
      if (parsed.banners && Array.isArray(parsed.banners)) setBanners(parsed.banners);
      if (parsed.categories && Array.isArray(parsed.categories)) setCategories(parsed.categories);
      if (parsed.authors && Array.isArray(parsed.authors)) setAuthors(parsed.authors);
      if (parsed.publishers && Array.isArray(parsed.publishers)) setPublishers(parsed.publishers);
      if (parsed.orders && Array.isArray(parsed.orders)) setOrders(parsed.orders);
      if (parsed.siteSettings) {
        setSiteSettings(parsed.siteSettings);
        settingsService.saveSettings(parsed.siteSettings);
      }
      return true;
    } catch (e) {
      console.error('Failed to parse import JSON', e);
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        books,
        isBooksLoading,
        banners,
        categories,
        authors,
        publishers,
        orders,
        addBook,
        updateBook,
        deleteBook,
        syncBooksWithSupabase,
        addBanner,
        updateBanner,
        deleteBanner,
        addCategory,
        updateCategory,
        deleteCategory,
        addAuthor,
        updateAuthor,
        deleteAuthor,
        addPublisher,
        updatePublisher,
        deletePublisher,
        addOrder,
        updateOrder,
        updateOrderStatus,
        deleteOrder,
        siteSettings,
        updateSiteSettings,
        resetAllData,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
