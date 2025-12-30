import { Metadata } from "next";
import { seoConfig, SITE_CONFIG } from "./seo-config";

export function constructMetadata({
  title,
  description,
  image = SITE_CONFIG.ogImage,
  noIndex = false,
  canonicalUrl,
}: {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
} = {}): Metadata {
  return {
    title: title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.name,
    description: description || SITE_CONFIG.description,
    openGraph: {
      title: title || SITE_CONFIG.name,
      description: description || SITE_CONFIG.description,
      url: SITE_CONFIG.url,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: image,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title || SITE_CONFIG.name,
      description: description || SITE_CONFIG.description,
      images: [image],
      creator: "@smartkingarena",
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    metadataBase: new URL(SITE_CONFIG.url),
    ...(canonicalUrl && {
      alternates: {
        canonical: canonicalUrl,
      },
    }),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

export function getMetadataForRoute(route: string): Metadata {
  const config = (seoConfig as any)[route] || seoConfig["/"];
  return constructMetadata({
    title: config.title,
    description: config.description,
    noIndex: config.noIndex,
    canonicalUrl: `${SITE_CONFIG.url}${route}`,
  });
}
