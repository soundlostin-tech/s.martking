import { Metadata } from "next";
import { SITE_CONFIG } from "./seo-config";

export function generateSlug(title: string, game?: string, mode?: string, id?: string): string {
  const parts = [title, game, mode].filter(Boolean);
  const baseSlug = parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  
  if (id) {
    return `${baseSlug}-${id.slice(0, 8)}`;
  }
  return baseSlug;
}

export function extractSlugId(slug: string): string | null {
  const parts = slug.split("-");
  const lastPart = parts[parts.length - 1];
  if (lastPart && lastPart.length === 8) {
    return lastPart;
  }
  return null;
}

export interface PostData {
  id: string;
  title: string;
  description?: string;
  slug: string;
  game?: string;
  mode?: string;
  thumbnail_url?: string;
  is_public: boolean;
  allow_indexing: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at?: string;
  user?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface VideoData extends PostData {
  video_url: string;
  duration_seconds?: number;
  watch_time_seconds?: number;
}

export function generatePostMetadata(post: PostData): Metadata {
  const title = `${post.title} by ${post.user?.full_name || post.user?.username || "Player"}`;
  const description = post.description 
    || `${post.game ? `${post.game} ` : ""}${post.mode ? `${post.mode} ` : ""}gameplay post from ${post.user?.full_name || "a player"} on Smartking's Arena`;
  
  const canonicalUrl = `${SITE_CONFIG.url}/p/${post.slug}`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      images: post.thumbnail_url ? [{ url: post.thumbnail_url }] : [{ url: SITE_CONFIG.ogImage }],
      type: "article",
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
      authors: post.user?.full_name ? [post.user.full_name] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.thumbnail_url ? [post.thumbnail_url] : [SITE_CONFIG.ogImage],
      creator: post.user?.username ? `@${post.user.username}` : "@smartkingarena",
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: post.is_public && post.allow_indexing 
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export function generateVideoMetadata(video: VideoData): Metadata {
  const title = `${video.title} by ${video.user?.full_name || video.user?.username || "Player"}`;
  const description = video.description 
    || `Watch ${video.game ? `${video.game} ` : ""}${video.mode ? `${video.mode} ` : ""}gameplay video from ${video.user?.full_name || "a player"} on Smartking's Arena`;
  
  const canonicalUrl = `${SITE_CONFIG.url}/v/${video.slug}`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      images: video.thumbnail_url ? [{ url: video.thumbnail_url }] : [{ url: SITE_CONFIG.ogImage }],
      type: "video.other",
      videos: video.video_url ? [{
        url: video.video_url,
        secureUrl: video.video_url,
        type: "video/mp4",
      }] : undefined,
    },
    twitter: {
      card: "player",
      title,
      description,
      images: video.thumbnail_url ? [video.thumbnail_url] : [SITE_CONFIG.ogImage],
      creator: video.user?.username ? `@${video.user.username}` : "@smartkingarena",
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: video.is_public && video.allow_indexing 
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export function calculateTrendingScore(item: {
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  watch_time_seconds?: number;
}): number {
  const ageInHours = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60);
  const decayFactor = Math.exp(-ageInHours / 72);
  
  const engagementScore = 
    (item.view_count * 1) +
    (item.like_count * 5) +
    (item.comment_count * 10) +
    ((item.watch_time_seconds || 0) * 0.1);
  
  return engagementScore * decayFactor;
}

export function sortByTrending<T extends {
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  watch_time_seconds?: number;
}>(items: T[]): T[] {
  return [...items].sort((a, b) => 
    calculateTrendingScore(b) - calculateTrendingScore(a)
  );
}
