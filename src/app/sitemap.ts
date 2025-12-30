import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/live',
    '/matches',
    '/leaderboard',
    '/wallet',
    '/profile',
    '/signup',
    '/signin',
  ].map((route) => ({
    url: `${SITE_CONFIG.url}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
