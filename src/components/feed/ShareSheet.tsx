"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Link as LinkIcon, Send, MessageCircle, MoreHorizontal, Instagram, Twitter, Facebook, Copy, Plus } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { toast } from "sonner";
import type { FeedItem } from "@/app/api/feed/route";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

interface ShareSheetProps {
  item: FeedItem;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareSheet({ item, isOpen, onClose }: ShareSheetProps) {
  const { user } = useAuth(false);
  const [loading, setLoading] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/${item.type === "video" ? "v" : "p"}/${item.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
    onClose();
  };

  const handleAddToStory = async () => {
    if (!user) {
      toast.error("Please sign in to share to story");
      return;
    }

    setLoading(true);
    try {
      // Create a story with post_id
      const { error } = await supabase.from("stories").insert({
        user_id: user.id,
        media_url: item.thumbnail_url || "", // Use post thumbnail as story background/media
        media_type: "image",
        post_id: item.id,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      if (error) throw error;

      toast.success("Shared to your story!");
      onClose();
      // Refresh stories if needed, but usually handled by realtime or parent state
      window.dispatchEvent(new CustomEvent("refresh-stories"));
    } catch (error: any) {
      toast.error(error.message || "Failed to share to story");
    } finally {
      setLoading(false);
    }
  };

  const shareOptions = [
    { icon: <Copy size={20} />, label: "Copy link", onClick: handleCopyLink },
    { icon: <Instagram size={20} />, label: "Instagram", onClick: () => toast.info("Opening Instagram...") },
    { icon: <Twitter size={20} />, label: "X / Twitter", onClick: () => toast.info("Opening X...") },
    { icon: <Facebook size={20} />, label: "Facebook", onClick: () => toast.info("Opening Facebook...") },
  ];

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-white rounded-t-[32px] border-none px-4 pb-8">
        <div className="mx-auto w-12 h-1.5 bg-gray-200 rounded-full my-4" />
        
        <div className="grid grid-cols-4 gap-4 mb-8">
          <button
            onClick={handleAddToStory}
            disabled={loading}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shadow-md">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
              ) : (
                <Plus size={24} strokeWidth={3} />
              )}
            </div>
            <span className="text-[10px] font-bold text-[#1A1A1A]">Add to story</span>
          </button>

          {shareOptions.map((option, i) => (
            <button
              key={i}
              onClick={option.onClick}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 rounded-full bg-gray-100 text-[#1A1A1A] flex items-center justify-center border border-gray-200">
                {option.icon}
              </div>
              <span className="text-[10px] font-bold text-[#1A1A1A]">{option.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-black text-gray-400 px-2 uppercase tracking-wider">Send to</p>
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 w-16">
                <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200" />
                <div className="h-2 w-10 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
