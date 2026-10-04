import { MetadataRoute } from 'next';
import { publicConfig } from '../src/config/publicConfig';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = publicConfig.siteUrl;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/seshadmin', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
