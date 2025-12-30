"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FeedCard } from "./FeedCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import type { FeedItem } from "@/app/api/feed/route";

interface FeedListProps {
  userId?: string;
  initialItems?: FeedItem[];
}

export function FeedList({ userId, initialItems = [] }: FeedListProps) {
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [loading, setLoading] = useState(initialItems.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchFeed = useCallback(async (nextCursor?: string | null) => {
    if (nextCursor) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams();
      params.set("limit", "10");
      if (userId) params.set("user_id", userId);
      if (nextCursor) params.set("cursor", nextCursor);

      const res = await fetch(`/api/feed?${params.toString()}`);
      const data = await res.json();

      if (data.items) {
        if (nextCursor) {
          setItems((prev) => [...prev, ...data.items]);
        } else {
          setItems(data.items);
        }
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error("Failed to fetch feed:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [userId]);

  useEffect(() => {
    if (initialItems.length === 0) {
      fetchFeed();
    }
  }, [fetchFeed, initialItems.length]);

  useEffect(() => {
    if (!hasMore || loadingMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && cursor) {
          fetchFeed(cursor);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasMore, loadingMore, cursor, fetchFeed]);

  const handleLikeChange = (id: string, liked: boolean, newCount: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_liked: liked, like_count: newCount } : item
      )
    );
  };

  const handleFollowChange = (targetUserId: string, following: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.user.id === targetUserId ? { ...item, is_following: following } : item
      )
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="p-3 flex items-center gap-2.5">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-12 text-center bg-white rounded-2xl shadow-sm border border-[#E5E7EB]">
        <p className="text-[#6B7280] text-sm font-bold">No posts yet</p>
        <p className="text-[#9CA3AF] text-xs mt-1">Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <FeedCard
          key={item.id}
          item={item}
          userId={userId}
          onLikeChange={handleLikeChange}
          onFollowChange={handleFollowChange}
        />
      ))}

      <div ref={loadMoreRef} className="py-4 flex justify-center">
        {loadingMore && (
          <Loader2 className="w-6 h-6 animate-spin text-[#6B7280]" />
        )}
        {!hasMore && items.length > 0 && (
          <p className="text-xs text-[#9CA3AF] font-bold">You've seen it all!</p>
        )}
      </div>
    </div>
  );
}
