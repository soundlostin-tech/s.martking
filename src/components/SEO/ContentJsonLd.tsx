import { SITE_CONFIG } from "@/lib/seo-config";
import { PostData, VideoData } from "@/lib/content-seo";

export function ArticleJsonLd({ post }: { post: PostData }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.description || `Gaming post on ${SITE_CONFIG.name}`,
    "image": post.thumbnail_url || SITE_CONFIG.ogImage,
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "author": {
      "@type": "Person",
      "name": post.user?.full_name || post.user?.username || "Player",
      "url": post.user?.username 
        ? `${SITE_CONFIG.url}/u/${post.user.username}` 
        : undefined,
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_CONFIG.name,
      "url": SITE_CONFIG.url,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_CONFIG.url}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_CONFIG.url}/p/${post.slug}`
    },
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ViewAction",
        "userInteractionCount": post.view_count
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": post.like_count
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/CommentAction",
        "userInteractionCount": post.comment_count
      }
    ],
    ...(post.game && { "about": { "@type": "Game", "name": post.game } }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function VideoObjectJsonLd({ video }: { video: VideoData }) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "PT0S";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let duration = "PT";
    if (hours > 0) duration += `${hours}H`;
    if (minutes > 0) duration += `${minutes}M`;
    if (secs > 0 || duration === "PT") duration += `${secs}S`;
    return duration;
  };

  const data = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.title,
    "description": video.description || `Gaming video on ${SITE_CONFIG.name}`,
    "thumbnailUrl": video.thumbnail_url || SITE_CONFIG.ogImage,
    "uploadDate": video.created_at,
    "duration": formatDuration(video.duration_seconds),
    "contentUrl": video.video_url,
    "embedUrl": `${SITE_CONFIG.url}/v/${video.slug}`,
    "author": {
      "@type": "Person",
      "name": video.user?.full_name || video.user?.username || "Player",
      "url": video.user?.username 
        ? `${SITE_CONFIG.url}/u/${video.user.username}` 
        : undefined,
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_CONFIG.name,
      "url": SITE_CONFIG.url,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_CONFIG.url}/logo.png`
      }
    },
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/WatchAction",
        "userInteractionCount": video.view_count
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": video.like_count
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/CommentAction",
        "userInteractionCount": video.comment_count
      }
    ],
    ...(video.game && { "about": { "@type": "Game", "name": video.game } }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function SocialMediaPostingJsonLd({ post }: { post: PostData }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    "headline": post.title,
    "articleBody": post.description || post.content,
    "image": post.thumbnail_url || SITE_CONFIG.ogImage,
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "author": {
      "@type": "Person",
      "name": post.user?.full_name || post.user?.username || "Player",
      "url": post.user?.username 
        ? `${SITE_CONFIG.url}/u/${post.user.username}` 
        : undefined,
    },
    "sharedContent": {
      "@type": "WebPage",
      "url": `${SITE_CONFIG.url}/p/${post.slug}`
    },
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ViewAction",
        "userInteractionCount": post.view_count
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": post.like_count
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/CommentAction",
        "userInteractionCount": post.comment_count
      }
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
