"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useRef } from "react";
import { Heart, MessageCircle, Share2, Play, Eye, UserPlus, UserCheck, Gamepad2 } from "lucide-react";
import { toast } from "sonner";
import type { FeedItem } from "@/app/api/feed/route";
import { ShareSheet } from "./ShareSheet";

interface FeedCardProps {
  item: FeedItem;
  userId?: string;
  onLikeChange?: (id: string, liked: boolean, newCount: number) => void;
  onFollowChange?: (userId: string, following: boolean) => void;
}

export function FeedCard({ item, userId, onLikeChange, onFollowChange }: FeedCardProps) {
  const [liked, setLiked] = useState(item.is_liked || false);
  const [likeCount, setLikeCount] = useState(item.like_count);
  const [following, setFollowing] = useState(item.is_following || false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likePending, setLikePending] = useState(false);
  const [followPending, setFollowPending] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      toast.error("Please sign in to like");
      return;
    }

    if (likePending) return;
    setLikePending(true);

    const newLiked = !liked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;

    setLiked(newLiked);
    setLikeCount(newCount);

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          target_type: item.type,
          target_id: item.id,
          action: newLiked ? "like" : "unlike",
        }),
      });

      if (!res.ok) throw new Error();
      onLikeChange?.(item.id, newLiked, newCount);
    } catch {
      setLiked(!newLiked);
      setLikeCount(likeCount);
      toast.error("Failed to update like");
    } finally {
      setLikePending(false);
    }
  };

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      toast.error("Please sign in to follow");
      return;
    }

    if (userId === item.user.id) {
      toast.error("Cannot follow yourself");
      return;
    }

    if (followPending) return;
    setFollowPending(true);

    const newFollowing = !following;
    setFollowing(newFollowing);

    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          follower_id: userId,
          following_id: item.user.id,
          action: newFollowing ? "follow" : "unfollow",
        }),
      });

      if (!res.ok) throw new Error();
      onFollowChange?.(item.user.id, newFollowing);
      toast.success(newFollowing ? "Following!" : "Unfollowed");
    } catch {
      setFollowing(!newFollowing);
      toast.error("Failed to update follow");
    } finally {
      setFollowPending(false);
    }
  };

    const handleShare = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsShareOpen(true);
    };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const contentUrl = `/${item.type === "video" ? "v" : "p"}/${item.slug}`;
  const profileUrl = `/u/${item.user.username || item.user.id}`;

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden"
    >
      <div className="p-3 flex items-center justify-between">
        <Link href={profileUrl} className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] flex items-center justify-center overflow-hidden flex-shrink-0 border border-[#E5E7EB]">
            {item.user.avatar_url ? (
              <img src={item.user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-black text-[#9CA3AF]">
                {item.user.full_name?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-[#1A1A1A] truncate">
              {item.user.full_name || item.user.username || "Player"}
            </p>
            <p className="text-[9px] text-[#6B7280] font-bold">{timeAgo(item.created_at)}</p>
          </div>
        </Link>

        {userId !== item.user.id && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleFollow}
            disabled={followPending}
            className={`px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wide flex items-center gap-1 transition-colors ${
              following
                ? "bg-[#F3F4F6] text-[#6B7280]"
                : "bg-[#1A1A1A] text-white"
            }`}
          >
            {following ? <UserCheck size={10} /> : <UserPlus size={10} />}
            {following ? "Following" : "Follow"}
          </motion.button>
        )}
      </div>

      <Link href={contentUrl}>
        <div className="relative aspect-[4/3] bg-[#1A1A1A]">
          {item.type === "video" && item.video_url ? (
            <>
              <video
                ref={videoRef}
                src={item.video_url}
                poster={item.thumbnail_url || undefined}
                className="w-full h-full object-cover"
                preload="metadata"
                playsInline
                muted
                loop
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              {!isPlaying && (
                <button
                  onClick={handleVideoClick}
                  className="absolute inset-0 flex items-center justify-center bg-black/20"
                >
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <Play size={20} className="text-[#1A1A1A] ml-0.5" fill="#1A1A1A" />
                  </div>
                </button>
              )}
              {item.duration_seconds && (
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-[9px] font-bold text-white">
                  {Math.floor(item.duration_seconds / 60)}:{(item.duration_seconds % 60).toString().padStart(2, "0")}
                </div>
              )}
            </>
          ) : item.thumbnail_url ? (
            <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#A8E6CF] to-[#A8D8EA]">
              <span className="text-4xl font-heading font-black text-white/30">POST</span>
            </div>
          )}

          {(item.game || item.mode) && (
            <div className="absolute top-2 left-2 flex gap-1.5">
              {item.game && (
                <span className="px-2 py-0.5 bg-black/60 backdrop-blur rounded-lg text-[8px] font-black text-white flex items-center gap-1">
                  <Gamepad2 size={10} />
                  {item.game}
                </span>
              )}
              {item.mode && (
                <span className="px-2 py-0.5 bg-white/80 backdrop-blur rounded-lg text-[8px] font-black text-[#1A1A1A]">
                  {item.mode}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              disabled={likePending}
              className="flex items-center gap-1.5"
            >
              <Heart
                size={20}
                className={`transition-colors ${liked ? "text-red-500 fill-red-500" : "text-[#6B7280]"}`}
              />
              <span className="text-xs font-bold text-[#1A1A1A]">{formatCount(likeCount)}</span>
            </motion.button>

            <Link href={contentUrl} className="flex items-center gap-1.5">
              <MessageCircle size={20} className="text-[#6B7280]" />
              <span className="text-xs font-bold text-[#1A1A1A]">{formatCount(item.comment_count)}</span>
            </Link>

            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleShare}
              className="flex items-center gap-1.5"
            >
              <Share2 size={18} className="text-[#6B7280]" />
            </motion.button>
          </div>

          <div className="flex items-center gap-1 text-[#9CA3AF]">
            <Eye size={14} />
            <span className="text-[10px] font-bold">{formatCount(item.view_count)}</span>
          </div>
        </div>

        <Link href={contentUrl}>
          <h3 className="text-sm font-black text-[#1A1A1A] line-clamp-2 leading-tight mb-1">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-xs text-[#6B7280] line-clamp-2">{item.description}</p>
          )}
        </Link>
      </div>
      <ShareSheet
        item={item}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </motion.div>
  );
}
