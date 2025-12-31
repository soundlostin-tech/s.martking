"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, Share2, MessageCircle, UserPlus, MousePointer2, Info, MoreHorizontal, Send, Download, Upload, Trash2, BarChart2, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface Viewer {
  id: string;
  viewer: {
    id: string;
    full_name: string;
    avatar_url: string;
    username: string;
  };
  created_at: string;
}

interface Story {
  id: string;
  media_url: string;
  media_type: string;
  created_at: string;
}

interface StoryInsightsProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string;
  allStories: Story[];
  onSelectStory: (id: string) => void;
}

export function StoryInsights({ isOpen, onClose, storyId, allStories, onSelectStory }: StoryInsightsProps) {
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'viewers' | 'insights'>('viewers');

  useEffect(() => {
    if (isOpen && storyId) {
      fetchViewers();
    }
  }, [isOpen, storyId]);

  const fetchViewers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("story_views")
        .select(`
          id,
          created_at,
          viewer:profiles(id, full_name, avatar_url, username)
        `)
        .eq("story_id", storyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setViewers(data as any);
    } catch (error) {
      console.error("Error fetching viewers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[110] bg-white flex flex-col sm:max-w-md sm:mx-auto sm:inset-y-4 sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header with Horizontal Story List */}
        <div className="bg-white border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between p-4 pb-2">
            <button className="p-1">
              <TrendingUp size={20} className="text-gray-400" />
            </button>
            <div className="flex gap-4">
              <button className="text-gray-400"><Download size={20} /></button>
              <button className="text-gray-400"><Upload size={20} /></button>
              <button className="text-gray-400"><Share2 size={20} /></button>
              <button className="text-gray-400"><Trash2 size={20} /></button>
            </div>
            <button onClick={onClose} className="p-1 text-gray-500">
              <X size={24} />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-4 scroll-smooth">
            {allStories.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectStory(s.id)}
                className={`relative flex-shrink-0 w-20 aspect-[9/16] rounded-lg overflow-hidden border-2 transition-all ${
                  s.id === storyId ? "border-blue-500 scale-105" : "border-transparent opacity-60"
                }`}
              >
                {s.media_type === 'video' ? (
                  <video src={s.media_url} className="w-full h-full object-cover" />
                ) : (
                  <img src={s.media_url} className="w-full h-full object-cover" alt="" />
                )}
                {s.id === storyId && (
                  <div className="absolute inset-0 bg-black/10 flex items-end justify-center pb-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                  </div>
                )}
                <div className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-black/40 px-1 rounded text-[8px] text-white font-bold">
                  <Eye size={8} />
                  <span>{Math.floor(Math.random() * 1000) + 100}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex border-t border-gray-50">
            <button 
              onClick={() => setActiveTab('viewers')}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'viewers' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400'
              }`}
            >
              <BarChart2 size={18} />
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>{viewers.length}</span>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('insights')}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'insights' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400'
              }`}
            >
              <TrendingUp size={18} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-white no-scrollbar">
          {activeTab === 'viewers' ? (
            <div className="p-4 space-y-4">
              <h3 className="text-sm font-black text-[#1A1A1A] mb-2 uppercase tracking-tight">Viewers</h3>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-24 mb-1.5" />
                      <Skeleton className="h-2 w-32" />
                    </div>
                  </div>
                ))
              ) : viewers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Eye size={48} strokeWidth={1} className="mb-4 opacity-20" />
                  <p className="text-sm font-medium">No views yet</p>
                </div>
              ) : (
                viewers.map((v) => (
                  <div key={v.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                        <img 
                          src={v.viewer.avatar_url || `https://ui-avatars.com/api/?name=${v.viewer.full_name}&background=random`} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-[#1A1A1A] leading-none mb-0.5">{v.viewer.username || v.viewer.full_name}</span>
                        <span className="text-[10px] text-gray-400 font-bold">{v.viewer.full_name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal size={20} />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="p-6 space-y-8">
              <div>
                <h3 className="text-sm font-black text-[#1A1A1A] mb-6 uppercase tracking-tight">Interactions</h3>
                <div className="flex flex-col items-center mb-8">
                  <span className="text-5xl font-heading font-black text-[#1A1A1A] mb-1">14</span>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Actions taken from this story</span>
                </div>
                
                <div className="space-y-6">
                  {[
                    { label: "Shares", value: 4, icon: Share2 },
                    { label: "Replies", value: 5, icon: MessageCircle },
                    { label: "Profile Visits", value: 4, icon: UserPlus },
                    { label: "Sticker Taps", value: 1, sub: "#f8", icon: MousePointer2 }
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-[#1A1A1A]">{stat.label}</span>
                        {stat.sub && <span className="text-[10px] text-gray-400 font-bold">{stat.sub}</span>}
                      </div>
                      <span className="text-sm font-black text-[#1A1A1A]">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                  <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-tight">Discovery</h3>
                  <Info size={14} className="text-gray-300" />
                </div>
                
                <div className="flex flex-col items-center mb-8">
                  <span className="text-5xl font-heading font-black text-[#1A1A1A] mb-1">529</span>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Accounts reached with this story</span>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-[#1A1A1A]">Impressions</span>
                    <span className="text-sm font-black text-[#1A1A1A]">719</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
