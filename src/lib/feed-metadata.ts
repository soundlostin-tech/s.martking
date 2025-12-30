import { Metadata } from "next";
import { SITE_CONFIG } from "./seo-config";

interface FeedPageMetadataOptions {
  type?: "trending" | "latest" | "following";
  game?: string;
  page?: number;
}

export function generateFeedPageMetadata(options: FeedPageMetadataOptions = {}): Metadata {
  const { type = "trending", game, page = 1 } = options;

  let title = "Player Feed";
  let description = "Discover posts and videos from top gaming players at Smartking's Arena.";

  if (type === "trending") {
    title = "Trending Content";
    description = "See what's trending - the hottest gaming posts and videos from players at Smartking's Arena.";
  } else if (type === "latest") {
    title = "Latest Posts";
    description = "Fresh content from gaming players. See the newest posts and videos at Smartking's Arena.";
  } else if (type === "following") {
    title = "Following Feed";
    description = "Content from players you follow at Smartking's Arena.";
  }

  if (game) {
    title = `${game} Content`;
    description = `Watch ${game} gameplay highlights, tutorials, and clips from top players at Smartking's Arena.`;
  }

  if (page > 1) {
    title = `${title} - Page ${page}`;
  }

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      url: `${SITE_CONFIG.url}/feed`,
      siteName: SITE_CONFIG.name,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
    },
  };
}

export function generateProfileMetadata(profile: {
  username?: string | null;
  full_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  followers_count?: number;
  win_rate?: number;
}): Metadata {
  const displayName = profile.full_name || profile.username || "Player";
  const title = `${displayName} (@${profile.username})`;
  const description = profile.bio 
    || `${displayName} is a competitive player at Smartking's Arena with ${profile.followers_count || 0} followers and ${profile.win_rate || 0}% win rate.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      url: `${SITE_CONFIG.url}/u/${profile.username}`,
      siteName: SITE_CONFIG.name,
      type: "profile",
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : [{ url: SITE_CONFIG.ogImage }],
    },
    twitter: {
      card: "summary",
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : [SITE_CONFIG.ogImage],
    },
  };
}

export function generateSearchMetadata(query?: string): Metadata {
  if (query) {
    return {
      title: `Search results for "${query}"`,
      description: `Find players, posts, and videos matching "${query}" at Smartking's Arena.`,
      robots: { index: false, follow: true },
    };
  }

  return {
    title: "Search",
    description: "Search for players, posts, and videos at Smartking's Arena.",
  };
}
