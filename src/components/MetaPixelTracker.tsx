'use client';

import React, { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useData } from '../context/DataContext';
import { initMetaPixel, disableMetaPixel, trackPageView } from '../utils/metaPixel';

function MetaPixelRouteTracker() {
  const { siteSettings } = useData();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize or disable Meta Pixel based on admin configuration
  useEffect(() => {
    if (siteSettings?.meta_pixel_enabled && siteSettings?.meta_pixel_id) {
      initMetaPixel(siteSettings.meta_pixel_id);
    } else {
      disableMetaPixel();
    }
  }, [siteSettings?.meta_pixel_enabled, siteSettings?.meta_pixel_id]);

  // Track PageView on route transitions
  useEffect(() => {
    if (siteSettings?.meta_pixel_enabled && siteSettings?.meta_pixel_id) {
      const queryString = searchParams?.toString();
      const currentUrl = queryString ? `${pathname}?${queryString}` : pathname;
      trackPageView(currentUrl);
    }
  }, [pathname, searchParams, siteSettings?.meta_pixel_enabled, siteSettings?.meta_pixel_id]);

  return null;
}

export function MetaPixelTracker() {
  return (
    <Suspense fallback={null}>
      <MetaPixelRouteTracker />
    </Suspense>
  );
}
