import { Book, CartItem, OrderDetails } from '../types';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

const PURCHASED_ORDERS_KEY = 'shesher_pata_purchased_orders_v1';
const REGISTERED_USERS_KEY = 'shesher_pata_registered_phones_v1';

let isInitialized = false;
let currentActivePixelId: string | null = null;
let lastTrackedPath: string | null = null;

/**
 * Dynamically injects and initializes the Meta Pixel script.
 * If already initialized with the same ID, does nothing.
 * If initialized with a different ID, updates to the new ID.
 */
export function initMetaPixel(pixelId: string): void {
  if (typeof window === 'undefined') return;
  const cleanId = (pixelId || '').trim();
  if (!cleanId) return;

  if (isInitialized && currentActivePixelId === cleanId) {
    return;
  }

  try {
    // Official Facebook Pixel script setup
    if (!window.fbq) {
      const fbq: any = function (...args: any[]) {
        if (fbq.callMethod) {
          fbq.callMethod.apply(fbq, args);
        } else {
          fbq.queue.push(args);
        }
      };
      if (!window._fbq) window._fbq = fbq;
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.queue = [];
      window.fbq = fbq;

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      script.onerror = () => {
        console.warn('[Meta Pixel] Failed to load fbevents.js (likely blocked by adblocker). Site functionality unaffected.');
      };

      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }
    }

    window.fbq('init', cleanId);
    isInitialized = true;
    currentActivePixelId = cleanId;
  } catch (err) {
    console.warn('[Meta Pixel] Initialization encountered an issue:', err);
  }
}

/**
 * Disables active tracking without breaking anything.
 */
export function disableMetaPixel(): void {
  isInitialized = false;
  currentActivePixelId = null;
  lastTrackedPath = null;
}

/**
 * Safe generic event tracker.
 */
export function trackEvent(
  eventName: string,
  parameters?: Record<string, any>,
  eventId?: string
): void {
  if (typeof window === 'undefined' || !isInitialized || !currentActivePixelId) {
    return;
  }

  try {
    if (typeof window.fbq === 'function') {
      if (eventId) {
        window.fbq('track', eventName, parameters || {}, { eventID: eventId });
      } else {
        window.fbq('track', eventName, parameters || {});
      }
    }
  } catch (err) {
    // Never let tracking errors bubble up or disrupt user experience
    console.warn(`[Meta Pixel] Error sending event "${eventName}":`, err);
  }
}

/**
 * Track PageView safely with route deduplication for SPA / Next.js client-side routing.
 */
export function trackPageView(currentPath?: string): void {
  const path = currentPath || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '');
  
  // Guard against duplicate PageView for identical route on re-renders
  if (lastTrackedPath === path) {
    return;
  }
  lastTrackedPath = path;

  trackEvent('PageView');
}

/**
 * Track ViewContent when a user views book details (modal or dedicated page).
 */
export function trackViewContent(book: Book): void {
  if (!book || !book.id) return;

  const price = typeof book.price === 'number' ? book.price : 0;

  trackEvent('ViewContent', {
    content_name: book.bangla_name || book.title || 'Book',
    content_ids: [String(book.id)],
    content_type: 'product',
    value: price,
    currency: 'BDT',
    content_category: book.category || undefined,
  });
}

/**
 * Track Search when a visitor performs a book search.
 */
export function trackSearch(query: string): void {
  const trimmed = (query || '').trim();
  if (!trimmed) return;

  trackEvent('Search', {
    search_string: trimmed,
    content_type: 'product',
  });
}

/**
 * Track AddToCart when a book is successfully added.
 */
export function trackAddToCart(book: Book, quantity = 1): void {
  if (!book || !book.id) return;

  const qty = Math.max(1, quantity || 1);
  const unitPrice = typeof book.price === 'number' ? book.price : 0;
  const totalValue = unitPrice * qty;

  trackEvent('AddToCart', {
    content_name: book.bangla_name || book.title || 'Book',
    content_ids: [String(book.id)],
    content_type: 'product',
    value: totalValue,
    currency: 'BDT',
    num_items: qty,
  });
}

/**
 * Track InitiateCheckout when customer opens the checkout modal or begins checkout.
 */
export function trackInitiateCheckout(cart: CartItem[], cartTotal: number): void {
  if (!cart || cart.length === 0) return;

  const total = typeof cartTotal === 'number' && cartTotal > 0 ? cartTotal : 0;
  const numItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const contentIds = cart.map((item) => String(item.book.id));
  const contents = cart.map((item) => ({
    id: String(item.book.id),
    quantity: item.quantity || 1,
    item_price: item.book.price || 0,
  }));

  trackEvent('InitiateCheckout', {
    content_ids: contentIds,
    contents,
    content_type: 'product',
    value: total,
    currency: 'BDT',
    num_items: numItems,
  });
}

/**
 * Track Purchase when an order is successfully confirmed in Supabase / DataContext.
 * Guaranteed idempotent: strictly deduplicated by orderId using storage to prevent
 * duplicate Purchase events on re-renders, back navigation, or page refreshes.
 */
export function trackPurchase(order: OrderDetails): boolean {
  if (!order || !order.orderId) return false;

  const orderId = order.orderId.trim();

  // Deduplication check
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(PURCHASED_ORDERS_KEY);
      const trackedIds: string[] = stored ? JSON.parse(stored) : [];

      if (trackedIds.includes(orderId)) {
        // Already tracked previously
        return false;
      }

      // Mark order as tracked
      trackedIds.push(orderId);
      // Keep list manageable (store last 100 orders)
      if (trackedIds.length > 100) {
        trackedIds.splice(0, trackedIds.length - 100);
      }
      localStorage.setItem(PURCHASED_ORDERS_KEY, JSON.stringify(trackedIds));
    } catch (e) {
      console.warn('[Meta Pixel] Local storage purchase deduplication check skipped:', e);
    }
  }

  const items = order.items || [];
  const contentIds = items.map((item) => String(item.book.id));
  const contents = items.map((item) => ({
    id: String(item.book.id),
    quantity: item.quantity || 1,
    item_price: item.book.price || 0,
  }));
  const numItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalValue = typeof order.total === 'number' ? order.total : 0;

  trackEvent(
    'Purchase',
    {
      content_ids: contentIds,
      contents,
      content_type: 'product',
      value: totalValue,
      currency: 'BDT',
      num_items: numItems,
      order_id: orderId,
    },
    orderId // Pass as eventID for deduplication and future CAPI matching
  );

  return true;
}

/**
 * Track CompleteRegistration for new customer registration.
 * Deduplicates using phone identifier so returning logins do not re-trigger.
 */
export function trackCompleteRegistration(identifier?: string, method = 'phone'): boolean {
  if (identifier && typeof window !== 'undefined') {
    try {
      const cleanId = identifier.trim().toLowerCase();
      const stored = localStorage.getItem(REGISTERED_USERS_KEY);
      const registeredList: string[] = stored ? JSON.parse(stored) : [];

      if (registeredList.includes(cleanId)) {
        // User already registered earlier
        return false;
      }

      registeredList.push(cleanId);
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredList));
    } catch {
      // Ignore storage errors
    }
  }

  trackEvent('CompleteRegistration', {
    status: 'success',
    registration_method: method,
  });

  return true;
}
