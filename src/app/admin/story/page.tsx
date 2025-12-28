"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, 
  Search, 
  Loader2, 
  Layout, 
  Image as ImageIcon, 
  Clock, 
  Eye, 
  Trash2, 
  Zap,
  Play,
  Calendar,
  ChevronRight,
  Monitor,
  Video
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function AdminStory() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    media_url: "",
    media_type: "image",
    expires_at: new Date(Date.now() + 86400000).toISOString(),
  });

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("stories")
        .select(`*, profiles:user_id(full_name)`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleCreate = async () => {
    if (!formData.media_url) {
      toast.error("Media URL is required");
      return;
    }

    setCreating(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Unauthorized");

      const { error } = await supabase
        .from("stories")
        .insert({
          ...formData,
          user_id: userData.user.id
        });

      if (error) throw error;

      toast.success("Story broadcasted successfully!");
      setIsCreateOpen(false);
      fetchStories();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("stories").delete().eq("id", id);
      if (error) throw error;
      toast.success("Story removed from arena");
      fetchStories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <main className="p-8 space-y-10 max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em]">Engagement Loop</p>
          <h1 className="text-[40px] font-black leading-none">Stories</h1>
        </div>
        
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCreateOpen(true)}
          className="h-14 px-8 bg-onyx text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-3 whitespace-nowrap"
        >
          <Plus size={18} strokeWidth={3} />
          Broadcast New Story
        </motion.button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-80 bg-white/50 rounded-[2.5rem] animate-pulse" />
          ))
        ) : stories.length > 0 ? (
          stories.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <BentoCard className="p-0 overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all group aspect-[9/16] relative">
                {/* Media Preview */}
                <div className="absolute inset-0">
                  {s.media_type === 'video' ? (
                    <video src={s.media_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <img src={s.media_url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-onyx/80 via-transparent to-black/20" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10 text-white">
                  <div className="flex justify-between items-start">
                    <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full flex items-center gap-2">
                      <StatusBadge variant="live" className="text-[7px] bg-lime-yellow p-0 px-1.5 h-4 shadow-none" />
                      <span className="text-[8px] font-black uppercase tracking-widest">{s.media_type}</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(s.id)}
                      className="w-10 h-10 bg-white/10 hover:bg-pastel-coral/40 rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black leading-tight drop-shadow-lg">{s.title || "Arena Highlight"}</h3>
                      <p className="text-[9px] font-bold opacity-60 uppercase tracking-[0.2em]">By {s.profiles?.full_name}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex items-center gap-3">
                        <Eye size={14} className="text-lime-yellow" />
                        <span className="text-xs font-black">1.2K</span>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex items-center gap-3">
                        <Clock size={14} className="text-white/60" />
                        <span className="text-[9px] font-black uppercase">24H</span>
                      </div>
                    </div>
                  </div>
                </div>
              </BentoCard>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center space-y-6">
            <div className="w-20 h-20 bg-off-white rounded-full flex items-center justify-center mx-auto opacity-20 border border-black/5">
              <Layout size={40} />
            </div>
            <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em]">No broadcasts currently in circulation</p>
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="p-0 border-none bg-white rounded-[3rem] overflow-hidden max-w-[450px]">
          <div className="bg-pastel-lavender p-10">
            <DialogTitle className="text-3xl font-black mb-1">New Broadcast</DialogTitle>
            <DialogDescription className="text-[10px] font-bold opacity-40 uppercase tracking-widest text-onyx">Deploy visual narrative to arena home</DialogDescription>
          </div>
          <div className="p-10 space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Narrative Title</label>
                <Input 
                  placeholder="e.g. Pro League Warmup" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="h-14 rounded-xl border-black/[0.05] bg-off-white font-bold px-6"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setFormData({...formData, media_type: 'image'})}
                  className={cn(
                    "p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all",
                    formData.media_type === 'image' ? "bg-onyx text-white border-onyx shadow-xl" : "bg-off-white border-black/[0.05] text-charcoal/40"
                  )}
                >
                  <ImageIcon size={20} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Image Frame</span>
                </button>
                <button 
                  onClick={() => setFormData({...formData, media_type: 'video'})}
                  className={cn(
                    "p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all",
                    formData.media_type === 'video' ? "bg-onyx text-white border-onyx shadow-xl" : "bg-off-white border-black/[0.05] text-charcoal/40"
                  )}
                >
                  <Video size={20} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Motion Clip</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Asset URL</label>
                <Input 
                  placeholder="https://arena-assets.com/story-01.jpg" 
                  value={formData.media_url}
                  onChange={(e) => setFormData({...formData, media_url: e.target.value})}
                  className="h-14 rounded-xl border-black/[0.05] bg-off-white font-bold px-6"
                />
              </div>
            </div>
            
            <DialogFooter className="pt-6 border-t border-black/[0.03]">
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                disabled={creating}
                className="w-full py-5 bg-onyx text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3"
              >
                {creating ? <Loader2 className="animate-spin" /> : (
                  <>
                    <Zap size={18} fill="currentColor" />
                    Deploy Broadcast
                  </>
                )}
              </motion.button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
