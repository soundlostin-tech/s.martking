import { generateFeedPageMetadata } from "@/lib/feed-metadata";
import { FeedPageClient } from "./FeedPageClient";

export const metadata = generateFeedPageMetadata({ type: "trending" });

export default function FeedPage() {
  return <FeedPageClient />;
}
