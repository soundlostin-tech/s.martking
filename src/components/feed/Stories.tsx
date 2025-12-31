"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Plus, X, ChevronLeft, ChevronRight, Heart, Send, MessageCircle, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption?: string;
  created_at: string;
  expires_at: string;
  user: {
    id: string;
    full_name: string;
    avatar_url: string;
    username: string;
  };
}

interface UserStories {
  user: {
    id: string;
    full_name: string;
    avatar_url: string;
    username: string;
  };
  stories: Story[];
}

const REACTIONS = ["😂", "😮", "😍", "😢", "🙌", "🔥"];

export function Stories() {
  const { user, profile } = useAuth(false);
  const [userStories, setUserStories] = useState<UserStories[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from("stories")
        .select(`
          *,
          user:profiles(id, full_name, avatar_url, username)
        `)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by user
      const grouped: { [key: string]: UserStories } = {};
      data?.forEach((story: any) => {
        if (!grouped[story.user_id]) {
          grouped[story.user_id] = {
            user: story.user,
            stories: [],
          };
        }
        grouped[story.user_id].stories.push(story);
      });

      setUserStories(Object.values(grouped));
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `stories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("stories")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("stories")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("stories").insert({
        user_id: user.id,
        media_url: publicUrl,
        media_type: file.type.startsWith("video") ? "video" : "image",
      });

      if (dbError) throw dbError;

      toast.success("Story uploaded!");
      fetchStories();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const openStory = (index: number) => {
    setSelectedUserIndex(index);
    setCurrentStoryIndex(0);
    setIsLiked(false);
    setReplyText("");
  };

  const closeStory = () => {
    setSelectedUserIndex(null);
    setCurrentStoryIndex(0);
  };

  const nextStory = () => {
    if (selectedUserIndex === null) return;
    const stories = userStories[selectedUserIndex].stories;
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setIsLiked(false);
    } else if (selectedUserIndex < userStories.length - 1) {
      setSelectedUserIndex(prev => prev! + 1);
      setCurrentStoryIndex(0);
      setIsLiked(false);
    } else {
      closeStory();
    }
  };

  const prevStory = () => {
    if (selectedUserIndex === null) return;
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setIsLiked(false);
    } else if (selectedUserIndex > 0) {
      setSelectedUserIndex(prev => prev! - 1);
      setCurrentStoryIndex(userStories[selectedUserIndex - 1].stories.length - 1);
      setIsLiked(false);
    } else {
      closeStory();
    }
  };

  const handleReaction = (emoji: string) => {
    toast.success(`Reacted with ${emoji}`);
    // In a real app, you'd send this to the backend
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    toast.success("Reply sent!");
    setReplyText("");
  };

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 py-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-2 w-10" />
          </div>
        ))}
      </div>
    );
  }

  const storyGradients = [
    "from-[#F5E6A3] to-[#FFCDB2]", // Yellow to Peach
    "from-[#A8E6CF] to-[#7FDBCA]", // Mint to Teal
    "from-[#C9B6E4] to-[#A8D8EA]", // Purple to Blue
    "from-[#FFB6C1] to-[#F5A78E]", // Pink to Coral
  ];

  return (
    <>
      <section className="py-2">
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 items-start">
          {/* Create Story Button */}
          {user && (
            <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
              <label className="cursor-pointer group relative">
                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleUpload} disabled={uploading} />
                <div className="w-16 h-16 rounded-full p-[2px] bg-gray-200">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white relative">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center" />
                    )}
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#1A1A1A] rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                  {uploading ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <Plus className="text-white" size={14} strokeWidth={4} />
                  )}
                </div>
              </label>
              <span className="text-[10px] font-bold text-[#1A1A1A]/60">Your Story</span>
            </div>
          )}

          {/* User Stories */}
          {userStories.map((group, index) => (
            <div key={group.user.id} className="flex-shrink-0 flex flex-col items-center gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => openStory(index)}
                  className={`w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr ${storyGradients[index % storyGradients.length]} shadow-sm active:opacity-75 transition-opacity focus:outline-none focus:ring-0`}
                >
                <div className="w-full h-full rounded-full bg-white p-[2px] flex items-center justify-center overflow-hidden">
                  {group.user.avatar_url ? (
                    <img src={group.user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-black text-gray-400">{group.user.full_name?.[0]?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </motion.button>
              <span className="text-[10px] font-bold text-[#1A1A1A] truncate max-w-[64px]">
                {group.user.username || group.user.full_name?.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Story Viewer Overlay */}
      <AnimatePresence>
        {selectedUserIndex !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] bg-black sm:bg-black/90 sm:backdrop-blur-md flex flex-col items-center justify-center"
          >
            <div className="relative w-full max-w-md h-full sm:h-[90vh] sm:rounded-2xl bg-black overflow-hidden flex flex-col">
              {/* Progress Bars */}
              <div className="absolute top-4 left-3 right-3 flex gap-1 z-30">
                {userStories[selectedUserIndex].stories.map((_, i) => (
                  <div key={i} className="h-[2px] flex-1 bg-white/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: i < currentStoryIndex ? "100%" : i === currentStoryIndex ? "100%" : "0%" }}
                      transition={{ duration: i === currentStoryIndex ? 5 : 0, ease: "linear" }}
                      onAnimationComplete={() => {
                        if (i === currentStoryIndex) nextStory();
                      }}
                      className="h-full bg-white"
                    />
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden">
                    <img src={userStories[selectedUserIndex].user.avatar_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white">{userStories[selectedUserIndex].user.username || userStories[selectedUserIndex].user.full_name}</p>
                    <p className="text-[10px] text-white/60">
                      {new Date(userStories[selectedUserIndex].stories[currentStoryIndex].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-white p-1">
                    <MoreHorizontal size={20} />
                  </button>
                  <button onClick={closeStory} className="text-white p-1">
                    <X size={24} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex items-center justify-center relative bg-[#121212]">
                {userStories[selectedUserIndex].stories[currentStoryIndex].media_type === 'video' ? (
                  <video
                    src={userStories[selectedUserIndex].stories[currentStoryIndex].media_url}
                    className="w-full h-full object-cover sm:object-contain"
                    autoPlay
                    playsInline
                  />
                ) : (
                  <img
                    src={userStories[selectedUserIndex].stories[currentStoryIndex].media_url}
                    className="w-full h-full object-cover sm:object-contain"
                    alt=""
                  />
                )}

                {/* Navigation Controls */}
                <div className="absolute inset-0 flex">
                  <div className="w-[30%] cursor-pointer" onClick={prevStory} />
                  <div className="flex-1 cursor-pointer" onClick={nextStory} />
                </div>

                {/* Reactions Grid Overlay (Floating on long press or tap) */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                   {/* Here you could add floating animation elements */}
                </div>
              </div>

              {/* Bottom Interaction Bar */}
              <div className="p-4 bg-gradient-to-t from-black/60 to-transparent flex items-center gap-3 z-30">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="Send message" 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-transparent border border-white/40 rounded-full py-2.5 px-5 text-sm text-white placeholder:text-white/60 focus:outline-none focus:border-white transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  />
                  {replyText && (
                    <button 
                      onClick={handleSendReply}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white font-bold text-xs"
                    >
                      Send
                    </button>
                  )}
                </div>
                <motion.button 
                  whileTap={{ scale: 0.8 }}
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-1 ${isLiked ? 'text-red-500' : 'text-white'}`}
                >
                  <Heart size={24} fill={isLiked ? "currentColor" : "none"} strokeWidth={2} />
                </motion.button>
                <button className="text-white p-1">
                  <Send size={24} strokeWidth={2} />
                </button>
              </div>

              {/* Reactions Overlay */}
              {!replyText && (
                <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-4 py-4 z-30">
                  {REACTIONS.map((emoji) => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleReaction(emoji)}
                      className="text-2xl"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
