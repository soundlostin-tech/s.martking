"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
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

export function Stories() {
  const { user, profile } = useAuth(false);
  const [userStories, setUserStories] = useState<UserStories[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

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
    } else if (selectedUserIndex < userStories.length - 1) {
      setSelectedUserIndex(prev => prev! + 1);
      setCurrentStoryIndex(0);
    } else {
      closeStory();
    }
  };

  const prevStory = () => {
    if (selectedUserIndex === null) return;
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else if (selectedUserIndex > 0) {
      setSelectedUserIndex(prev => prev! - 1);
      setCurrentStoryIndex(userStories[selectedUserIndex - 1].stories.length - 1);
    } else {
      closeStory();
    }
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

  return (
    <>
      <section className="py-2">
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 items-start">
          {/* Create Story Button */}
          {user && (
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <label className="cursor-pointer group rounded-full">
                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleUpload} disabled={uploading} />
                <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-[#FEF3C7] to-[#FCD34D] shadow-sm relative">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover opacity-60" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all rounded-full">
                      {uploading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                      ) : (
                        <Plus className="text-white" size={24} strokeWidth={3} />
                      )}
                    </div>
                  </div>
                </div>
              </label>
              <span className="text-[8px] font-black text-[#1A1A1A] uppercase tracking-wide">You</span>
            </div>
          )}

          {/* User Stories */}
          {userStories.map((group, index) => (
            <div key={group.user.id} className="flex-shrink-0 flex flex-col items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => openStory(index)}
                  className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-[#5FD3BC] to-[#A8E6CF] shadow-sm active:opacity-75 transition-opacity focus:outline-none focus:ring-0"
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
              <span className="text-[8px] font-black text-[#1A1A1A] uppercase tracking-wide truncate max-w-[64px]">
                {group.user.full_name?.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Story Viewer Overlay */}
      <AnimatePresence>
        {selectedUserIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
          >
            <div className="relative w-full max-w-md h-full bg-black overflow-hidden flex flex-col">
              {/* Progress Bars */}
              <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
                {userStories[selectedUserIndex].stories.map((_, i) => (
                  <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
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
              <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-lg">
                    <img src={userStories[selectedUserIndex].user.avatar_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white shadow-sm">{userStories[selectedUserIndex].user.full_name}</p>
                    <p className="text-[10px] font-bold text-white/60 shadow-sm uppercase tracking-widest">
                      {new Date(userStories[selectedUserIndex].stories[currentStoryIndex].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <button onClick={closeStory} className="w-10 h-10 flex items-center justify-center text-white">
                  <X size={24} strokeWidth={3} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 flex items-center justify-center relative">
                {userStories[selectedUserIndex].stories[currentStoryIndex].media_type === 'video' ? (
                  <video
                    src={userStories[selectedUserIndex].stories[currentStoryIndex].media_url}
                    className="w-full max-h-full object-contain"
                    autoPlay
                    playsInline
                  />
                ) : (
                  <img
                    src={userStories[selectedUserIndex].stories[currentStoryIndex].media_url}
                    className="w-full max-h-full object-contain"
                    alt=""
                  />
                )}

                {/* Navigation Controls */}
                <div className="absolute inset-0 flex">
                  <div className="flex-1 cursor-pointer" onClick={prevStory} />
                  <div className="flex-1 cursor-pointer" onClick={nextStory} />
                </div>
              </div>

              {/* Caption */}
              {userStories[selectedUserIndex].stories[currentStoryIndex].caption && (
                <div className="absolute bottom-10 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-sm font-bold text-center italic">
                    "{userStories[selectedUserIndex].stories[currentStoryIndex].caption}"
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
