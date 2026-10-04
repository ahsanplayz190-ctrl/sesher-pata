import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'অ্যাডমিন ড্যাশবোর্ড — শেষের পাতা',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
