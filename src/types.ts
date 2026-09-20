export interface Book {
  id: string;
  title: string;
  bangla_name?: string;
  english_name?: string;
  author: string;
  publisher: string;
  category: string;
  description: string;
  image: string;
  cover_image?: string;
  gallery?: string[];
  price: number;
  originalPrice: number;
  old_price?: number;
  discount: number; // percentage, e.g. 20
  rating: number;
  reviewCount: number;
  stock: number;
  isbn: string;
  pages?: number;
  edition?: string;
  language: string;
  tags: string[];
  isBestseller?: boolean;
  isNew?: boolean;
  isNewRelease?: boolean;
  isInternational?: boolean;
  isFeatured?: boolean;
  status?: 'published' | 'draft' | 'out_of_stock';
  sectionIds: string[]; // which sections this book belongs to
  created_at?: string;
  updated_at?: string;
}

export interface Banner {
  id: string;
  bangla_image: string;
  english_image: string;
  title: string;
  english_title?: string;
  subtitle?: string;
  english_subtitle?: string;
  link?: string;
  badge?: string;
  status: 'active' | 'inactive';
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  bangla_name?: string;
  englishName: string;
  english_name?: string;
  iconName: string;
  imageUrl: string;
  bookCount: number;
}

export interface Author {
  id: string;
  name: string;
  era: string;
  role: string;
  bio: string;
  image: string;
  bookCount?: number;
}

export interface Publisher {
  id: string;
  name: string;
  description?: string;
  location?: string;
  logo?: string;
  established?: string;
  bookCount?: number;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface OrderDetails {
  orderId: string;
  date: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  thana: string;
  postalCode: string;
  deliveryOption: 'inside_dhaka' | 'outside_dhaka';
  deliveryFee: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'card';
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderNotes?: string;
}

export type ViewType = 'home' | 'catalog' | 'author' | 'publisher' | 'offers' | 'about' | 'contact';

export interface SiteSettings {
  id?: string;
  meta_pixel_id: string;
  meta_pixel_enabled: boolean;
  updated_at?: string;
}
