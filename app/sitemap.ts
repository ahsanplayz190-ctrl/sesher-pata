import { MetadataRoute } from 'next';
import { getServerSupabaseClient } from '../src/lib/serverSupabase';
import { BOOKS } from '../src/data/books';
import { publicConfig } from '../src/config/publicConfig';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = publicConfig.siteUrl;

  let bookIds: string[] = BOOKS.map((b) => b.id);

  const supabase = getServerSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from('books')
        .select('id, updated_at')
        .eq('is_active', true)
        .limit(200);

      if (data && data.length > 0) {
        bookIds = data.map((b) => b.id);
      }
    } catch {
      // Fallback to static IDs
    }
  }

  const bookUrls: MetadataRoute.Sitemap = bookIds.map((id) => ({
    url: `${baseUrl}/book/${id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...bookUrls,
  ];
}
