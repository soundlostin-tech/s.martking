import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo-config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/live',
    '/matches',
    '/leaderboard',
    '/feed',
    '/signup',
    '/signin',
  ].map((route) => ({
    url: `${SITE_CONFIG.url}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const [postsResult, videosResult, profilesResult] = await Promise.all([
    supabase
      .from('posts')
      .select('slug, updated_at, created_at')
      .eq('is_public', true)
      .eq('allow_indexing', true)
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('videos')
      .select('slug, updated_at, created_at')
      .eq('is_public', true)
      .eq('allow_indexing', true)
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('profiles')
      .select('username, id, created_at')
      .not('username', 'is', null)
      .limit(500),
  ]);

  const postRoutes = (postsResult.data || [])
    .filter(post => post.slug)
    .map(post => ({
      url: `${SITE_CONFIG.url}/p/${post.slug}`,
      lastModified: post.updated_at || post.created_at || new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const videoRoutes = (videosResult.data || [])
    .filter(video => video.slug)
    .map(video => ({
      url: `${SITE_CONFIG.url}/v/${video.slug}`,
      lastModified: video.updated_at || video.created_at || new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const profileRoutes = (profilesResult.data || [])
    .filter(profile => profile.username)
    .map(profile => ({
      url: `${SITE_CONFIG.url}/u/${profile.username}`,
      lastModified: profile.created_at || new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...postRoutes, ...videoRoutes, ...profileRoutes];
}
