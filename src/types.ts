export interface Book {
  id: string;
  title: string;
  title_bn?: string;
  bangla_name?: string;
  english_name?: string;
  author: string;
  publisher: string;
  category: string;
  description: string;
  description_bn?: string;
  image: string;
  cover_image?: string;
  banner_image?: string;
  pdf_url?: string;
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
  featured?: boolean;
  is_active?: boolean;
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
  // Steadfast Courier integration fields
  steadfast_consignment_id?: string | number;
  steadfast_tracking_code?: string;
  steadfast_status?: string;
  steadfast_synced_at?: string;
}

export type ViewType = 'home' | 'catalog' | 'author' | 'publisher' | 'offers' | 'about' | 'contact';

export interface SiteSettings {
  id?: string;
  meta_pixel_id: string;
  meta_pixel_enabled: boolean;
  phone?: string;
  alt_phone?: string;
  email?: string;
  address?: string;
  support_hours?: string;
  announcement_badge?: string;
  announcement_text?: string;
  about_text?: string;
  facebook_url?: string;
  instagram_url?: string;
  whatsapp_number?: string;
  // Steadfast Courier API settings
  steadfast_api_key?: string;
  steadfast_secret_key?: string;
  steadfast_enabled?: boolean;
  // Delivery Fee configuration
  delivery_charge_inside?: number;
  delivery_charge_outside?: number;
  free_delivery_threshold?: number;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}
