export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  category: string;
  description: string;
  image: string;
  gallery?: string[];
  price: number;
  originalPrice: number;
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
  sectionIds: string[]; // which sections this book belongs to
}

export interface Category {
  id: string;
  name: string;
  englishName: string;
  iconName: string;
  imageUrl: string;
  bookCount: number;
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
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
}

export type ViewType = 'home' | 'catalog' | 'author' | 'publisher' | 'offers' | 'about' | 'contact';
