'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Building2,
  Users,
  ShoppingBag,
  Settings,
  LogOut,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Save,
  X,
  Printer,
  ChevronRight,
  TrendingUp,
  Package,
  Clock,
  ShieldCheck,
  Eye,
  EyeOff,
  Filter,
  Download,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useData } from '../../src/context/DataContext';
import { Book, Banner, Category, Author, Publisher, OrderDetails } from '../../src/types';
import { formatPrice, toBengaliNumber } from '../../src/utils/formatters';

export default function AdminPage() {
  const {
    books,
    banners,
    categories,
    authors,
    publishers,
    orders,
    addBook,
    updateBook,
    deleteBook,
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
    updateOrderStatus,
    deleteOrder,
    siteSettings,
    updateSiteSettings,
    resetAllData,
    exportDataJSON,
    importDataJSON,
  } = useData();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isRemember, setIsRemember] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'books' | 'banners' | 'categories' | 'publishers' | 'authors' | 'orders' | 'settings'
  >('dashboard');

  // Book Management States
  const [bookSearch, setBookSearch] = useState('');
  const [bookCategoryFilter, setBookCategoryFilter] = useState('all');
  const [bookStockFilter, setBookStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  // Book Form State
  const [bookForm, setBookForm] = useState<{
    title: string;
    bangla_name: string;
    english_name: string;
    author: string;
    publisher: string;
    category: string;
    price: number;
    originalPrice: number;
    discount: number;
    stock: number;
    isbn: string;
    pages: number;
    edition: string;
    language: string;
    description: string;
    image: string;
    tags: string;
    isBestseller: boolean;
    isNew: boolean;
    isFeatured: boolean;
    isInternational: boolean;
    sectionIds: string[];
  }>({
    title: '',
    bangla_name: '',
    english_name: '',
    author: '',
    publisher: '',
    category: '',
    price: 350,
    originalPrice: 500,
    discount: 30,
    stock: 15,
    isbn: '',
    pages: 200,
    edition: '১ম সংস্করণ',
    language: 'বাংলা',
    description: '',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&h=560&q=80',
    tags: 'উপন্যাস, জনপ্রিয়',
    isBestseller: false,
    isNew: true,
    isFeatured: false,
    isInternational: false,
    sectionIds: ['new-arrivals'],
  });

  // Banner Modal State
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState<{
    title: string;
    english_title: string;
    subtitle: string;
    english_subtitle: string;
    bangla_image: string;
    english_image: string;
    badge: string;
    link: string;
    status: 'active' | 'inactive';
    sort_order: number;
  }>({
    title: '',
    english_title: '',
    subtitle: '',
    english_subtitle: '',
    bangla_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1600&h=600&q=85',
    english_image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1600&h=600&q=85',
    badge: 'Special Offer',
    link: 'books',
    status: 'active',
    sort_order: 1,
  });

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({
    name: '',
    englishName: '',
    iconName: 'BookOpen',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
  });

  // Publisher Modal State
  const [isPubModalOpen, setIsPubModalOpen] = useState(false);
  const [editingPubId, setEditingPubId] = useState<string | null>(null);
  const [pubForm, setPubForm] = useState({
    name: '',
    description: '',
    location: 'ঢাকা',
    established: '২০১০',
    logo: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=120&q=80',
  });

  // Author Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingAuthId, setEditingAuthId] = useState<string | null>(null);
  const [authForm, setAuthForm] = useState({
    name: '',
    era: '',
    role: 'কথাসাহিত্যিক ও লেখক',
    bio: '',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
  });

  // Order Filter & View State
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<OrderDetails | null>(null);

  // File upload input ref
  const bookImageInputRef = useRef<HTMLInputElement | null>(null);
  const catImageInputRef = useRef<HTMLInputElement | null>(null);
  const pubImageInputRef = useRef<HTMLInputElement | null>(null);
  const authImageInputRef = useRef<HTMLInputElement | null>(null);

  // Notification / Toast inside admin
  const [adminNotice, setAdminNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setAdminNotice({ message, type });
    setTimeout(() => {
      setAdminNotice(null);
    }, 4000);
  };

  // Check auth session with server-side verified token
  useEffect(() => {
    let isMounted = true;
    fetch('/api/admin/auth')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.authenticated) {
          setIsAuthenticated(true);
        } else if (isMounted) {
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsAuthenticated(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Login via server-side verification
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUser.trim(),
          password: loginPass,
          remember: isRemember,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setLoginPass('');
        showNotice(data.message || 'স্বাগতম! অ্যাডমিন প্যানেলে সফলভাবে প্রবেশ করেছেন।');
      } else {
        setLoginError(data.error || 'ভুল ইউজারনেম বা পাসওয়ার্ড প্রদান করেছেন!');
      }
    } catch (err) {
      setLoginError('লগইনে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  // Handle Logout via server session termination
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth?action=logout', { method: 'POST' });
    } catch {
      // Ignore network error on logout
    }
    setIsAuthenticated(false);
    setLoginPass('');
    showNotice('অ্যাডমিন প্যানেল থেকে সফলভাবে লগআউট করা হয়েছে');
  };

  // Auto calculate discount percentage when price or originalPrice changes
  const handlePriceChange = (priceVal: number, originalPriceVal: number) => {
    let disc = 0;
    if (originalPriceVal > 0 && priceVal < originalPriceVal) {
      disc = Math.round(((originalPriceVal - priceVal) / originalPriceVal) * 100);
    }
    setBookForm((prev) => ({
      ...prev,
      price: priceVal,
      originalPrice: originalPriceVal,
      discount: disc,
    }));
  };

  // Handle Image File Upload -> Base64
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotice('দয়া করে একটি ছবি ফাইল আপলোড করুন (JPG, PNG, WebP)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      if (result) {
        setter(result);
        showNotice('ছবি সফলভাবে আপলোড হয়েছে!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Book (Create or Edit)
  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    const banglaName = (bookForm.bangla_name || bookForm.title || '').trim();
    const englishName = (bookForm.english_name || '').trim();
    const title = banglaName || englishName;

    if (!title || !bookForm.author.trim()) {
      showNotice('বইয়ের নাম (বাংলা বা ইংরেজি) এবং লেখকের নাম আবশ্যক!', 'error');
      return;
    }

    const tagsArray = bookForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingBookId) {
      // Edit existing
      updateBook(editingBookId, {
        title,
        bangla_name: banglaName,
        english_name: englishName,
        author: bookForm.author.trim(),
        publisher: bookForm.publisher.trim() || 'বাতিঘর',
        category: bookForm.category.trim() || 'উপন্যাস',
        price: Number(bookForm.price),
        originalPrice: Number(bookForm.originalPrice),
        discount: Number(bookForm.discount),
        stock: Number(bookForm.stock),
        isbn: bookForm.isbn.trim() || `978-984-${Math.floor(100000 + Math.random() * 900000)}`,
        pages: Number(bookForm.pages),
        edition: bookForm.edition.trim(),
        language: bookForm.language.trim(),
        description: bookForm.description.trim(),
        image: bookForm.image.trim(),
        tags: tagsArray,
        isBestseller: bookForm.isBestseller,
        isNew: bookForm.isNew,
        isFeatured: bookForm.isFeatured,
        isInternational: bookForm.isInternational,
        sectionIds: bookForm.sectionIds,
      });
      showNotice(`"${title}" সফলভাবে আপডেট করা হয়েছে!`);
    } else {
      // Add new
      addBook({
        title,
        bangla_name: banglaName,
        english_name: englishName,
        author: bookForm.author.trim(),
        publisher: bookForm.publisher.trim() || 'বাতিঘর',
        category: bookForm.category.trim() || 'উপন্যাস',
        price: Number(bookForm.price),
        originalPrice: Number(bookForm.originalPrice),
        discount: Number(bookForm.discount),
        stock: Number(bookForm.stock),
        isbn: bookForm.isbn.trim() || `978-984-${Math.floor(100000 + Math.random() * 900000)}`,
        pages: Number(bookForm.pages),
        edition: bookForm.edition.trim(),
        language: bookForm.language.trim(),
        description: bookForm.description.trim(),
        image: bookForm.image.trim(),
        tags: tagsArray,
        rating: 4.8,
        reviewCount: 1,
        isBestseller: bookForm.isBestseller,
        isNew: bookForm.isNew,
        isFeatured: bookForm.isFeatured,
        isInternational: bookForm.isInternational,
        sectionIds: bookForm.sectionIds,
      });
      showNotice(`"${title}" নতুন বই হিসেবে যুক্ত করা হয়েছে!`);
    }

    setIsBookModalOpen(false);
    setEditingBookId(null);
  };

  // Open Edit Book Modal
  const handleOpenEditBook = (book: Book) => {
    setEditingBookId(book.id);
    setBookForm({
      title: book.title,
      bangla_name: book.bangla_name || book.title || '',
      english_name: book.english_name || '',
      author: book.author,
      publisher: book.publisher || 'বাতিঘর',
      category: book.category,
      price: book.price,
      originalPrice: book.originalPrice || book.price,
      discount: book.discount || 0,
      stock: book.stock,
      isbn: book.isbn || '',
      pages: book.pages || 200,
      edition: book.edition || '১ম সংস্করণ',
      language: book.language || 'বাংলা',
      description: book.description || '',
      image: book.image,
      tags: book.tags ? book.tags.join(', ') : '',
      isBestseller: !!book.isBestseller,
      isNew: !!book.isNew,
      isFeatured: !!book.isFeatured,
      isInternational: !!book.isInternational,
      sectionIds: book.sectionIds || ['new-arrivals'],
    });
    setIsBookModalOpen(true);
  };

  // Open Add Book Modal
  const handleOpenAddBook = () => {
    setEditingBookId(null);
    setBookForm({
      title: '',
      bangla_name: '',
      english_name: '',
      author: authors[0]?.name || 'হুমায়ূন আহমেদ',
      publisher: publishers[0]?.name || 'বাতিঘর',
      category: categories[0]?.name || 'উপন্যাস',
      price: 350,
      originalPrice: 500,
      discount: 30,
      stock: 20,
      isbn: `978-984-${Math.floor(100000 + Math.random() * 900000)}`,
      pages: 220,
      edition: '১ম সংস্করণ',
      language: 'বাংলা',
      description: 'একটি চমৎকার সাহিত্যকর্ম যা পাঠকদের নতুন চিন্তার দিগন্ত উন্মোচন করবে।',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&h=560&q=80',
      tags: 'উপন্যাস, জনপ্রিয়',
      isBestseller: true,
      isNew: true,
      isFeatured: true,
      isInternational: false,
      sectionIds: ['new-arrivals', 'popular'],
    });
    setIsBookModalOpen(true);
  };

  // Banner Handlers
  const handleOpenAddBanner = () => {
    setEditingBannerId(null);
    setBannerForm({
      title: '',
      english_title: '',
      subtitle: '',
      english_subtitle: '',
      bangla_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1600&h=600&q=85',
      english_image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1600&h=600&q=85',
      badge: 'Special Offer',
      link: 'books',
      status: 'active',
      sort_order: (banners.length || 0) + 1,
    });
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBanner = (ban: Banner) => {
    setEditingBannerId(ban.id);
    setBannerForm({
      title: ban.title || '',
      english_title: ban.english_title || '',
      subtitle: ban.subtitle || '',
      english_subtitle: ban.english_subtitle || '',
      bangla_image: ban.bangla_image || '',
      english_image: ban.english_image || '',
      badge: ban.badge || 'Featured',
      link: ban.link || 'books',
      status: ban.status || 'active',
      sort_order: ban.sort_order || 1,
    });
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title.trim() && !bannerForm.english_title.trim()) {
      showNotice('ব্যানারের নাম/শিরোনাম আবশ্যক!', 'error');
      return;
    }
    if (!bannerForm.bangla_image.trim() && !bannerForm.english_image.trim()) {
      showNotice('কমপক্ষে একটি ব্যানার ছবি আপলোড বা লিংক প্রদান করুন!', 'error');
      return;
    }

    const banglaImg = bannerForm.bangla_image.trim() || bannerForm.english_image.trim();
    const englishImg = bannerForm.english_image.trim() || bannerForm.bangla_image.trim();

    if (editingBannerId) {
      updateBanner(editingBannerId, {
        title: bannerForm.title.trim() || bannerForm.english_title.trim(),
        english_title: bannerForm.english_title.trim() || bannerForm.title.trim(),
        subtitle: bannerForm.subtitle.trim(),
        english_subtitle: bannerForm.english_subtitle.trim(),
        bangla_image: banglaImg,
        english_image: englishImg,
        badge: bannerForm.badge.trim(),
        link: bannerForm.link.trim(),
        status: bannerForm.status,
        sort_order: Number(bannerForm.sort_order) || 1,
      });
      showNotice('ব্যানার সফলভাবে আপডেট করা হয়েছে!');
    } else {
      addBanner({
        title: bannerForm.title.trim() || bannerForm.english_title.trim(),
        english_title: bannerForm.english_title.trim() || bannerForm.title.trim(),
        subtitle: bannerForm.subtitle.trim(),
        english_subtitle: bannerForm.english_subtitle.trim(),
        bangla_image: banglaImg,
        english_image: englishImg,
        badge: bannerForm.badge.trim(),
        link: bannerForm.link.trim(),
        status: bannerForm.status,
        sort_order: Number(bannerForm.sort_order) || (banners.length + 1),
      });
      showNotice('নতুন ব্যানার সফলভাবে তৈরি করা হয়েছে!');
    }

    setIsBannerModalOpen(false);
    setEditingBannerId(null);
  };

  // Save Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) {
      showNotice('ক্যাটাগরির নাম আবশ্যক!', 'error');
      return;
    }

    if (editingCatId) {
      updateCategory(editingCatId, {
        name: catForm.name.trim(),
        englishName: catForm.englishName.trim() || catForm.name.trim(),
        iconName: catForm.iconName || 'BookOpen',
        imageUrl: catForm.imageUrl,
      });
      showNotice(`ক্যাটাগরি "${catForm.name}" সফলভাবে আপডেট হয়েছে!`);
    } else {
      addCategory({
        name: catForm.name.trim(),
        englishName: catForm.englishName.trim() || catForm.name.trim(),
        iconName: catForm.iconName || 'BookOpen',
        imageUrl: catForm.imageUrl,
        bookCount: 0,
      });
      showNotice(`নতুন ক্যাটাগরি "${catForm.name}" যুক্ত করা হয়েছে!`);
    }
    setIsCatModalOpen(false);
    setEditingCatId(null);
  };

  // Save Publisher
  const handleSavePublisher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubForm.name.trim()) {
      showNotice('প্রকাশনীর নাম আবশ্যক!', 'error');
      return;
    }

    if (editingPubId) {
      updatePublisher(editingPubId, {
        name: pubForm.name.trim(),
        description: pubForm.description.trim(),
        location: pubForm.location.trim(),
        established: pubForm.established.trim(),
        logo: pubForm.logo,
      });
      showNotice(`প্রকাশনী "${pubForm.name}" আপডেট হয়েছে!`);
    } else {
      addPublisher({
        name: pubForm.name.trim(),
        description: pubForm.description.trim(),
        location: pubForm.location.trim(),
        established: pubForm.established.trim(),
        logo: pubForm.logo,
        bookCount: 0,
      });
      showNotice(`নতুন প্রকাশনী "${pubForm.name}" যুক্ত হয়েছে!`);
    }
    setIsPubModalOpen(false);
    setEditingPubId(null);
  };

  // Save Author
  const handleSaveAuthor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authForm.name.trim()) {
      showNotice('লেখকের নাম আবশ্যক!', 'error');
      return;
    }

    if (editingAuthId) {
      updateAuthor(editingAuthId, {
        name: authForm.name.trim(),
        era: authForm.era.trim(),
        role: authForm.role.trim(),
        bio: authForm.bio.trim(),
        image: authForm.image,
      });
      showNotice(`লেখক "${authForm.name}" আপডেট হয়েছে!`);
    } else {
      addAuthor({
        name: authForm.name.trim(),
        era: authForm.era.trim(),
        role: authForm.role.trim(),
        bio: authForm.bio.trim(),
        image: authForm.image,
        bookCount: 0,
      });
      showNotice(`নতুন লেখক "${authForm.name}" যুক্ত হয়েছে!`);
    }
    setIsAuthModalOpen(false);
    setEditingAuthId(null);
  };

  // Filtered Books List
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchSearch =
        !bookSearch ||
        b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.publisher?.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.isbn?.toLowerCase().includes(bookSearch.toLowerCase());

      const matchCategory =
        bookCategoryFilter === 'all' || b.category === bookCategoryFilter;

      const matchStock =
        bookStockFilter === 'all' ||
        (bookStockFilter === 'low' && b.stock > 0 && b.stock <= 5) ||
        (bookStockFilter === 'out' && b.stock === 0);

      return matchSearch && matchCategory && matchStock;
    });
  }, [books, bookSearch, bookCategoryFilter, bookStockFilter]);

  // Filtered Orders List
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchStatus =
        orderStatusFilter === 'all' || ord.status === orderStatusFilter;
      const matchQuery =
        !orderSearch ||
        ord.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
        ord.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        ord.phone.includes(orderSearch);
      return matchStatus && matchQuery;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // Calculated Stats
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, ord) => sum + (ord.status !== 'cancelled' ? ord.total : 0), 0);
  }, [orders]);

  const lowStockBooks = useMemo(() => {
    return books.filter((b) => b.stock <= 5);
  }, [books]);

  // Handle Export JSON
  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shesher-pata-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('সম্পূর্ণ ডেটাবেজের ব্যাকআপ ফাইল ডাউনলোড সম্পন্ন হয়েছে!');
  };

  // Handle Import JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const content = loadEvt.target?.result as string;
      if (content) {
        const ok = importDataJSON(content);
        if (ok) {
          showNotice('ব্যাকআপ ডেটা সফলভাবে রিস্টোর করা হয়েছে!');
        } else {
          showNotice('অকার্যকর ব্যাকআপ ফাইল!', 'error');
        }
      }
    };
    reader.readAsText(file);
  };

  // -------------------------------------------------------------
  // META PIXEL MANAGEMENT
  // -------------------------------------------------------------
  const [pixelInput, setPixelInput] = useState(siteSettings?.meta_pixel_id || '');
  const [isPixelSaving, setIsPixelSaving] = useState(false);

  useEffect(() => {
    if (siteSettings?.meta_pixel_id !== undefined) {
      setPixelInput(siteSettings.meta_pixel_id);
    }
  }, [siteSettings?.meta_pixel_id]);

  const handleSavePixel = async () => {
    const cleanId = pixelInput.trim();
    setIsPixelSaving(true);
    try {
      await updateSiteSettings({ meta_pixel_id: cleanId });
      showNotice('মেটা পিক্সেল আইডি সফলভাবে সংরক্ষিত হয়েছে!');
    } catch (err) {
      showNotice('পিক্সেল আইডি সংরক্ষণে সমস্যা হয়েছে!', 'error');
    } finally {
      setIsPixelSaving(false);
    }
  };

  const handleEnablePixel = async () => {
    const cleanId = pixelInput.trim();
    if (!cleanId) {
      showNotice('পিক্সেল চালু করার আগে একটি সঠিক পিক্সেল আইডি প্রদান করুন!', 'error');
      return;
    }
    setIsPixelSaving(true);
    try {
      await updateSiteSettings({
        meta_pixel_id: cleanId,
        meta_pixel_enabled: true,
      });
      showNotice('মেটা পিক্সেল সফলভাবে সক্রিয় (Enabled) করা হয়েছে!');
    } catch (err) {
      showNotice('পিক্সেল চালু করতে সমস্যা হয়েছে!', 'error');
    } finally {
      setIsPixelSaving(false);
    }
  };

  const handleDisablePixel = async () => {
    setIsPixelSaving(true);
    try {
      await updateSiteSettings({
        meta_pixel_enabled: false,
      });
      showNotice('মেটা পিক্সেল সফলভাবে নিষ্ক্রিয় (Disabled) করা হয়েছে!');
    } catch (err) {
      showNotice('পিক্সেল বন্ধ করতে সমস্যা হয়েছে!', 'error');
    } finally {
      setIsPixelSaving(false);
    }
  };

  // -------------------------------------------------------------
  // LOGIN SCREEN (if not authenticated)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#12110D] text-white flex flex-col justify-center items-center p-4 selection:bg-amber-500 selection:text-zinc-950">
        <div className="w-full max-w-md bg-[#1D1B15] border border-amber-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-zinc-950 font-black shadow-lg">
              <ShieldCheck className="w-8 h-8 text-zinc-950" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-['Noto_Sans_Bengali']">
              শেষের পাতা — অ্যাডমিন পোর্টাল
            </h1>
            <p className="text-xs text-zinc-400">
              সুরক্ষিত নিয়ন্ত্রণ প্যানেলে প্রবেশ করতে আপনার তথ্য দিন
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                অ্যাডমিন ইউজারনেম (Username)
              </label>
              <input
                type="text"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="ইউজারনেম লিখুন"
                required
                className="w-full px-4 py-2.5 bg-zinc-900/80 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                পাসওয়ার্ড (Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="গোপন পাসওয়ার্ড"
                  required
                  className="w-full px-4 py-2.5 pr-10 bg-zinc-900/80 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRemember}
                  onChange={(e) => setIsRemember(e.target.checked)}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-0"
                />
                <span>আমাকে মনে রাখুন</span>
              </label>
              <span className="text-zinc-500 text-[11px]">শেষের পাতা অফিসিয়াল</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer active:scale-98"
            >
              প্রবেশ করুন (Login)
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-amber-400/80 hover:text-amber-300 transition-colors"
            >
              <span>ওয়েবসাইটে ফিরে যান</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FAF8F4] text-zinc-900 flex flex-col selection:bg-amber-400 selection:text-zinc-950 font-['Noto_Sans_Bengali',sans-serif]">
      {/* Admin Notice Bar */}
      {adminNotice && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 transition-all animate-bounce ${
            adminNotice.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}
        >
          {adminNotice.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          )}
          <span className="text-xs sm:text-sm font-bold">{adminNotice.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-[#191712] text-white border-b border-[#312B1F] sticky top-0 z-40 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-zinc-950 font-black flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  শেষের পাতা
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold">
                  কন্ট্রোল সেন্টার
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                অ্যাডমিন: <strong className="text-white">seshadmin</strong> (সুপার অ্যাডমিন)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>ওয়েবসাইট দেখুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-xs p-3 space-y-1.5 sticky top-20">
            <div className="p-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              মেনু অপশন
            </div>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-zinc-950 shadow-xs'
                  : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>ড্যাশবোর্ড ওভারভিউ</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => setActiveTab('books')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'books'
                  ? 'bg-amber-500 text-zinc-950 shadow-xs'
                  : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4" />
                <span>বই ব্যবস্থাপনা</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-bold">
                {toBengaliNumber(books.length)}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('banners')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'banners'
                  ? 'bg-amber-500 text-zinc-950 shadow-xs'
                  : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4" />
                <span>ব্যানার ও স্লাইডার</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-bold">
                {toBengaliNumber(banners?.length || 0)}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-amber-500 text-zinc-950 shadow-xs'
                  : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderTree className="w-4 h-4" />
                <span>ক্যাটাগরি</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-bold">
                {toBengaliNumber(categories.length)}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('publishers')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'publishers'
                  ? 'bg-amber-500 text-zinc-950 shadow-xs'
                  : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4" />
                <span>প্রকাশনী (Prokashoni)</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-bold">
                {toBengaliNumber(publishers.length)}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('authors')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'authors'
                  ? 'bg-amber-500 text-zinc-950 shadow-xs'
                  : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>লেখক অঙ্গন</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-bold">
                {toBengaliNumber(authors.length)}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-amber-500 text-zinc-950 shadow-xs'
                  : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>অর্ডার তালিকা</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                {toBengaliNumber(orders.length)}
              </span>
            </button>

            <div className="pt-2 border-t border-zinc-100">
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-amber-500 text-zinc-950 shadow-xs'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4" />
                  <span>ডেটা ব্যাকআপ ও সেটিংস</span>
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 min-w-0">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs">
                  <div className="flex items-center justify-between text-zinc-500 text-xs mb-2 font-bold">
                    <span>মোট বিক্রি (বিক্রিত মূল্য)</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-zinc-900">
                    {formatPrice(totalRevenue)}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">সফল ও প্রক্রিয়াধীন অর্ডার থেকে</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs">
                  <div className="flex items-center justify-between text-zinc-500 text-xs mb-2 font-bold">
                    <span>মোট অর্ডার</span>
                    <ShoppingBag className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-zinc-900">
                    {toBengaliNumber(orders.length)} টি
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">গ্রাহকদের প্রাপ্ত অর্ডারসমূহ</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs">
                  <div className="flex items-center justify-between text-zinc-500 text-xs mb-2 font-bold">
                    <span>নথিভুক্ত মোট বই</span>
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-zinc-900">
                    {toBengaliNumber(books.length)} টি
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">ক্যাটালগে সক্রিয় বই</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs">
                  <div className="flex items-center justify-between text-zinc-500 text-xs mb-2 font-bold">
                    <span>স্টক সতর্কতা (&lt; ৫টি)</span>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-rose-600">
                    {toBengaliNumber(lowStockBooks.length)} টি
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">দ্রুত রি-স্টক প্রয়োজন</p>
                </div>
              </div>

              {/* Quick Actions Banner */}
              <div className="p-6 bg-gradient-to-r from-[#1E1B14] to-[#2B2619] rounded-3xl text-white shadow-sm border border-amber-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-zinc-950 text-xs font-black">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>দ্রুত অ্যাকশন</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    নতুন বই বা প্রকাশনী যুক্ত করতে চান?
                  </h3>
                  <p className="text-xs text-zinc-300">
                    ছবি আপলোড ও মূল্য নির্ধারণ করে মুহূর্তে ওয়েবসাইটে লাইভ করুন
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleOpenAddBook}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন বই যোগ করুন</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingCatId(null);
                      setCatForm({
                        name: '',
                        englishName: '',
                        iconName: 'BookOpen',
                        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
                      });
                      setIsCatModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FolderTree className="w-4 h-4" />
                    <span>ক্যাটাগরি তৈরি</span>
                  </button>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-zinc-900">সাম্প্রতিক অর্ডারসমূহ</h3>
                    <p className="text-xs text-zinc-500">গ্রাহকদের সর্বশেষ দেওয়া অর্ডার</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>সকল অর্ডার দেখুন</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 text-zinc-600 font-bold uppercase tracking-wider border-b border-zinc-200">
                      <tr>
                        <th className="py-3 px-3">অর্ডার আইডি</th>
                        <th className="py-3 px-3">গ্রাহক</th>
                        <th className="py-3 px-3">ফোন নম্বর</th>
                        <th className="py-3 px-3">মোট মূল্য</th>
                        <th className="py-3 px-3">পেমেন্ট</th>
                        <th className="py-3 px-3">স্থিতি</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.orderId} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-3 px-3 font-bold text-zinc-900">{ord.orderId}</td>
                          <td className="py-3 px-3 text-zinc-800">{ord.customerName}</td>
                          <td className="py-3 px-3 text-zinc-600">{ord.phone}</td>
                          <td className="py-3 px-3 font-bold text-amber-700">{formatPrice(ord.total)}</td>
                          <td className="py-3 px-3 uppercase text-[10px] font-bold text-zinc-600">
                            {ord.paymentMethod}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                ord.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.status === 'shipped'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : ord.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : ord.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKS MANAGEMENT */}
          {activeTab === 'books' && (
            <div className="space-y-4">
              {/* Books Header & Controls */}
              <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
                      বই তালিকা ও ব্যবস্থাপনা ({toBengaliNumber(filteredBooks.length)} টি বই)
                    </h2>
                    <p className="text-xs text-zinc-500">
                      নতুন বই যোগ করুন, স্টক পরিবর্তন করুন, মূল্য ও ছবি সম্পাদনা করুন
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddBook}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন বই যোগ করুন</span>
                  </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-100">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      placeholder="বইয়ের নাম, লেখক বা ISBN খুঁজুন..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <select
                      value={bookCategoryFilter}
                      onChange={(e) => setBookCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none cursor-pointer"
                    >
                      <option value="all">সকল ক্যাটাগরি</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={bookStockFilter}
                      onChange={(e) => setBookStockFilter(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none cursor-pointer"
                    >
                      <option value="all">সকল স্টক স্থিতি</option>
                      <option value="low">কম স্টক (১ থেকে ৫টি)</option>
                      <option value="out">স্টক শেষ (০টি)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Books Table */}
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F4] text-zinc-700 font-bold uppercase tracking-wider border-b border-zinc-200">
                      <tr>
                        <th className="py-3 px-3">বই ও ছবি</th>
                        <th className="py-3 px-3">লেখক ও প্রকাশনী</th>
                        <th className="py-3 px-3">ক্যাটাগরি</th>
                        <th className="py-3 px-3">বিক্রয়মূল্য</th>
                        <th className="py-3 px-3">স্টক</th>
                        <th className="py-3 px-3">ট্যাগ / ব্যাজ</th>
                        <th className="py-3 px-3 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredBooks.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-zinc-400">
                            কোনো বই পাওয়া যায়নি!
                          </td>
                        </tr>
                      ) : (
                        filteredBooks.map((book) => (
                          <tr key={book.id} className="hover:bg-amber-50/30 transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-15 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0 shadow-2xs">
                                  <img
                                    src={book.image}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="font-bold text-zinc-900 text-sm">
                                    {book.bangla_name || book.title}
                                  </div>
                                  {book.english_name ? (
                                    <div className="text-[11px] font-medium text-amber-800">
                                      EN: {book.english_name}
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-zinc-400 italic">
                                      (No EN name set)
                                    </div>
                                  )}
                                  <div className="text-[10px] text-zinc-400">ISBN: {book.isbn || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-zinc-800">{book.author}</div>
                              <div className="text-[11px] text-zinc-500">{book.publisher || 'বাতিঘর'}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-medium">
                                {book.category}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-zinc-900">{formatPrice(book.price)}</div>
                              {book.originalPrice > book.price && (
                                <div className="text-[10px] text-zinc-400 line-through">
                                  {formatPrice(book.originalPrice)} (-{toBengaliNumber(book.discount)}%)
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateBook(book.id, { stock: Math.max(0, book.stock - 1) })
                                  }
                                  className="w-5 h-5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold flex items-center justify-center cursor-pointer"
                                  title="১ কমান"
                                >
                                  -
                                </button>
                                <span
                                  className={`px-2 py-0.5 rounded font-bold ${
                                    book.stock === 0
                                      ? 'bg-rose-100 text-rose-800'
                                      : book.stock <= 5
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {toBengaliNumber(book.stock)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateBook(book.id, { stock: book.stock + 1 })}
                                  className="w-5 h-5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold flex items-center justify-center cursor-pointer"
                                  title="১ বাড়ান"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex flex-wrap gap-1">
                                {book.isBestseller && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                                    বেস্টসেলার
                                  </span>
                                )}
                                {book.isNew && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                    নতুন
                                  </span>
                                )}
                                {book.isFeatured && (
                                  <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                                    স্পেশাল
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditBook(book)}
                                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-amber-100 hover:text-amber-900 text-zinc-600 transition-colors cursor-pointer"
                                  title="সম্পাদনা করুন"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`আপনি কি "${book.title}" বইটি মুছে ফেলতে নিশ্চিত?`)) {
                                      deleteBook(book.id);
                                      showNotice(`"${book.title}" মুছে ফেলা হয়েছে!`);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-rose-100 hover:text-rose-900 text-zinc-600 transition-colors cursor-pointer"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BANNERS & SLIDERS */}
          {activeTab === 'banners' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
                    ব্যানার ও স্লাইডার ব্যবস্থাপনা ({toBengaliNumber(banners?.length || 0)} টি)
                  </h2>
                  <p className="text-xs text-zinc-500">
                    বাংলা ও ইংরেজি উভয় ভাষার জন্য পৃথক ব্যানার ইমেজ, শিরোনাম ও অফার ব্যানার নিয়ন্ত্রণ করুন
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddBanner}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন ব্যানার যোগ করুন</span>
                </button>
              </div>

              {/* Banners List */}
              <div className="grid grid-cols-1 gap-4">
                {(!banners || banners.length === 0) ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 text-zinc-400">
                    কোনো ব্যানার পাওয়া যায়নি!
                  </div>
                ) : (
                  banners.map((ban) => (
                    <div
                      key={ban.id}
                      className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-amber-300 transition-all"
                    >
                      {/* Image Previews: Side by Side (Bangla & English) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-3/5 shrink-0">
                        {/* Bangla Banner */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600">
                            <span className="flex items-center gap-1">
                              <span>🇧🇩 বাংলা ব্যানার</span>
                            </span>
                          </div>
                          <div className="relative aspect-16/7 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-2xs">
                            <img
                              src={ban.bangla_image || ban.english_image}
                              alt={ban.title}
                              className="w-full h-full object-cover"
                            />
                            {!ban.bangla_image && (
                              <span className="absolute inset-0 bg-black/60 text-white text-[10px] flex items-center justify-center font-bold">
                                (English fallback used)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* English Banner */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600">
                            <span className="flex items-center gap-1">
                              <span>🇬🇧 English Banner</span>
                            </span>
                          </div>
                          <div className="relative aspect-16/7 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-2xs">
                            <img
                              src={ban.english_image || ban.bangla_image}
                              alt={ban.english_title || ban.title}
                              className="w-full h-full object-cover"
                            />
                            {!ban.english_image && (
                              <span className="absolute inset-0 bg-black/60 text-white text-[10px] flex items-center justify-center font-bold">
                                (Bangla fallback used)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Banner Details */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ban.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            {ban.status === 'active' ? 'সক্রিয় / Active' : 'নিষ্ক্রিয় / Inactive'}
                          </span>
                          {ban.badge && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black">
                              {ban.badge}
                            </span>
                          )}
                          <span className="text-[11px] text-zinc-400 font-bold">
                            ক্রম: #{toBengaliNumber(ban.sort_order)}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-zinc-900 text-sm">{ban.title}</h4>
                          {ban.english_title && (
                            <p className="text-xs font-semibold text-amber-800">
                              EN: {ban.english_title}
                            </p>
                          )}
                          <p className="text-xs text-zinc-500 mt-0.5">{ban.subtitle}</p>
                          {ban.english_subtitle && (
                            <p className="text-[11px] text-zinc-400 italic">
                              {ban.english_subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditBanner(ban)}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>সম্পাদনা</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`আপনি কি "${ban.title}" ব্যানারটি মুছে ফেলতে নিশ্চিত?`)) {
                              deleteBanner(ban.id);
                              showNotice('ব্যানার সফলভাবে মুছে ফেলা হয়েছে!');
                            }
                          }}
                          className="p-2 rounded-xl bg-zinc-100 hover:bg-rose-100 text-zinc-600 hover:text-rose-900 cursor-pointer transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
                    ক্যাটাগরি তালিকা ({toBengaliNumber(categories.length)} টি)
                  </h2>
                  <p className="text-xs text-zinc-500">
                    ওয়েবসাইটের বই ক্যাটাগরি এবং ফিল্টার পরিচালনা করুন
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingCatId(null);
                    setCatForm({
                      name: '',
                      englishName: '',
                      iconName: 'BookOpen',
                      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
                    });
                    setIsCatModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন ক্যাটাগরি</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs flex items-center justify-between gap-3 hover:border-amber-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-amber-50 border border-amber-200/80 shrink-0">
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 text-sm">{cat.name}</h4>
                        <p className="text-xs text-zinc-400">{cat.englishName}</p>
                        <span className="text-[10px] text-amber-700 font-bold">
                          {toBengaliNumber(cat.bookCount || 0)} টি বই
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCatId(cat.id);
                          setCatForm({
                            name: cat.name,
                            englishName: cat.englishName,
                            iconName: cat.iconName || 'BookOpen',
                            imageUrl: cat.imageUrl,
                          });
                          setIsCatModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-zinc-100 hover:bg-amber-100 hover:text-amber-900 text-zinc-600 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`আপনি কি "${cat.name}" ক্যাটাগরিটি মুছে ফেলতে চান?`)) {
                            deleteCategory(cat.id);
                            showNotice(`ক্যাটাগরি "${cat.name}" মুছে ফেলা হয়েছে!`);
                          }
                        }}
                        className="p-2 rounded-xl bg-zinc-100 hover:bg-rose-100 hover:text-rose-900 text-zinc-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PUBLISHERS (PROKASHONI) */}
          {activeTab === 'publishers' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
                    প্রকাশনী তালিকা ({toBengaliNumber(publishers.length)} টি প্রকাশনী)
                  </h2>
                  <p className="text-xs text-zinc-500">
                    সকল প্রকাশনা সংস্থা (Prokashoni) পরিচালনা ও নতুন প্রকাশনী যুক্ত করুন
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingPubId(null);
                    setPubForm({
                      name: '',
                      description: '',
                      location: 'ঢাকা',
                      established: '২০১২',
                      logo: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=120&q=80',
                    });
                    setIsPubModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন প্রকাশনী</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {publishers.map((pub) => (
                  <div
                    key={pub.id}
                    className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs flex flex-col justify-between gap-4 hover:border-amber-300 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-amber-50 border border-amber-200 shrink-0">
                        <img src={pub.logo} alt={pub.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-zinc-900 text-sm">{pub.name}</h4>
                        <p className="text-xs text-zinc-400">
                          {pub.location} • প্রতিষ্ঠা: {pub.established}
                        </p>
                        <p className="text-xs text-zinc-600 mt-1 line-clamp-2">
                          {pub.description || 'আস্থার নির্ভরযোগ্য প্রকাশনী।'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                      <span className="text-amber-700 font-bold">
                        {toBengaliNumber(books.filter((b) => b.publisher === pub.name).length)} টি বই ক্যাটালগে
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPubId(pub.id);
                            setPubForm({
                              name: pub.name,
                              description: pub.description || '',
                              location: pub.location || 'ঢাকা',
                              established: pub.established || '',
                              logo: pub.logo || '',
                            });
                            setIsPubModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-amber-100 hover:text-amber-900 text-zinc-600 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`আপনি কি "${pub.name}" প্রকাশনীটি মুছে ফেলতে চান?`)) {
                              deletePublisher(pub.id);
                              showNotice(`প্রকাশনী "${pub.name}" মুছে ফেলা হয়েছে!`);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-rose-100 hover:text-rose-900 text-zinc-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AUTHORS */}
          {activeTab === 'authors' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
                    লেখক তালিকা ({toBengaliNumber(authors.length)} জন লেখক)
                  </h2>
                  <p className="text-xs text-zinc-500">
                    জনপ্রিয় লেখক ও তাঁদের জীবনী, ছবি এবং তথ্যাবলি পরিচালনা করুন
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingAuthId(null);
                    setAuthForm({
                      name: '',
                      era: '',
                      role: 'কথাসাহিত্যিক ও লেখক',
                      bio: '',
                      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
                    });
                    setIsAuthModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন লেখক</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {authors.map((auth) => (
                  <div
                    key={auth.id}
                    className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs flex flex-col justify-between gap-4 hover:border-amber-300 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-amber-50 border border-amber-200 shrink-0 shadow-2xs">
                        <img src={auth.image} alt={auth.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-zinc-900 text-sm">{auth.name}</h4>
                        <p className="text-[11px] text-zinc-400">{auth.era}</p>
                        <p className="text-xs text-amber-800 font-medium">{auth.role}</p>
                        <p className="text-xs text-zinc-600 mt-1 line-clamp-2">{auth.bio}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-bold">
                        বই: {toBengaliNumber(books.filter((b) => b.author.includes(auth.name)).length)} টি
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAuthId(auth.id);
                            setAuthForm({
                              name: auth.name,
                              era: auth.era,
                              role: auth.role,
                              bio: auth.bio,
                              image: auth.image,
                            });
                            setIsAuthModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-amber-100 hover:text-amber-900 text-zinc-600 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`আপনি কি "${auth.name}" লেখককে মুছে ফেলতে চান?`)) {
                              deleteAuthor(auth.id);
                              showNotice(`লেখক "${auth.name}" মুছে ফেলা হয়েছে!`);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-rose-100 hover:text-rose-900 text-zinc-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
                      অর্ডার তালিকা ({toBengaliNumber(filteredOrders.length)} টি অর্ডার)
                    </h2>
                    <p className="text-xs text-zinc-500">
                      গ্রাহকদের অর্ডার স্থিতি পরিবর্তন করুন এবং চালান (Invoice) প্রিন্ট করুন
                    </p>
                  </div>
                </div>

                {/* Order Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-100">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="অর্ডার আইডি, গ্রাহকের নাম বা ফোন দিয়ে খুঁজুন..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none cursor-pointer"
                    >
                      <option value="all">সকল অর্ডার স্থিতি (Status)</option>
                      <option value="pending">প্রক্রিয়াধীন (Pending)</option>
                      <option value="confirmed">নিশ্চিত (Confirmed)</option>
                      <option value="shipped">কুরিয়ারে হস্তান্তর (Shipped)</option>
                      <option value="delivered">ডেলিভারি সম্পন্ন (Delivered)</option>
                      <option value="cancelled">বাতিল (Cancelled)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Order Cards */}
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white p-10 rounded-3xl border border-zinc-200 text-center text-zinc-400 text-xs">
                    কোনো অর্ডার পাওয়া যায়নি!
                  </div>
                ) : (
                  filteredOrders.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="bg-white rounded-3xl border border-zinc-200 shadow-xs p-5 space-y-4 hover:border-amber-300 transition-all"
                    >
                      {/* Top bar of order card */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-zinc-950 text-sm">{ord.orderId}</span>
                          <span className="text-xs text-zinc-400">• {ord.date}</span>
                          <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-bold uppercase">
                            {ord.paymentMethod}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-xs text-zinc-500 font-semibold">স্থিতি পরিবর্তন:</label>
                          <select
                            value={ord.status}
                            onChange={(e) => {
                              updateOrderStatus(ord.orderId, e.target.value as any);
                              showNotice(`অর্ডার ${ord.orderId} স্থিতি আপডেট করা হয়েছে!`);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
                              ord.status === 'delivered'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                : ord.status === 'shipped'
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                                : ord.status === 'confirmed'
                                ? 'bg-blue-50 border-blue-300 text-blue-900'
                                : ord.status === 'cancelled'
                                ? 'bg-rose-50 border-rose-300 text-rose-900'
                                : 'bg-amber-50 border-amber-300 text-amber-900'
                            }`}
                          >
                            <option value="pending">অপেক্ষমাণ (Pending)</option>
                            <option value="confirmed">নিশ্চিত (Confirmed)</option>
                            <option value="shipped">কুরিয়ারে (Shipped)</option>
                            <option value="delivered">ডেলিভার্ড (Delivered)</option>
                            <option value="cancelled">বাতিল (Cancelled)</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => setSelectedOrderForInvoice(ord)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-amber-100 hover:text-amber-900 text-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="ইনভয়েস বা চালান প্রিন্ট করুন"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>চালান</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`আপনি কি অর্ডার ${ord.orderId} মুছে ফেলতে চান?`)) {
                                deleteOrder(ord.orderId);
                                showNotice(`অর্ডার ${ord.orderId} মুছে ফেলা হয়েছে!`);
                              }
                            }}
                            className="p-1.5 rounded-xl bg-zinc-100 hover:bg-rose-100 hover:text-rose-900 text-zinc-600 transition-colors cursor-pointer"
                            title="অর্ডার মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Customer & Address details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1 bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                          <p className="font-bold text-zinc-900 text-sm">{ord.customerName}</p>
                          <p className="text-zinc-600">
                            <strong>ফোন:</strong> {ord.phone}
                          </p>
                          {ord.email && (
                            <p className="text-zinc-600">
                              <strong>ইমেইল:</strong> {ord.email}
                            </p>
                          )}
                          <p className="text-zinc-600">
                            <strong>ঠিকানা:</strong> {ord.address}, {ord.thana}, {ord.district}
                          </p>
                          {ord.orderNotes && (
                            <p className="text-amber-800 bg-amber-50 p-1.5 rounded-lg mt-1 font-medium">
                              নোট: {ord.orderNotes}
                            </p>
                          )}
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                          <div className="font-bold text-zinc-700">অর্ডারকৃত বইসমূহ:</div>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {ord.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-2 p-1.5 bg-zinc-50 rounded-xl border border-zinc-100"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <img
                                    src={item.book.image}
                                    alt={item.book.title}
                                    className="w-7 h-9 rounded object-cover border shrink-0"
                                  />
                                  <span className="font-semibold text-zinc-900 truncate">
                                    {item.book.title}
                                  </span>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-zinc-500">
                                    {toBengaliNumber(item.quantity)} × {formatPrice(item.book.price)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 flex justify-between items-center text-xs font-bold border-t border-zinc-100">
                            <span className="text-zinc-500">
                              ডেলিভারি ফি: {formatPrice(ord.deliveryFee)}
                            </span>
                            <span className="text-sm text-zinc-950">
                              সর্বমোট: <strong className="text-amber-700">{formatPrice(ord.total)}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS & BACKUP */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs space-y-2">
                <h2 className="text-xl font-bold text-zinc-900">সেটিংস ও ব্যাকআপ (Settings)</h2>
                <p className="text-xs sm:text-sm text-zinc-500">
                  ওয়েবসাইটের মেটা পিক্সেল ট্র্যাকিং কনফিগারেশন, ডেটা ব্যাকআপ ও সিস্টেম রিস্টোর পরিচালনা করুন
                </p>
              </div>

              {/* --------------------------------------------------------- */}
              {/* SECTION: SETTINGS -> META PIXEL */}
              {/* --------------------------------------------------------- */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-zinc-200 shadow-xs space-y-6">
                {/* Header & Status Indicator */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900">সেটিংস → মেটা পিক্সেল (Meta Pixel)</h3>
                    </div>
                    <p className="text-xs text-zinc-500">
                      ফেসবুক ও ইনস্টাগ্রাম বিজ্ঞাপনের জন্য ভিজিটর ট্র্যাকিং ও কনভার্সন অপটিমাইজেশন পরিচালনা করুন
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-3 self-start sm:self-auto bg-zinc-50 px-3.5 py-2 rounded-2xl border border-zinc-200/80">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          siteSettings?.meta_pixel_enabled && siteSettings?.meta_pixel_id
                            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse'
                            : 'bg-zinc-400'
                        }`}
                      />
                      <span className="text-xs font-semibold text-zinc-700">স্ট্যাটাস:</span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        siteSettings?.meta_pixel_enabled && siteSettings?.meta_pixel_id
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {siteSettings?.meta_pixel_enabled && siteSettings?.meta_pixel_id ? 'সক্রিয় (Enabled)' : 'নিষ্ক্রিয় (Disabled)'}
                    </span>
                  </div>
                </div>

                {/* Configuration Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#FAF8F4] rounded-2xl border border-amber-900/10 text-xs">
                  <div>
                    <span className="text-zinc-500 block">বর্তমান পিক্সেল আইডি (Current Pixel ID):</span>
                    <span className="font-mono font-bold text-zinc-900 text-sm">
                      {siteSettings?.meta_pixel_id || 'কোনো পিক্সেল আইডি সংরক্ষিত নেই'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">সর্বশেষ আপডেট (Last Updated):</span>
                    <span className="font-medium text-zinc-800">
                      {siteSettings?.updated_at
                        ? new Date(siteSettings.updated_at).toLocaleString('bn-BD')
                        : '—'}
                    </span>
                  </div>
                </div>

                {/* Pixel ID Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-700">
                    মেটা পিক্সেল আইডি (Meta Pixel ID)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pixelInput}
                      onChange={(e) => setPixelInput(e.target.value.replace(/\s+/g, ''))}
                      placeholder="যেমন: 123456789012345"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-300 bg-zinc-50 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm transition-all font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    মেটা ইভেন্টস ম্যানেজার (Meta Events Manager) থেকে আপনার পিক্সেল আইডি কপি করে এখানে দিন।
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    disabled={isPixelSaving}
                    onClick={handleSavePixel}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all shadow-sm active:scale-98 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isPixelSaving ? 'সংরক্ষণ হচ্ছে...' : 'পিক্সেল সংরক্ষণ করুন (Save Pixel)'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isPixelSaving || !pixelInput.trim()}
                    onClick={handleEnablePixel}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all shadow-sm active:scale-98 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>পিক্সেল চালু করুন (Enable Pixel)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isPixelSaving}
                    onClick={handleDisablePixel}
                    className="px-5 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                  >
                    <EyeOff className="w-4 h-4" />
                    <span>পিক্সেল বন্ধ করুন (Disable Pixel)</span>
                  </button>
                </div>

                {/* Automated Events Information */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 text-xs text-blue-900 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-blue-950">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>স্বয়ংক্রিয় ইভেন্ট ট্র্যাকিং সক্রিয় রয়েছে (Automatic Event Tracking):</span>
                  </div>
                  <p className="text-[11px] text-blue-800/80 leading-relaxed">
                    পিক্সেল চালু থাকা অবস্থায় ওয়েবসাইটের প্রধান প্রধান কার্যকলাপ স্বয়ংক্রিয়ভাবে মেটা ইভেন্টস ম্যানেজারে পৌঁছাবে:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                    <span className="bg-white px-2.5 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">✓</span> PageView
                    </span>
                    <span className="bg-white px-2.5 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">✓</span> ViewContent
                    </span>
                    <span className="bg-white px-2.5 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">✓</span> Search
                    </span>
                    <span className="bg-white px-2.5 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">✓</span> AddToCart
                    </span>
                    <span className="bg-white px-2.5 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">✓</span> InitiateCheckout
                    </span>
                    <span className="bg-white px-2.5 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">✓</span> Purchase
                    </span>
                    <span className="bg-white px-2.5 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">✓</span> CompleteRegistration
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Card */}
                <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                      <Download className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-900">JSON ব্যাকআপ ডাউনলোড</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      বর্তমান সকল বই, ক্যাটাগরি, লেখক, প্রকাশনী এবং গ্রাহকের অর্ডারের একটি সম্পূর্ণ কপি .json ফাইল হিসেবে ডাউনলোড করুন।
                    </p>
                  </div>
                  <button
                    onClick={handleExport}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>ব্যাকআপ ডাউনলোড করুন</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-900">JSON ব্যাকআপ থেকে রিস্টোর</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      পূর্বে ডাউনলোড করা ব্যাকআপ .json ফাইল আপলোড করে সকল বই ও ডেটা পুনরুদ্ধার করুন।
                    </p>
                  </div>
                  <label className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98">
                    <Upload className="w-4 h-4" />
                    <span>ফাইল নির্বাচন ও রিস্টোর</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-rose-50/60 p-6 rounded-3xl border border-rose-200 shadow-xs space-y-4">
                <div className="flex items-center gap-3 text-rose-900">
                  <AlertCircle className="w-6 h-6 text-rose-600" />
                  <div>
                    <h3 className="text-base font-bold">ফ্যাক্টরি রিসেট (Factory Reset)</h3>
                    <p className="text-xs text-rose-700">
                      সতর্কতা: এটি আপনার সংরক্ষিত নতুন বই এবং স্থানীয় পরিবর্তন মুছে দিয়ে মূল ডিফল্ট ডেটায় ফিরিয়ে নিয়ে যাবে।
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        'আপনি কি নিশ্চিতভাবে সকল ডেটা মুছে মূল ফ্যাক্টরি সেটিংসে রিসেট করতে চান? এই প্রক্রিয়া ফেরানো যাবে না।'
                      )
                    ) {
                      resetAllData();
                      showNotice('ডেটাবেজ সফলভাবে ফ্যাক্টরি রিসেট করা হয়েছে!');
                    }
                  }}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>মূল ফ্যাক্টরি ডেটায় ফিরিয়ে নিন</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: ADD / EDIT BOOK */}
      {/* ------------------------------------------------------------- */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 my-auto max-h-[95vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-[#FAF8F4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-zinc-900">
                  {editingBookId ? 'বই সম্পাদনা করুন' : 'নতুন বই যুক্ত করুন'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {/* Row 1: Bilingual Book Names */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>বইয়ের নাম নির্ধারণ (Bangla & English Titles)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      🇧🇩 বাংলা বইয়ের নাম (Bangla Book Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={bookForm.bangla_name}
                      onChange={(e) =>
                        setBookForm({
                          ...bookForm,
                          bangla_name: e.target.value,
                          title: e.target.value || bookForm.english_name,
                        })
                      }
                      placeholder="যেমন: শেষ বিকেলের গল্প"
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs sm:text-sm bg-white focus:border-amber-500 outline-none"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">বাংলা মোডে এই নামটি প্রদর্শিত হবে</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      🇬🇧 ইংরেজি বইয়ের নাম (English Book Name)
                    </label>
                    <input
                      type="text"
                      value={bookForm.english_name}
                      onChange={(e) =>
                        setBookForm({
                          ...bookForm,
                          english_name: e.target.value,
                          title: bookForm.bangla_name || e.target.value,
                        })
                      }
                      placeholder="e.g. Stories of the Last Evening"
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs sm:text-sm bg-white focus:border-amber-500 outline-none font-sans"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">ইংরেজি মোডে এই নামটি প্রদর্শিত হবে</p>
                  </div>
                </div>
              </div>

              {/* Row 2: Author */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  লেখকের নাম (Author) *
                </label>
                <input
                  type="text"
                  required
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  placeholder="যেমন: হুমায়ূন আহমেদ / Haruki Murakami"
                  list="authors-list"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs sm:text-sm bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                />
                <datalist id="authors-list">
                  {authors.map((a) => (
                    <option key={a.id} value={a.name} />
                  ))}
                </datalist>
              </div>

              {/* Row 2: Publisher & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    প্রকাশনী (Publisher / Prokashoni)
                  </label>
                  <input
                    type="text"
                    value={bookForm.publisher}
                    onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                    placeholder="যেমন: বাতিঘর"
                    list="publishers-list"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs sm:text-sm bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                  />
                  <datalist id="publishers-list">
                    {publishers.map((p) => (
                      <option key={p.id} value={p.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    ক্যাটাগরি (Category)
                  </label>
                  <select
                    value={bookForm.category}
                    onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs sm:text-sm bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Pricing & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    বিক্রয়মূল্য (৳ Selling) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={bookForm.price}
                    onChange={(e) =>
                      handlePriceChange(Number(e.target.value), bookForm.originalPrice)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs sm:text-sm font-bold bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    গায়ের মূল্য (৳ MRP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bookForm.originalPrice}
                    onChange={(e) =>
                      handlePriceChange(bookForm.price, Number(e.target.value))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs sm:text-sm bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    ছাড় (% Discount)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={bookForm.discount}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, discount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs sm:text-sm bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    স্টক সংখ্যা (Stock) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={bookForm.stock}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, stock: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs sm:text-sm font-bold bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Image Upload with Preview */}
              <div className="p-4 bg-[#FAF8F4] rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>বইয়ের কভার ছবি (Image Upload / URL)</span>
                  </label>
                  <span className="text-[11px] text-zinc-500">সরাসরি ফাইল আপলোড বা লিংক দিন</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Image Preview Box */}
                  <div className="w-20 h-28 rounded-xl overflow-hidden bg-zinc-200 border-2 border-dashed border-amber-300 shrink-0 relative flex items-center justify-center">
                    {bookForm.image ? (
                      <img
                        src={bookForm.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    {/* File Upload Button */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => bookImageInputRef.current?.click()}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>কম্পিউটার থেকে ছবি আপলোড করুন</span>
                      </button>
                      <input
                        type="file"
                        ref={bookImageInputRef}
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUpload(e, (url) => setBookForm((prev) => ({ ...prev, image: url })))
                        }
                        className="hidden"
                      />
                    </div>

                    {/* Or URL input */}
                    <div>
                      <input
                        type="text"
                        value={bookForm.image}
                        onChange={(e) => setBookForm({ ...bookForm, image: e.target.value })}
                        placeholder="অথবা ছবির সরাসরি URL লিংক দিন (https://...)"
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-xs bg-white focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 5: ISBN, Pages, Language, Edition */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">ISBN নম্বর</label>
                  <input
                    type="text"
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                    placeholder="978-984-..."
                    className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">পৃষ্ঠা সংখ্যা</label>
                  <input
                    type="number"
                    value={bookForm.pages}
                    onChange={(e) => setBookForm({ ...bookForm, pages: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">সংস্করণ</label>
                  <input
                    type="text"
                    value={bookForm.edition}
                    onChange={(e) => setBookForm({ ...bookForm, edition: e.target.value })}
                    placeholder="১ম সংস্করণ"
                    className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">ভাষা</label>
                  <input
                    type="text"
                    value={bookForm.language}
                    onChange={(e) => setBookForm({ ...bookForm, language: e.target.value })}
                    placeholder="বাংলা"
                    className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Row 6: Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  বইয়ের সংক্ষিপ্ত বিবরণ (Description)
                </label>
                <textarea
                  rows={3}
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  placeholder="বইটির বিষয়বস্তু, সারসংক্ষেপ ও পাঠকদের জন্য আকর্ষণীয় বর্ণনা..."
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none resize-none"
                />
              </div>

              {/* Row 7: Tags & Badges */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  value={bookForm.tags}
                  onChange={(e) => setBookForm({ ...bookForm, tags: e.target.value })}
                  placeholder="উপন্যাস, রোমাঞ্চ, বেস্টসেলার"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-zinc-100 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookForm.isBestseller}
                    onChange={(e) => setBookForm({ ...bookForm, isBestseller: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span className="font-bold text-zinc-800">বেস্টসেলার বই (Bestseller)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookForm.isNew}
                    onChange={(e) => setBookForm({ ...bookForm, isNew: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span className="font-bold text-zinc-800">নতুন প্রকাশনা (New Release)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookForm.isFeatured}
                    onChange={(e) => setBookForm({ ...bookForm, isFeatured: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span className="font-bold text-zinc-800">ফিচার্ড / হোমপেজ সংগ্রহ</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookForm.isInternational}
                    onChange={(e) => setBookForm({ ...bookForm, isInternational: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span className="font-bold text-zinc-800">আন্তর্জাতিক / অনুবাদ গ্রন্থ</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingBookId ? 'পরিবর্তন সংরক্ষণ করুন' : 'বই আপলোড সম্পন্ন করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT BANNER (Bilingual Support) */}
      {/* ------------------------------------------------------------- */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 my-auto max-h-[95vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-[#FAF8F4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-zinc-900">
                  {editingBannerId ? 'ব্যানার সম্পাদনা করুন' : 'নতুন ব্যানার যোগ করুন'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {/* Titles Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    🇧🇩 বাংলা শিরোনাম (Bangla Headline) *
                  </label>
                  <input
                    type="text"
                    required
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    placeholder="যেমন: স্টুডিও জিবলি বিশেষ আর্ট কালেকশন"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs sm:text-sm bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    🇬🇧 ইংরেজি শিরোনাম (English Headline)
                  </label>
                  <input
                    type="text"
                    value={bannerForm.english_title}
                    onChange={(e) => setBannerForm({ ...bannerForm, english_title: e.target.value })}
                    placeholder="e.g. Studio Ghibli Inspired Collection"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs sm:text-sm bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none font-sans"
                  />
                </div>
              </div>

              {/* Subtitles Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    বাংলা সাব-হেডিং (Bangla Subtitle)
                  </label>
                  <input
                    type="text"
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                    placeholder="যেমন: নোটবুক, বুকমার্ক ও মেমোপ্যাড কালেকশন"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs sm:text-sm bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    ইংরেজি সাব-হেডিং (English Subtitle)
                  </label>
                  <input
                    type="text"
                    value={bannerForm.english_subtitle}
                    onChange={(e) => setBannerForm({ ...bannerForm, english_subtitle: e.target.value })}
                    placeholder="e.g. Notebooks • Bookmarks • Memopads"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs sm:text-sm bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none font-sans"
                  />
                </div>
              </div>

              {/* Bilingual Banner Images Upload & URL Section */}
              <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-amber-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>ভাষানুযায়ী ব্যানার ছবি (Bilingual Banner Images)</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">অনুপাত: ১৬:৬ (১৬০০×৬০০ পিক্সেল)</span>
                </div>

                {/* Bangla Banner Upload */}
                <div className="space-y-2 p-3 bg-white rounded-xl border border-zinc-200">
                  <label className="block text-xs font-bold text-zinc-800">
                    🇧🇩 বাংলা মোডের ব্যানার ছবি (Bangla Banner Image) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={bannerForm.bangla_image}
                      onChange={(e) => setBannerForm({ ...bannerForm, bangla_image: e.target.value })}
                      placeholder="https://... অথবা কম্পিউটার থেকে আপলোড করুন"
                      className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white outline-none"
                    />
                    <label className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>আপলোড</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={(e) =>
                          handleFileUpload(e, (url) =>
                            setBannerForm((prev) => ({ ...prev, bangla_image: url }))
                          )
                        }
                        className="hidden"
                      />
                    </label>
                  </div>

                  {bannerForm.bangla_image && (
                    <div className="relative aspect-16/6 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 mt-1 max-h-36">
                      <img
                        src={bannerForm.bangla_image}
                        alt="Bangla Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* English Banner Upload */}
                <div className="space-y-2 p-3 bg-white rounded-xl border border-zinc-200">
                  <label className="block text-xs font-bold text-zinc-800">
                    🇬🇧 ইংরেজি মোডের ব্যানার ছবি (English Banner Image)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={bannerForm.english_image}
                      onChange={(e) => setBannerForm({ ...bannerForm, english_image: e.target.value })}
                      placeholder="https://... অথবা কম্পিউটার থেকে আপলোড করুন"
                      className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white outline-none"
                    />
                    <label className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>আপলোড</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={(e) =>
                          handleFileUpload(e, (url) =>
                            setBannerForm((prev) => ({ ...prev, english_image: url }))
                          )
                        }
                        className="hidden"
                      />
                    </label>
                  </div>

                  {bannerForm.english_image && (
                    <div className="relative aspect-16/6 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 mt-1 max-h-36">
                      <img
                        src={bannerForm.english_image}
                        alt="English Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Status, Sort Order, Badge, Link */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">স্থিতি / Status</label>
                  <select
                    value={bannerForm.status}
                    onChange={(e) =>
                      setBannerForm({ ...bannerForm, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white outline-none"
                  >
                    <option value="active">সক্রিয় / Active</option>
                    <option value="inactive">নিষ্ক্রিয় / Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">ক্রম / Sort Order</label>
                  <input
                    type="number"
                    min={1}
                    value={bannerForm.sort_order}
                    onChange={(e) =>
                      setBannerForm({ ...bannerForm, sort_order: Number(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">ব্যাজ / Badge</label>
                  <input
                    type="text"
                    value={bannerForm.badge}
                    onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                    placeholder="যেমন: Special Offer"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">লিংক / Target</label>
                  <select
                    value={bannerForm.link}
                    onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white outline-none"
                  >
                    <option value="books">বইসমূহ / Books</option>
                    <option value="offers">অফার / Offers</option>
                    <option value="stationery">স্টেশনারি / Stationery</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingBannerId ? 'পরিবর্তন সংরক্ষণ করুন' : 'ব্যানার সংরক্ষণ সম্পন্ন করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: ADD / EDIT CATEGORY */}
      {/* ------------------------------------------------------------- */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-base text-zinc-900">
                {editingCatId ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি যুক্ত করুন'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  ক্যাটাগরির বাংলা নাম *
                </label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="যেমন: সমকালীন উপন্যাস"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  ইংরেজি নাম / স্লাগ (English Name)
                </label>
                <input
                  type="text"
                  value={catForm.englishName}
                  onChange={(e) => setCatForm({ ...catForm, englishName: e.target.value })}
                  placeholder="যেমন: Contemporary Novel"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">কভার ছবি</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={catForm.imageUrl}
                    onChange={(e) => setCatForm({ ...catForm, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => catImageInputRef.current?.click()}
                    className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    ফাইল
                  </button>
                  <input
                    type="file"
                    ref={catImageInputRef}
                    accept="image/*"
                    onChange={(e) =>
                      handleFileUpload(e, (url) => setCatForm((prev) => ({ ...prev, imageUrl: url })))
                    }
                    className="hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-md cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: ADD / EDIT PUBLISHER */}
      {/* ------------------------------------------------------------- */}
      {isPubModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-base text-zinc-900">
                {editingPubId ? 'প্রকাশনী সম্পাদনা' : 'নতুন প্রকাশনী (Prokashoni) যোগ করুন'}
              </h3>
              <button
                type="button"
                onClick={() => setIsPubModalOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePublisher} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  প্রকাশনীর নাম *
                </label>
                <input
                  type="text"
                  required
                  value={pubForm.name}
                  onChange={(e) => setPubForm({ ...pubForm, name: e.target.value })}
                  placeholder="যেমন: বাতিঘর, প্রথমা, অনন্যা"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">অবস্থান</label>
                  <input
                    type="text"
                    value={pubForm.location}
                    onChange={(e) => setPubForm({ ...pubForm, location: e.target.value })}
                    placeholder="ঢাকা"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">প্রতিষ্ঠা সাল</label>
                  <input
                    type="text"
                    value={pubForm.established}
                    onChange={(e) => setPubForm({ ...pubForm, established: e.target.value })}
                    placeholder="২০০৫"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">সংক্ষিপ্ত বিবরণ</label>
                <textarea
                  rows={2}
                  value={pubForm.description}
                  onChange={(e) => setPubForm({ ...pubForm, description: e.target.value })}
                  placeholder="প্রকাশনীর বিশেষত্ব ও পরিচিতি..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">লোগো / ছবি</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={pubForm.logo}
                    onChange={(e) => setPubForm({ ...pubForm, logo: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => pubImageInputRef.current?.click()}
                    className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    ফাইল
                  </button>
                  <input
                    type="file"
                    ref={pubImageInputRef}
                    accept="image/*"
                    onChange={(e) =>
                      handleFileUpload(e, (url) => setPubForm((prev) => ({ ...prev, logo: url })))
                    }
                    className="hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPubModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-md cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: ADD / EDIT AUTHOR */}
      {/* ------------------------------------------------------------- */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-base text-zinc-900">
                {editingAuthId ? 'লেখক সম্পাদনা' : 'নতুন লেখক যুক্ত করুন'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAuthor} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">লেখকের নাম *</label>
                <input
                  type="text"
                  required
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  placeholder="যেমন: হুমায়ূন আহমেদ"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">জীবৎকাল / সাল</label>
                  <input
                    type="text"
                    value={authForm.era}
                    onChange={(e) => setAuthForm({ ...authForm, era: e.target.value })}
                    placeholder="১৯৪৮ – ২০১২"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">উপাধি / পরিচয়</label>
                  <input
                    type="text"
                    value={authForm.role}
                    onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                    placeholder="কথাসাহিত্যিক"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">সংক্ষিপ্ত জীবনী</label>
                <textarea
                  rows={3}
                  value={authForm.bio}
                  onChange={(e) => setAuthForm({ ...authForm, bio: e.target.value })}
                  placeholder="লেখকের সাহিত্যকর্ম ও অবদান সম্পর্কিত তথ্য..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">লেখকের ছবি</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={authForm.image}
                    onChange={(e) => setAuthForm({ ...authForm, image: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-zinc-50 focus:bg-white focus:border-amber-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => authImageInputRef.current?.click()}
                    className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    ফাইল
                  </button>
                  <input
                    type="file"
                    ref={authImageInputRef}
                    accept="image/*"
                    onChange={(e) =>
                      handleFileUpload(e, (url) => setAuthForm((prev) => ({ ...prev, image: url })))
                    }
                    className="hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-md cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 5: PRINTABLE INVOICE / SLIP */}
      {/* ------------------------------------------------------------- */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:w-full print:max-w-none">
            {/* Header with Print & Close controls */}
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-zinc-900">ডেলিভারি চালান / ইনভয়েস</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForInvoice(null)}
                  className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Slip Content */}
            <div className="space-y-4 text-zinc-900">
              <div className="flex justify-between items-start border-b border-zinc-200 pb-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight">শেষের পাতা</h2>
                  <p className="text-xs text-zinc-500">কাঁটাবন বইয়ের মার্কেট, ঢাকা-১২০৫</p>
                  <p className="text-xs text-zinc-500">ফোন: +৮৮০ ১৭০০-০০০০০০</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-amber-700">
                    {selectedOrderForInvoice.orderId}
                  </div>
                  <div className="text-xs text-zinc-500">তারিখ: {selectedOrderForInvoice.date}</div>
                  <div className="text-xs font-bold uppercase text-zinc-700 mt-1">
                    পেমেন্ট: {selectedOrderForInvoice.paymentMethod}
                  </div>
                </div>
              </div>

              {/* Customer Box */}
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs space-y-1">
                <div className="font-bold text-zinc-900 text-sm">
                  প্রাপক: {selectedOrderForInvoice.customerName}
                </div>
                <div>মোবাইল: {selectedOrderForInvoice.phone}</div>
                <div>
                  ঠিকানা: {selectedOrderForInvoice.address}, {selectedOrderForInvoice.thana},{' '}
                  {selectedOrderForInvoice.district}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs text-left border border-zinc-200">
                <thead className="bg-zinc-100 font-bold border-b border-zinc-200">
                  <tr>
                    <th className="p-2">বইয়ের বিবরণ</th>
                    <th className="p-2 text-center">পরিমাণ</th>
                    <th className="p-2 text-right">মূল্য</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {selectedOrderForInvoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2">
                        <div className="font-bold text-zinc-900">{it.book.title}</div>
                        <div className="text-[10px] text-zinc-500">{it.book.author}</div>
                      </td>
                      <td className="p-2 text-center">{toBengaliNumber(it.quantity)}</td>
                      <td className="p-2 text-right font-semibold">
                        {formatPrice(it.book.price * it.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="text-xs space-y-1 text-right pt-2 border-t border-zinc-200">
                <div>সাবটোটাল: {formatPrice(selectedOrderForInvoice.subtotal)}</div>
                {selectedOrderForInvoice.discountAmount > 0 && (
                  <div className="text-emerald-700 font-semibold">
                    ডিসকাউন্ট: -{formatPrice(selectedOrderForInvoice.discountAmount)}
                  </div>
                )}
                <div>ডেলিভারি চার্জ: {formatPrice(selectedOrderForInvoice.deliveryFee)}</div>
                <div className="text-sm font-black text-zinc-950 pt-1 border-t border-zinc-200">
                  সর্বমোট প্রদেয়: {formatPrice(selectedOrderForInvoice.total)}
                </div>
              </div>

              <div className="text-center pt-4 text-[11px] text-zinc-400 border-t border-zinc-100">
                ধন্যবাদ শেষের পাতা থেকে বই কেনার জন্য!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
