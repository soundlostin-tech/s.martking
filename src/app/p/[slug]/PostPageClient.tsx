"use client";

import { PostData } from "@/lib/content-seo";
import { BottomNav } from "@/components/layout/BottomNav";
import { BentoCard } from "@/components/ui/BentoCard";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Eye, Share2, Calendar, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { ArticleJsonLd } from "@/components/SEO/ContentJsonLd";
import Image from "next/image";

export function PostPageClient({ post }: { post: PostData }) {
  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1A1A1A]">
      <ArticleJsonLd post={post} />
      
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
          <h1 className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Post</h1>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-center shadow-sm"
          >
            <Share2 size={18} className="text-[#1A1A1A]" />
          </motion.button>
        </div>
      </header>

      <main className="pb-24 px-4 pt-4">
        {post.thumbnail_url && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4 shadow-lg">
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        <BentoCard variant="white" className="p-6 mb-4 shadow-lg border-none">
          <div className="flex items-center gap-3 mb-4">
            {post.game && (
              <span className="px-2.5 py-1 bg-[#A8E6CF] rounded-lg text-[8px] font-black uppercase tracking-wide text-[#1A1A1A] flex items-center gap-1">
                <Gamepad2 size={10} />
                {post.game}
              </span>
            )}
            {post.mode && (
              <span className="px-2.5 py-1 bg-[#A8D8EA] rounded-lg text-[8px] font-black uppercase tracking-wide text-[#1A1A1A]">
                {post.mode}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-heading font-black text-[#1A1A1A] mb-3 leading-tight tracking-tight">
            {post.title}
          </h1>

          <Link href={`/u/${post.user?.username || post.user?.id}`} className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center overflow-hidden border border-[#E5E7EB]">
              {post.user?.avatar_url ? (
                <img src={post.user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-black text-[#9CA3AF]">{post.user?.full_name?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-black text-[#1A1A1A]">{post.user?.full_name || post.user?.username}</p>
              <p className="text-[9px] font-bold text-[#6B7280] flex items-center gap-1">
                <Calendar size={10} />
                {formattedDate}
              </p>
            </div>
          </Link>

          {post.description && (
            <p className="text-sm text-[#4B5563] leading-relaxed">{post.description}</p>
          )}
        </BentoCard>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <BentoCard variant="mint" size="compact" className="p-4 text-center border-none shadow">
            <Eye size={16} className="mx-auto mb-1 text-[#1A1A1A]" />
            <p className="text-lg font-black text-[#1A1A1A]">{post.view_count.toLocaleString()}</p>
            <p className="text-[8px] font-black text-[#1A1A1A]/60 uppercase tracking-wide">Views</p>
          </BentoCard>
          <BentoCard variant="pink" size="compact" className="p-4 text-center border-none shadow">
            <Heart size={16} className="mx-auto mb-1 text-[#1A1A1A]" />
            <p className="text-lg font-black text-[#1A1A1A]">{post.like_count.toLocaleString()}</p>
            <p className="text-[8px] font-black text-[#1A1A1A]/60 uppercase tracking-wide">Likes</p>
          </BentoCard>
          <BentoCard variant="blue" size="compact" className="p-4 text-center border-none shadow">
            <MessageCircle size={16} className="mx-auto mb-1 text-[#1A1A1A]" />
            <p className="text-lg font-black text-[#1A1A1A]">{post.comment_count.toLocaleString()}</p>
            <p className="text-[8px] font-black text-[#1A1A1A]/60 uppercase tracking-wide">Comments</p>
          </BentoCard>
        </div>

        {post.content && (
          <BentoCard variant="white" className="p-6 shadow-lg border-none">
            <div className="prose prose-sm max-w-none text-[#4B5563]">
              {post.content}
            </div>
          </BentoCard>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
