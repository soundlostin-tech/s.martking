"use client";

import { AdminNav } from "@/components/layout/AdminNav";
import { BentoCard } from "@/components/ui/BentoCard";
import { 
  Play, 
  Trash2, 
  Loader2, 
  Eye, 
  Calendar, 
  Clock,
  User as UserIcon,
  Zap,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  ArrowRight
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption: string;
  created_at: string;
  expires_at: string;
  user?: {
    full_name: string;
    avatar_url: string;
  };
}

export default function AdminStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("stories")
        .select(`
          *,
          user:profiles(full_name, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this highlight from the arena?")) return;
    setIsDeleting(id);
    try {
      const { error } = await supabase.from("stories").delete().eq("id", id);
      if (error) throw error;
      toast.success("Highlight purged successfully");
      fetchStories();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredStories = useMemo(() => {
    return stories.filter(s => {
      const matchesSearch = s.user?.full_name?.toLowerCase().includes(search.toLowerCase()) || 
                           s.caption?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || s.media_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [stories, search, typeFilter]);

  const stats = useMemo(() => {
    const total = stories.length;
    const active = stories.filter(s => new Date(s.expires_at) > new Date()).length;
    const videos = stories.filter(s => s.media_type === 'video').length;
    return { total, active, videos };
  }, [stories]);

  return (
      <main className="min-h-screen pb-32 bg-[#F8F6F0] text-[#1A1A1A]">
      <div className="px-8 pt-24 relative z-10 space-y-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-[0.3em] mb-2">CONTENT MODERATION</p>
            <h1 className="text-[44px] font-heading font-black leading-none tracking-tight text-[#1A1A1A]">
              ARENA <br />
              <span className="text-[#6B7280]/40">HIGHLIGHTS</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-md border-2 border-[#E5E7EB]">
            <div className="w-2 h-2 rounded-full bg-[#5FD3BC] animate-pulse" />
            <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">SIGNAL LIVE</p>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Total Feeds", value: stats.total, icon: Radio, color: "mint" },
            { label: "Active Signals", value: stats.active, icon: Signal, color: "blue" },
            { label: "Video Intel", value: stats.videos, icon: Play, color: "pink" },
          ].map((stat, i) => (
            <BentoCard key={i} variant={stat.color as any} className="p-8 shadow-xl relative overflow-hidden group border-none">
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[#1A1A1A]/40">{stat.label}</p>
                  <h3 className="text-4xl font-heading font-black text-[#1A1A1A]">{stat.value}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] text-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                  <stat.icon size={22} strokeWidth={3} />
                </div>
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                <ImageIcon size={140} strokeWidth={1} />
              </div>
            </BentoCard>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-[32px] border-2 border-[#E5E7EB] p-6 shadow-xl flex flex-col md:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={20} strokeWidth={3} />
            <Input 
              className="bg-[#F5F5F5] border-none pl-14 rounded-2xl h-16 text-sm font-black tracking-tight focus-visible:ring-[#1A1A1A] placeholder:text-[#9CA3AF] text-[#1A1A1A]" 
              placeholder="SEARCH OPERATIVE OR CAPTION..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] h-16 rounded-2xl bg-[#F5F5F5] border-none font-black text-[10px] tracking-widest text-[#1A1A1A] uppercase px-6">
                <SelectValue placeholder="MEDIA TYPE" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white">
                <SelectItem value="all" className="text-[10px] font-black uppercase py-3 rounded-xl">ALL MEDIA</SelectItem>
                <SelectItem value="image" className="text-[10px] font-black uppercase py-3 rounded-xl">IMAGES</SelectItem>
                <SelectItem value="video" className="text-[10px] font-black uppercase py-3 rounded-xl">VIDEOS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Grid */}
        <section className="space-y-8 pb-12">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-3xl font-heading text-[#1A1A1A] font-black tracking-tighter uppercase">MISSION <span className="text-[#1A1A1A]/20 italic">GALLERY</span></h3>
              <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">{filteredStories.length} LOGS RETRIEVED</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[48px] shadow-2xl border-none">
              <Loader2 className="w-14 h-14 animate-spin text-[#1A1A1A]/10" />
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#6B7280]">Accessing Archive Chambers...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredStories.length > 0 ? (
                  filteredStories.map((story, idx) => {
                    const colors = ["mint", "blue", "pink", "yellow", "purple", "peach"];
                    const color = colors[idx % colors.length] as any;
                    const isActive = new Date(story.expires_at) > new Date();
                    
                    return (
                      <motion.div 
                        key={story.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        layout
                      >
                        <BentoCard 
                          variant={color}
                          className="p-0 border-none shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col group h-[480px]"
                        >
                          {/* Media Preview */}
                          <div className="relative aspect-[9/12] overflow-hidden bg-black/5">
                            {story.media_type === 'video' ? (
                              <div className="w-full h-full relative">
                                <video src={story.media_url} className="w-full h-full object-cover" muted />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/0 transition-all">
                                  <Play size={40} fill="white" className="text-white drop-shadow-xl" />
                                </div>
                              </div>
                            ) : (
                              <img src={story.media_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            )}
                            
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                              <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                                <p className="text-[8px] font-black text-white uppercase tracking-widest">{story.media_type} LOG</p>
                              </div>
                              <div className={`px-3 py-1 rounded-full font-black text-[8px] tracking-widest ${isActive ? 'bg-[#5FD3BC] text-[#1A1A1A]' : 'bg-red-500 text-white shadow-lg'}`}>
                                {isActive ? 'BROADCASTING' : 'OFFLINE'}
                              </div>
                            </div>
                          </div>

                          {/* Info Overlay */}
                          <div className="p-6 space-y-4 flex-1 flex flex-col">
                            <div className="flex items-center gap-4">
                              <Avatar className="w-10 h-10 border-2 border-white shadow-md">
                                <AvatarImage src={story.user?.avatar_url} />
                                <AvatarFallback className="bg-[#1A1A1A] text-white text-[10px] font-black">{story.user?.full_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="overflow-hidden">
                                <p className="text-sm font-black text-[#1A1A1A] leading-tight truncate">{story.user?.full_name}</p>
                                <p className="text-[9px] font-bold text-[#1A1A1A]/40 uppercase tracking-widest">SIG: {story.id.slice(0, 8).toUpperCase()}</p>
                              </div>
                            </div>
                            
                            {story.caption && (
                              <p className="text-[11px] font-bold text-[#1A1A1A]/70 line-clamp-2 italic leading-relaxed">
                                "{story.caption}"
                              </p>
                            )}

                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#1A1A1A]/5">
                              <div className="flex items-center gap-1.5">
                                <Clock size={12} strokeWidth={3} className="text-[#1A1A1A]/30" />
                                <span className="text-[9px] font-black text-[#1A1A1A]/40 uppercase tracking-widest">
                                  {format(new Date(story.created_at), "MMM d, HH:mm")}
                                </span>
                              </div>
                              <motion.button 
                                whileTap={{ scale: 0.9 }}
                                disabled={isDeleting === story.id}
                                onClick={() => handleDelete(story.id)}
                                className="w-10 h-10 rounded-xl bg-white text-red-500 border-2 border-[#E5E7EB] flex items-center justify-center shadow-md hover:bg-red-50 hover:border-red-200 transition-all"
                              >
                                {isDeleting === story.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={18} strokeWidth={3} />}
                              </motion.button>
                            </div>
                          </div>
                        </BentoCard>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[48px] border-4 border-dashed border-[#E5E7EB] text-center shadow-inner">
                    <AlertCircle size={64} strokeWidth={1} className="text-[#D1D5DB] mb-6 rotate-12" />
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#9CA3AF]">NO HIGHLIGHT SIGNALS DETECTED</p>
                    <Button variant="link" onClick={() => { setSearch(""); setTypeFilter("all"); }} className="text-[#1A1A1A] font-black mt-6 text-[10px] tracking-[0.2em] uppercase underline decoration-4 underline-offset-8 decoration-[#FEF3C7]">
                      CLEAR ALL FILTERS
                    </Button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>

      <AdminNav />
    </main>
  );
}
