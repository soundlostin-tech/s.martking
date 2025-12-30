"use client";

import { VideoData } from "@/lib/content-seo";
import { BottomNav } from "@/components/layout/BottomNav";
import { BentoCard } from "@/components/ui/BentoCard";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Eye, Share2, Calendar, Gamepad2, Clock, Play } from "lucide-react";
import Link from "next/link";
import { VideoObjectJsonLd } from "@/components/SEO/ContentJsonLd";
import { useState, useRef } from "react";

export function VideoPageClient({ video }: { video: VideoData }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const formattedDate = new Date(video.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1A1A1A]">
      <VideoObjectJsonLd video={video} />
      
      <header className="sticky top-0 z-50 bg-[#F8F6F0]/80 backdrop-blur-xl border-b border-[#E5E7EB]">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-center shadow-sm"
            >
              <ArrowLeft size={18} className="text-[#1A1A1A]" />
            </motion.button>
          </Link>
          <h1 className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Video</h1>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-center shadow-sm"
          >
            <Share2 size={18} className="text-[#1A1A1A]" />
          </motion.button>
        </div>
      </header>

      <main className="pb-24 px-4 pt-4">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4 shadow-lg bg-black">
          {video.video_url ? (
            <>
              <video
                ref={videoRef}
                src={video.video_url}
                poster={video.thumbnail_url || undefined}
                className="w-full h-full object-contain"
                controls={isPlaying}
                preload="metadata"
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              {!isPlaying && (
                <button
                  onClick={handlePlayClick}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                >
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                    <Play size={28} className="text-[#1A1A1A] ml-1" fill="#1A1A1A" />
                  </div>
                </button>
              )}
            </>
          ) : video.thumbnail_url ? (
            <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A]">
              <Play size={48} className="text-white/50" />
            </div>
          )}
        </div>

        <BentoCard variant="white" className="p-6 mb-4 shadow-lg border-none">
          <div className="flex items-center gap-3 mb-4">
            {video.game && (
              <span className="px-2.5 py-1 bg-[#A8E6CF] rounded-lg text-[8px] font-black uppercase tracking-wide text-[#1A1A1A] flex items-center gap-1">
                <Gamepad2 size={10} />
                {video.game}
              </span>
            )}
            {video.mode && (
              <span className="px-2.5 py-1 bg-[#A8D8EA] rounded-lg text-[8px] font-black uppercase tracking-wide text-[#1A1A1A]">
                {video.mode}
              </span>
            )}
            {video.duration_seconds && (
              <span className="px-2.5 py-1 bg-[#FFB6C1] rounded-lg text-[8px] font-black uppercase tracking-wide text-[#1A1A1A] flex items-center gap-1">
                <Clock size={10} />
                {formatDuration(video.duration_seconds)}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-heading font-black text-[#1A1A1A] mb-3 leading-tight tracking-tight">
            {video.title}
          </h1>

          <Link href={`/u/${video.user?.username || video.user?.id}`} className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center overflow-hidden border border-[#E5E7EB]">
              {video.user?.avatar_url ? (
                <img src={video.user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-black text-[#9CA3AF]">{video.user?.full_name?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-black text-[#1A1A1A]">{video.user?.full_name || video.user?.username}</p>
              <p className="text-[9px] font-bold text-[#6B7280] flex items-center gap-1">
                <Calendar size={10} />
                {formattedDate}
              </p>
            </div>
          </Link>

          {video.description && (
            <p className="text-sm text-[#4B5563] leading-relaxed">{video.description}</p>
          )}
        </BentoCard>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <BentoCard variant="mint" size="compact" className="p-4 text-center border-none shadow">
            <Eye size={16} className="mx-auto mb-1 text-[#1A1A1A]" />
            <p className="text-lg font-black text-[#1A1A1A]">{video.view_count.toLocaleString()}</p>
            <p className="text-[8px] font-black text-[#1A1A1A]/60 uppercase tracking-wide">Views</p>
          </BentoCard>
          <BentoCard variant="pink" size="compact" className="p-4 text-center border-none shadow">
            <Heart size={16} className="mx-auto mb-1 text-[#1A1A1A]" />
            <p className="text-lg font-black text-[#1A1A1A]">{video.like_count.toLocaleString()}</p>
            <p className="text-[8px] font-black text-[#1A1A1A]/60 uppercase tracking-wide">Likes</p>
          </BentoCard>
          <BentoCard variant="blue" size="compact" className="p-4 text-center border-none shadow">
            <MessageCircle size={16} className="mx-auto mb-1 text-[#1A1A1A]" />
            <p className="text-lg font-black text-[#1A1A1A]">{video.comment_count.toLocaleString()}</p>
            <p className="text-[8px] font-black text-[#1A1A1A]/60 uppercase tracking-wide">Comments</p>
          </BentoCard>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
