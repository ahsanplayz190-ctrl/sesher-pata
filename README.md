# শেষের পাতা (Shesher Pata) — Complete Website & Admin Guide

> **শেষের পাতা (Shesher Pata)** is a modern, high-performance Bengali Online Bookstore and E-Commerce platform built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL, Auth, Storage, Realtime)**. It includes automated courier dispatch with **Steadfast Courier API**, **Meta Pixel** conversion tracking, printable invoices, and an administrative dashboard.

---

## 📑 Table of Contents

1. [Features Overview](#-features-overview)
2. [Tech Stack](#-tech-stack)
3. [Quick Start & Installation](#-quick-start--installation)
4. [Database & Supabase Setup](#-database--supabase-setup)
5. [Environment Variables Reference](#-environment-variables-reference)
6. [Website User Tutorial (Customer Experience)](#-website-user-tutorial-customer-experience)
7. [Admin Panel Tutorial (`/seshadmin`)](#-admin-panel-tutorial-seshadmin)
8. [Steadfast Courier Automation Guide](#-steadfast-courier-automation-guide)
9. [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
10. [Production Deployment Guide](#-production-deployment-guide)
11. [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🌟 Features Overview

### 🛒 Customer Storefront
* **Rich Bengali Typography & Design**: Optimized for Bengali script readability with an elegant, responsive mobile-first UI.
* **Dynamic Hero Carousel**: Multilingual banner slider with promotional badges and direct category/book links.
* **Fast Book Discovery**:
  * Real-time search across book titles, authors, publishers, and categories.
  * Multi-attribute filtering (category, price range, publication, author, availability, discounts).
  * Multiple view modes (Grid View and List View).
  * Direct deep links (`/book/[id]`) with OpenGraph metadata for social sharing.
* **Quick View & Details Modal**: Instant book preview with photo gallery, excerpts, page count, edition info, and sample PDF preview.
* **Smart Shopping Cart & Wishlist**:
  * Slide-over Cart Drawer with real-time subtotal, quantity adjustments, and live price recalculation.
  * Slide-over Wishlist Drawer allowing users to bookmark favorite books.
  * Persistent storage across browsing sessions.
* **Seamless Checkout**:
  * Cash on Delivery (COD), bKash, Nagad, and Card payment options.
  * Automated delivery charge calculation (Inside Dhaka vs. Outside Dhaka).
  * Free delivery threshold logic (e.g., Free delivery on orders over ৳1500).
  * Coupon code support (e.g., `SHESHER10`).
* **Live Order Tracking**: Instant tracking modal for customers to monitor order status and courier delivery tracking codes.
* **Customer Authentication & Profiles**: Supabase Auth support for personal profiles and order history.
* **Meta Pixel Integration**: Full e-commerce funnel tracking (`PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`, `Search`).

### 🛠️ Seshadmin Dashboard (`/seshadmin`)
* **Secure Server-Only Authentication**: Constant-time credential checks and cryptographically signed session tokens.
* **Real-time Overview Analytics**: Revenue metrics, total orders, sales trends, inventory counts, and low-stock alerts.
* **Complete Catalog Management**:
  * Add, edit, draft, and delete books with dual Bangla & English titles.
  * Direct image uploads to Supabase Storage buckets (`book-covers`, `book-banners`, `book-files`).
  * Section assignments: *New Arrivals*, *Bestsellers*, *Featured*, *International Books*.
* **Banners & Promotions Manager**: Control carousel slides, links, and badges without touching code.
* **Categories, Authors & Publishers Management**: Maintain taxonomies and creator profiles.
* **Order Processing & Printable Invoices**:
  * Comprehensive order pipeline: `Pending` ➔ `Confirmed` ➔ `Shipped` ➔ `Delivered` ➔ `Cancelled`.
  * One-click print-ready packaging slip and invoice with barcodes.
* **Steadfast Courier Integration**:
  * Encrypted API key storage with AES-256-GCM.
  * 1-click consignment creation to send parcels directly to Steadfast Courier.
  * Live courier balance and delivery status synchronization.
* **Dynamic Store Settings**:
  * Configure shipping fees, free shipping minimums, Meta Pixel ID, phone numbers, WhatsApp, and top announcement bar.
* **Backup & Restore**: Instant one-click JSON export and import for the entire database.

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript, React 19 |
| **Styling** | Tailwind CSS, Lucide Icons, Framer Motion |
| **Database** | Supabase (PostgreSQL with Row Level Security & Realtime) |
| **Storage** | Supabase Storage (`book-covers`, `book-banners`, `book-files`) |
| **Logistics** | Steadfast Courier API Integration |
| **Analytics** | Meta Pixel (Facebook Ads) |
| **Security** | AES-256-GCM encryption, Server-only execution (`server-only`) |

---

## 🚀 Quick Start & Installation

### Prerequisites
* **Node.js**: `v18.18.0` or later (Node.js 20+ recommended)
* **npm**: `v9.0.0` or later
* A free or paid account at [Supabase](https://supabase.com)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/shesher-pata.git
cd shesher-pata
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project keys, admin credentials, and encryption keys (see [Environment Variables Reference](#-environment-variables-reference)).

### 3. Setup the Database
Execute the contents of `supabase_schema.sql` in your Supabase SQL Editor (see [Database Setup](#-database--supabase-setup)).

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront, or [http://localhost:3000/seshadmin](http://localhost:3000/seshadmin) to log into the Admin Dashboard.

---

## 🗄️ Database & Supabase Setup

The project includes an idempotent, production-ready SQL migration script: **`supabase_schema.sql`**.

### How to Apply the Schema:
1. Log in to your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Select your project and navigate to the **SQL Editor** tab on the left sidebar.
3. Click **New Query**.
4. Open the [`supabase_schema.sql`](file:///e:/local%20projects/শেষের-পাতা/supabase_schema.sql) file from this repository, copy all contents, paste them into the editor, and click **Run**.

### What this script creates:
1. **`public.books`**: Books catalog with Bengali fields, stock counts, discounts, and section arrays.
2. **`public.profiles`**: Customer profiles linked to `auth.users` with automated signup triggers.
3. **`public.site_settings`**: Global store configuration (phone numbers, announcement bar, delivery fees, Meta Pixel).
4. **`public.steadfast_config`**: Encrypted credentials for the Steadfast Courier API.
5. **Storage Buckets**:
   * `book-covers` (Public): Book cover images.
   * `book-banners` (Public): Promotional slider banners.
   * `book-files` (Private): Digital downloadable files and PDF samples.
6. **Row Level Security (RLS)**: Public read-only access for published books and settings; write access strictly restricted to the server role.
7. **Realtime Replication**: Subscribed to `public.books` for instant UI updates across client browsers.

---

## 🔐 Environment Variables Reference

Create a file named `.env.local` in the project root with the following parameters:

```env
# ------------------------------------------------------------------------------
# SUPABASE DATABASE & STORAGE CONFIGURATION
# ------------------------------------------------------------------------------
# Found in Supabase Dashboard -> Project Settings -> API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_key

# ------------------------------------------------------------------------------
# ADMIN DASHBOARD AUTHENTICATION (/seshadmin)
# ------------------------------------------------------------------------------
ADMIN_USERNAME=seshadmin
ADMIN_EMAIL=admin@shesherpata.com
ADMIN_PASSWORD=your_secure_admin_password
ADMIN_SESSION_SECRET=your_random_64_char_hex_secret

# ------------------------------------------------------------------------------
# STEADFAST COURIER INTEGRATION
# ------------------------------------------------------------------------------
STEADFAST_BASE_URL=https://portal.packzy.com/api/v1
STEADFAST_API_KEY=your_steadfast_api_key
STEADFAST_SECRET_KEY=your_steadfast_secret_key

# ------------------------------------------------------------------------------
# SITE CONFIGURATION
# ------------------------------------------------------------------------------
NEXT_PUBLIC_SITE_URL=https://shesherpata.com
```

> **Tip to generate keys:**
> You can generate random 32-byte hex strings in terminal using Node.js:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## 📖 Website User Tutorial (Customer Experience)

### 1. Navigating the Homepage
* **Top Announcement Bar**: Displays active seasonal promotions, discounts, and coupon codes (e.g. `SHESHER10`).
* **Header & Search**:
  * Type in the search bar to find books by Bengali title, English title, or author name.
  * Direct links to Cart and Wishlist with live item count badges.
  * "Track Order" button to quickly look up deliveries.
* **Hero Carousel**: Automatic and manual slide navigation highlighting featured titles and seasonal book fairs.
* **Book Sections**:
  * **নতুন প্রকাশনী (New Arrivals)**: Latest published releases.
  * **বেস্টসেলার (Bestsellers)**: Most popular and top-selling books.
  * **জনপ্রিয় বইসমূহ (Featured Books)**: Handpicked curator recommendations.
  * **আন্তর্জাতিক সাহিত্য (International Literature)**: Bengali translations and world literature.

### 2. Exploring the Catalog
* Click on **বইসমূহ (Books)** in the top navigation or select a category card.
* **Filters**:
  * **বিষয়/ক্যাটাগরি (Category)**: Filter by Novel, Poetry, History, Thriller, Science Fiction, Self-help, etc.
  * **মূল্যসীমা (Price Range)**: Use the slider to filter by maximum budget.
  * **লেখক (Author)** & **প্রকাশনী (Publisher)**: Filter titles by your favorite authors or publishers.
  * **স্টক (Stock Availability)**: View in-stock items only.
* **Sorting**: Sort by *জনপ্রিয়তা (Popularity)*, *মূল্য: কম থেকে বেশি (Price: Low to High)*, *মূল্য: বেশি থেকে কম (Price: High to Low)*, or *সর্বোচ্চ ছাড় (Highest Discount)*.

### 3. Book Details & Previews
* Click on any book card to open the **Product Details Modal**, or navigate to its permalink (`/book/[book-id]`).
* Inspect high-resolution book covers and gallery pictures.
* Read the Bengali synopsis, ISBN, publication edition, page count, and language info.
* Click **একঝলক পড়ুন (Read Sample)** to view preview pages or sample PDFs if available.

### 4. Adding to Cart & Wishlist
* Click the **হৃদয় আইকন (Heart Icon)** to add books to your personal Wishlist.
* Click **অর্ডার করুন (Order Now)** to open the checkout modal directly, or **কার্টে যোগ করুন (Add to Cart)** to continue shopping.
* In the **Cart Drawer**:
  * Increase or decrease item quantities.
  * Review calculated subtotals.
  * See how much more you need to spend to unlock **ফ্রি ডেলিভারি (Free Delivery)**!

### 5. Completing an Order (Checkout Flow)
1. In the Cart Drawer or product page, click **চেকআউট করুন (Proceed to Checkout)**.
2. Enter delivery details:
   * **নাম (Full Name)**
   * **মোবাইল নম্বর (Phone Number)** (11-digit Bangladeshi format, e.g. `017XXXXXXXX`)
   * **ঠিকানা (Detailed Address)**
   * **জেলা (District)** & **থানা (Thana)**
3. Choose Delivery Zone:
   * **ঢাকার ভিতরে (Inside Dhaka)**: Standard local rate (default ৳60).
   * **ঢাকার বাইরে (Outside Dhaka)**: Nationwide courier rate (default ৳120).
4. Apply Coupon Code: Enter promo codes like `SHESHER10` and click **প্রয়োগ করুন (Apply)**.
5. Select Payment Method:
   * **ক্যাশ অন ডেলিভারি (Cash on Delivery - COD)**
   * **বিকাশ (bKash)**
   * **নগদ (Nagad)**
   * **কার্ড / ডেবিট কার্ড (Card)**
6. Click **অর্ডার কনফার্ম করুন (Confirm Order)**.
7. You will receive an immediate confirmation with a unique **Order ID** (e.g., `ORD-849201`).

### 6. Tracking Your Order
* Click **অর্ডার ট্র্যাক (Track Order)** in the header.
* Enter your **Order ID** or **Mobile Number**.
* Real-time tracker displays the current state:
  * `অর্ডার গৃহীত (Pending)` ➔ `নিশ্চিত হয়েছে (Confirmed)` ➔ `কুরিয়ারে হস্তান্তর (Shipped)` ➔ `ডেলিভারি সম্পন্ন (Delivered)`.
* If shipped via Steadfast Courier, the **Steadfast Tracking Code** is displayed with a direct link to track live consignment movement.

---

## 🛡️ Admin Panel Tutorial (`/seshadmin`)

The Seshadmin dashboard is located at:
```
http://localhost:3000/seshadmin  (or https://yourdomain.com/seshadmin in production)
```

### 1. Logging into Seshadmin
* **Username / Email**: As set in `.env.local` (`ADMIN_USERNAME` or `ADMIN_EMAIL`).
* **Password**: As set in `.env.local` (`ADMIN_PASSWORD`).
* Toggle **"আমাকে মনে রাখুন" (Remember Me)** to stay logged in across sessions (7-day secure HTTP-only cookie).

---

### 2. Dashboard Tab (ড্যাশবোর্ড)
* **High-Level Statistics**: Total Revenue, Completed Orders, Pending Dispatches, Active Books in Catalog.
* **Low Stock Alerts**: Automatically highlights books with fewer than 5 copies remaining.
* **Quick Navigation**: Instant links to add books, review new orders, or update announcements.

---

### 3. Books Management Tab (বই ব্যবস্থাপনা)
* **Browse & Search**: Filter catalog by category or search by book title/author.
* **Adding a New Book**:
  1. Click **+ নতুন বই যোগ করুন (+ Add New Book)**.
  2. Enter **বইয়ের নাম (Bangla Name)** and optional **English Title**.
  3. Select or enter **লেখক (Author)**, **প্রকাশনী (Publisher)**, and **ক্যাটাগরি (Category)**.
  4. Pricing:
     * **বিক্রয় মূল্য (Selling Price)** (e.g. ৳380)
     * **আসল/মুদ্রিত মূল্য (Original Price)** (e.g. ৳450)
     * Discount percentage is automatically calculated!
  5. Stock: Enter current stock quantity.
  6. Book Specifications: ISBN, number of pages, edition (e.g. ১ম সংস্করণ), language.
  7. Cover & Banner Images:
     * Upload directly from your computer to the Supabase `book-covers` bucket via the upload button, or paste an external image URL.
  8. Section Assignments: Check boxes to show the book under:
     * `নতুন প্রকাশনী (New Arrivals)`
     * `বেস্টসেলার (Bestsellers)`
     * `জনপ্রিয় বইসমূহ (Featured)`
     * `আন্তর্জাতিক সাহিত্য (International)`
  9. Click **সংরক্ষণ করুন (Save Book)**. The book immediately appears in your live store!
* **Editing a Book**: Click the **Edit (পেন্সিল)** button on any book row, update details, and save.
* **Deleting a Book**: Click the **Trash (ডিলিট)** icon with safety confirmation.
* **Cloud Sync**: Click **Supabase সিঙ্ক** to force-refresh local browser caches with PostgreSQL.

---

### 4. Banners Management Tab (ব্যানার স্লাইডার)
* Control the carousel on the homepage without touching code.
* Add desktop and mobile banner images.
* Configure promotion headline, subtitle, action button text, and destination URL (e.g., `/catalog?category=novel`).
* Set sort orders and toggle active/inactive status.

---

### 5. Categories, Authors & Publishers Tabs
* **ক্যাটাগরি (Categories)**: Create book genres (e.g., উপন্যাস, কবিতা, ইতিহাস, থ্রিলার) with custom icons and cover graphics.
* **লেখক (Authors)**: Add author profiles with portraits, life era (e.g., রবীন্দ্রযুগ, আধুনিক), and biographical summaries.
* **প্রকাশনী (Publishers)**: Maintain publisher profiles with logo, address, and catalog counts.

---

### 6. Orders & Dispatch Tab (অর্ডারসমূহ)
* View all customer orders with timestamp, customer name, phone, full address, ordered items, payment method, and total amount.
* **Status Filter**: View orders by `সব (All)`, `অপেক্ষমান (Pending)`, `নিশ্চিত (Confirmed)`, `শিপড (Shipped)`, `ডেলিভার্ড (Delivered)`, or `বাতিল (Cancelled)`.
* **Print Invoice / Slip**:
  * Click the **প্রিন্ট (Printer)** icon next to any order.
  * Generates an official, beautifully styled **ক্যাশ মেমো / ইনভয়েস (Invoice & Packaging Slip)** complete with order ID, date, customer shipping details, line items, breakdown of subtotal/discount/delivery charges, and return policy notes.
* **1-Click Dispatch to Steadfast**:
  * Click **কুরিয়ারে পাঠান (Send to Courier)**.
  * Order is automatically transmitted to Steadfast Courier's API.
  * Consignment ID and Tracking Code are automatically saved to the order.

---

### 7. Steadfast Courier Integration Tab (স্টেডফাস্ট কুরিয়ার)
* Complete courier automation for deliveries inside and outside Dhaka.
* Configure Steadfast merchant credentials via server environment variables:
  1. Add `STEADFAST_API_KEY` and `STEADFAST_SECRET_KEY` to `.env.local` or hosting environment settings.
  2. Verify connection and balance directly from the **স্টেডফাস্ট (Steadfast)** tab in Seshadmin.
  3. Dispatch orders with 1-click booking and automated consignment tracking.
* Check your live Steadfast account balance directly from the dashboard.
* Track deliveries and sync consignment statuses automatically.

---

### 8. Store Settings Tab (স্টোর সেটিংস)
* **ডেলিভারি চার্জ (Delivery Fees)**:
  * ঢাকার ভিতরে চার্জ (Inside Dhaka Delivery Charge, default: ৳60)
  * ঢাকার বাইরে চার্জ (Outside Dhaka Delivery Charge, default: ৳120)
  * ফ্রি ডেলিভারি সর্বনিম্ন মূল্য (Free Delivery Minimum Threshold, default: ৳1500)
* **মেটা পিক্সেল (Meta Pixel)**:
  * Enter your 15/16-digit Meta Pixel ID (e.g., `1234567890123456`).
  * Enable or disable tracking with a single toggle switch.
* **যোগাযোগের তথ্য (Contact Information)**:
  * Primary Phone & Alternate Phone number.
  * Official support email.
  * Store physical address (e.g., কাঁটাবন বইয়ের মার্কেট, ঢাকা).
  * Customer support hours.
  * WhatsApp direct chat number.
  * Social links (Facebook Page URL, Instagram URL).
* **ঘোষণা বার (Announcement Banner)**:
  * Badge text (e.g., অফার, বিশেষ ছাড়).
  * Announcement text displayed at the top of the storefront.

---

### 9. Backup & Data Restore (ব্যাকআপ ও রিস্টোর)
* **JSON এক্সপোর্ট**: Click **এক্সপোর্ট (Export)** to download a complete snapshot of all books, banners, categories, authors, publishers, and orders as a `.json` file.
* **JSON ইমপোর্ট**: Upload a previous JSON backup to restore or migrate data to a new database instance.

---

## 🚚 Steadfast Courier Automation Guide

Shesher Pata features native, secure API integration with [Steadfast Courier](https://portal.packzy.com), one of Bangladesh's leading e-commerce delivery logistics providers.

### How it works:
```
Customer Places Order ➔ Admin Confirms ➔ 1-Click "Send to Steadfast"
       │
       ▼
Next.js Server decrypts Steadfast API Credentials (AES-256-GCM)
       │
       ▼
Calls Steadfast API: POST /create_order
  - Invoice: ORD-XXXXXX
  - Recipient Name, Phone, Address
  - COD Amount (subtotal + delivery fee)
       │
       ▼
Steadfast returns Consignment ID & Tracking Code
       │
       ▼
Order status automatically changes to "shipped"
Customer can now track parcel via Track Order Modal!
```

### Steps to set up:
1. Register as a merchant at [Steadfast Courier Portal](https://portal.packzy.com).
2. Go to **Settings** ➔ **API Credentials** in your Steadfast dashboard.
3. Copy your **API Key** and **Secret Key**.
4. Log into `/seshadmin` ➔ Navigate to **স্টেডফাস্ট (Steadfast)** tab.
5. Paste credentials and click **কানেক্ট করুন (Connect)**.
6. A success message will appear showing your account status as **সংযুক্ত (Connected)**.

---

## 🏗️ Project Architecture & Directory Structure

```
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── auth/           # Secure admin authentication endpoint
│   │   │   ├── books/          # Admin book CRUD operations with Supabase
│   │   │   ├── settings/       # Store configuration & Meta Pixel settings
│   │   │   ├── steadfast/      # Courier consignment dispatch & status tracking
│   │   │   └── upload/         # Supabase Storage asset upload endpoint
│   │   └── books/              # Public read-only books API
│   ├── book/[id]/              # Dynamic book permalink page with SEO OpenGraph
│   ├── seshadmin/              # Complete Seshadmin management dashboard
│   ├── globals.css             # Tailwind base styles and Bengali font imports
│   ├── layout.tsx              # Root HTML layout with Meta Pixel and Context providers
│   ├── page.tsx                # Main storefront page assembling all views
│   ├── robots.ts               # Automated search engine robots.txt
│   └── sitemap.ts              # Automated dynamic XML sitemap
├── public/
│   ├── images/                 # Default logos, book samples, fallback covers
│   ├── favicon.ico             # Custom browser favicon
│   └── og-image.png            # Social media share banner
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── bangla/             # Bengali storefront homepage sections
│   │   ├── CartDrawer.tsx      # Slide-over cart drawer
│   │   ├── CheckoutModal.tsx   # Multi-step checkout modal
│   │   ├── Header.tsx          # Top navigation header with search
│   │   ├── ProductCard.tsx     # Book product card with quick actions
│   │   ├── ProductDetailsModal.tsx # In-depth book information popup
│   │   ├── TrackOrderModal.tsx # Live order tracking modal
│   │   └── WishlistDrawer.tsx  # Bookmark wishlist drawer
│   ├── context/                # React Contexts (DataContext, CartContext, etc.)
│   ├── lib/                    # Supabase client and server-auth utilities
│   ├── server/                 # Server-only encryption and configuration
│   ├── services/               # API service clients (bookService, settingsService)
│   ├── types.ts                # TypeScript domain models
│   └── utils/                  # Currency formatters, Meta Pixel helper functions
├── server.js                   # Custom Node.js production server for cPanel / Apache
├── supabase_schema.sql         # Complete idempotent PostgreSQL database schema
├── tailwind.config.js          # Custom theme, colors, and Bengali font extensions
└── package.json
```

---

## 🌐 Production Deployment Guide

### Option 1: Vercel Deployment (Recommended)
1. Push your repository to **GitHub / GitLab**.
2. Go to **[Vercel](https://vercel.com)** and click **Add New Project**.
3. Import your repository. Vercel automatically detects Next.js.
4. Under **Environment Variables**, paste the keys from your `.env.local`:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
   * `ADMIN_USERNAME`
   * `ADMIN_EMAIL`
   * `ADMIN_PASSWORD`
   * `ADMIN_SESSION_SECRET`
   * `STEADFAST_BASE_URL`
   * `STEADFAST_API_KEY`
   * `STEADFAST_SECRET_KEY`
   * `NEXT_PUBLIC_SITE_URL`
5. Click **Deploy**. Your website will be live in 1-2 minutes!

---

### Option 2: cPanel / Apache / Shared Hosting Deployment
This project includes dedicated `server.js` and `.htaccess` files configured specifically for cPanel Node.js Selector (Phusion Passenger).

1. In cPanel, navigate to **Setup Node.js App**.
2. Create an Application:
   * **Node.js Version**: 18.x or 20.x
   * **Application Mode**: Production
   * **Application Root**: `shesher-pata` (or your folder name)
   * **Application Startup File**: `server.js`
3. Upload project files (or clone via Git).
4. Run:
   ```bash
   npm install
   npm run build
   ```
5. Add your environment variables in the cPanel Node.js Application interface.
6. Click **Restart** to launch the site.

---

### Option 3: VPS / Ubuntu with PM2 and Nginx
1. SSH into your VPS:
   ```bash
   git clone https://github.com/your-username/shesher-pata.git
   cd shesher-pata
   npm install
   cp .env.example .env.local
   # Edit .env.local with nano or vim
   npm run build
   ```
2. Start the process using PM2:
   ```bash
   npm install -g pm2
   pm2 start npm --name "shesher-pata" -- start -- -p 3000
   pm2 save
   pm2 startup
   ```
3. Configure Nginx as a reverse proxy:
   ```nginx
   server {
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
4. Obtain a free SSL certificate with Certbot:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

## ❓ Troubleshooting & FAQs

### Q1: Books added in `/seshadmin` aren't showing up on the storefront?
* Ensure the book's status is set to `published` (পাবলিশড) and not `draft` (ড্রাফট).
* Verify that you executed the `supabase_schema.sql` migration in your Supabase SQL editor.
* In `/seshadmin`, click the **Supabase সিঙ্ক** button to refresh the catalog cache.

### Q2: How do I change the admin password?
* Change the `ADMIN_PASSWORD` variable in your `.env.local` file (or host environment variables).
* Restart your Next.js server (`npm run dev` or `pm2 restart shesher-pata`).
* The change takes effect immediately without database migrations.

### Q3: Steadfast says "Authentication Failed" or "Connection Refused"?
* Verify that `STEADFAST_API_KEY` and `STEADFAST_SECRET_KEY` in `.env.local` match the keys from your **live** Steadfast merchant account at `portal.packzy.com`.
* Ensure your server has outbound HTTPS access to `https://portal.packzy.com`.
* Restart your server after updating environment variables.

### Q4: Book cover images fail to upload?
* Ensure that the `book-covers` bucket exists in your Supabase project under **Storage**.
* If missing, re-run Section 6 of `supabase_schema.sql` to automatically create the storage bucket with public read policies.

---

## 📄 License & Attribution

© 2026 **শেষের পাতা (Shesher Pata)**. All Rights Reserved.  
Crafted with ❤️ for book lovers across Bangladesh.
