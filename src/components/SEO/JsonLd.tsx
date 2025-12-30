import { SITE_CONFIG } from "@/lib/seo-config";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_CONFIG.name,
    "url": SITE_CONFIG.url,
    "logo": `${SITE_CONFIG.url}/logo.png`,
    "sameAs": [
      SITE_CONFIG.links.twitter,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_CONFIG.name,
    "url": SITE_CONFIG.url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_CONFIG.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function TournamentJsonLd({ 
  name, 
  description, 
  startDate, 
  url, 
  price,
  game
}: { 
  name: string; 
  description: string; 
  startDate: string; 
  url: string; 
  price: string;
  game: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": name,
    "description": description,
    "startDate": startDate,
    "location": {
      "@type": "VirtualLocation",
      "url": url
    },
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": "INR",
      "url": url
    },
    "organizer": {
      "@type": "Organization",
      "name": SITE_CONFIG.name,
      "url": SITE_CONFIG.url
    },
    "about": {
      "@type": "Game",
      "name": game
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ProfileJsonLd({ 
  name, 
  username, 
  image, 
  url 
}: { 
  name: string; 
  username: string; 
  image?: string; 
  url: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": name,
      "additionalName": username,
      "image": image,
      "url": url
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
