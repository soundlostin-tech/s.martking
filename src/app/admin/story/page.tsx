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
    caption: "",
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
      <main className="min-h-screen pb-32 bg-off-white text-onyx font-sans">
        <div className="px-8 pt-24 relative z-10 max-w-6xl mx-auto space-y-16">
          {/* Hero Header */}
          <header className="relative flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="absolute -top-20 -left-10 w-64 h-64 bg-pastel-lavender/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-[2px] bg-onyx/10" />
                <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.4em]">Engagement Control</p>
              </div>
              <h1 className="text-[64px] font-black leading-[0.85] tracking-[-0.04em]">
                Stories<br />
                <span className="text-onyx/20">Broadcast</span>
              </h1>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsCreateOpen(true)}
              className="h-16 px-10 bg-onyx text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 whitespace-nowrap hover:bg-carbon-black transition-all"
            >
              <Plus size={20} strokeWidth={3} />
              New Transmission
            </motion.button>
          </header>
  
          {/* Stories Feed Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[9/16] bg-white rounded-[40px] shadow-soft animate-pulse" />
              ))
            ) : stories.length > 0 ? (
              stories.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <BentoCard className="p-0 overflow-hidden border-none shadow-soft hover:shadow-2xl transition-all duration-500 group aspect-[9/16] relative bg-white rounded-[40px]">
                    {/* Media Container */}
                    <div className="absolute inset-0">
                      {s.media_type === 'video' ? (
                        <video src={s.media_url} className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700" muted autoPlay loop />
                      ) : (
                        <img src={s.media_url} alt="" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-onyx/90 via-onyx/20 to-transparent" />
                    </div>
  
                    {/* Interaction Overlay */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-between z-10 text-white">
                      <div className="flex justify-between items-start">
                        <div className="px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full flex items-center gap-3 border border-white/10">
                          <div className="w-1.5 h-1.5 rounded-full bg-soft-yellow animate-pulse shadow-[0_0_8px_#FEF9C3]" />
                          <span className="text-[9px] font-black uppercase tracking-[0.2em]">{s.media_type}</span>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(s.id)}
                          className="w-12 h-12 bg-white/10 hover:bg-pastel-coral/80 text-white rounded-full flex items-center justify-center backdrop-blur-xl transition-all border border-white/10"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
  
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-xl font-black leading-tight tracking-tight line-clamp-2 drop-shadow-2xl">{s.caption || "Arena Update"}</h3>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center border border-white/10">
                              <Users size={10} />
                            </div>
                            <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em] truncate">{s.profiles?.full_name}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/10">
                          <div className="flex flex-col gap-1">
                            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Reach</p>
                            <div className="flex items-center gap-2">
                              <Eye size={12} className="text-soft-yellow" />
                              <span className="text-sm font-black tracking-tight">1.2K</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Duration</p>
                            <div className="flex items-center gap-2">
                              <Clock size={12} className="text-white/40" />
                              <span className="text-[9px] font-black uppercase">24H</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </BentoCard>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-40 text-center flex flex-col items-center gap-8 bg-white/50 rounded-[48px] border-2 border-dashed border-black/[0.03]">
                <div className="w-24 h-24 bg-off-white rounded-[32px] flex items-center justify-center opacity-20 rotate-12">
                  <Video size={48} />
                </div>
                <div className="space-y-2">
                  <p className="text-[14px] font-black uppercase tracking-[0.4em] text-charcoal/40">Transmission Void</p>
                  <p className="text-[10px] font-bold text-charcoal/20 uppercase tracking-widest italic">No stories currently broadcasting to the arena</p>
                </div>
              </div>
            )}
          </section>
        </div>
  
        {/* Broadcast Modal */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="p-0 border-none bg-off-white rounded-[48px] overflow-hidden max-w-[480px] shadow-2xl">
            <div className="bg-onyx p-12 text-white relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <DialogTitle className="text-[42px] font-black leading-none tracking-tight">Deploy<br />Narrative</DialogTitle>
                <DialogDescription className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em]">Visual Broadcast Protocol</DialogDescription>
              </div>
              <Play size={140} className="absolute -bottom-10 -right-10 text-white/5 rotate-[-15deg] fill-current" />
            </div>
            
            <div className="p-12 space-y-10">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em] ml-2">Caption / Title</label>
                  <Input 
                      placeholder="e.g. THE FINAL STAND" 
                      value={formData.caption}
                      onChange={(e) => setFormData({...formData, caption: e.target.value})}
                      className="h-16 rounded-[24px] border-none bg-white font-black text-[13px] px-6 shadow-soft placeholder:text-charcoal/10"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setFormData({...formData, media_type: 'image'})}
                    className={cn(
                      "h-20 rounded-[24px] border-2 flex items-center justify-center gap-3 transition-all",
                      formData.media_type === 'image' 
                        ? "bg-onyx text-white border-onyx shadow-xl" 
                        : "bg-white border-black/[0.03] text-charcoal/40 hover:bg-off-white"
                    )}
                  >
                    <ImageIcon size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Still Frame</span>
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, media_type: 'video'})}
                    className={cn(
                      "h-20 rounded-[24px] border-2 flex items-center justify-center gap-3 transition-all",
                      formData.media_type === 'video' 
                        ? "bg-onyx text-white border-onyx shadow-xl" 
                        : "bg-white border-black/[0.03] text-charcoal/40 hover:bg-off-white"
                    )}
                  >
                    <Video size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Motion Clip</span>
                  </button>
                </div>
  
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em] ml-2">Asset Source (URL)</label>
                  <Input 
                    placeholder="https://assets.arena.com/clip.mp4" 
                    value={formData.media_url}
                    onChange={(e) => setFormData({...formData, media_url: e.target.value})}
                    className="h-16 rounded-[24px] border-none bg-white font-black text-[13px] px-6 shadow-soft placeholder:text-charcoal/10"
                  />
                </div>
              </div>
              
              <DialogFooter className="pt-8 border-t border-black/[0.03]">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreate}
                  disabled={creating}
                  className="w-full py-6 bg-onyx text-white rounded-[24px] text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50 transition-all hover:bg-carbon-black"
                >
                  {creating ? <Loader2 className="animate-spin" /> : (
                    <>
                      <Zap size={20} className="text-soft-yellow" fill="currentColor" />
                      Execute Transmission
                    </>
                  )}
                </motion.button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
  
        <AdminNav />
      </main>
    );
}
