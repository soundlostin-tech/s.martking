"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { AdminNav } from "@/components/layout/AdminNav";
import { 
  Plus, 
  Search, 
  Loader2, 
  Trophy, 
  Users, 
  Calendar, 
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  Star,
  Settings,
  LayoutGrid,
  Filter,
  CheckCircle2,
  Clock,
  Zap,
  Globe
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
import { useHaptics } from "@/hooks/useHaptics";

export default function AdminTournaments() {
  const { triggerHaptic } = useHaptics();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingTournament, setEditingTournament] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    mode: "SQUAD",
    entry_fee: 50,
    prize_pool: 10000,
    slots: 48,
    status: "active",
    start_time: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select(`
          *,
          matches:matches(id, status)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    if (!formData.title) {
      toast.error("Title is required");
      return;
    }

    setCreating(true);
    try {
      const { data: tData, error: tError } = await supabase
        .from("tournaments")
        .insert(formData)
        .select()
        .single();

      if (tError) throw tError;

      // Create initial match for the tournament
      const { error: mError } = await supabase
        .from("matches")
        .insert({
          tournament_id: tData.id,
          title: `${formData.title} - Main Event`,
          status: "upcoming",
          mode: formData.mode,
          map: "Bermuda",
          start_time: formData.start_time || new Date(Date.now() + 3600000).toISOString(),
        });

      if (mError) throw mError;

      toast.success("Tournament and initial match created!");
      setIsCreateOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    triggerHaptic('warning');
    try {
      await supabase.from("participants").delete().eq("tournament_id", id);
      await supabase.from("matches").delete().eq("tournament_id", id);
      const { error } = await supabase.from("tournaments").delete().eq("id", id);
      if (error) throw error;
      toast.success("Tournament deleted successfully");
      triggerHaptic('success');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
      triggerHaptic('error');
    } finally {
      setDeleting(null);
    }
  };

  const openEditModal = (tournament: any) => {
    triggerHaptic('medium');
    setEditingTournament(tournament);
    setFormData({
      title: tournament.title,
      mode: tournament.game_mode || "SQUAD",
      entry_fee: tournament.entry_fee,
      prize_pool: tournament.prize_pool,
      slots: tournament.slots,
      status: tournament.status,
      start_time: tournament.start_time || "",
    });
    setIsEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editingTournament) return;
    setCreating(true);
    try {
      const { error } = await supabase
        .from("tournaments")
        .update({
          title: formData.title,
          game_mode: formData.mode,
          entry_fee: formData.entry_fee,
          prize_pool: formData.prize_pool,
          slots: formData.slots,
          status: formData.status,
          start_time: formData.start_time || null,
        })
        .eq("id", editingTournament.id);
      
      if (error) throw error;
      toast.success("Tournament updated!");
      triggerHaptic('success');
      setIsEditOpen(false);
      setEditingTournament(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCreating(false);
    }
  };

  const filteredTournaments = tournaments.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

    return (
      <main className="min-h-screen pb-32 bg-off-white text-onyx font-sans">
        <div className="px-8 pt-24 relative z-10 max-w-6xl mx-auto space-y-16">
          {/* Hero Header */}
          <header className="relative flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="absolute -top-20 -left-10 w-64 h-64 bg-soft-yellow/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-[2px] bg-onyx/10" />
                <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.4em]">Event Registry</p>
              </div>
              <h1 className="text-[64px] font-black leading-[0.85] tracking-[-0.04em]">
                Tournament<br />
                <span className="text-onyx/20">Control</span>
              </h1>
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-72 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-charcoal/20 group-focus-within:text-onyx transition-colors" size={18} />
                <Input 
                  placeholder="Filter Registry..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-16 rounded-[24px] border-none bg-white pl-14 pr-6 shadow-soft focus-visible:ring-onyx/5 font-black text-[12px] uppercase tracking-wider"
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsCreateOpen(true)}
                className="h-16 px-10 bg-onyx text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 whitespace-nowrap hover:bg-carbon-black transition-all"
              >
                <Plus size={20} strokeWidth={3} />
                Deploy Mission
              </motion.button>
            </div>
          </header>
  
          {/* Grid List */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-white rounded-[40px] shadow-soft animate-pulse" />
              ))
            ) : filteredTournaments.length > 0 ? (
              filteredTournaments.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <BentoCard className="p-10 space-y-10 border-none shadow-soft hover:shadow-soft-lg transition-all duration-500 group relative overflow-hidden bg-white">
                    <div className="relative z-10 flex justify-between items-start">
                      <div className={cn(
                        "w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm",
                        i % 3 === 0 ? "bg-pastel-mint/20" : i % 3 === 1 ? "bg-pastel-lavender/20" : "bg-pastel-coral/20"
                      )}>
                        <Trophy size={28} className="text-onyx/40 group-hover:text-onyx transition-colors" />
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge variant={t.status === 'active' ? 'live' : 'upcoming'} className="text-[8px] font-black px-4 py-1.5" />
                        <button className="w-10 h-10 flex items-center justify-center hover:bg-off-white rounded-full transition-colors">
                          <MoreVertical size={18} className="opacity-20" />
                        </button>
                      </div>
                    </div>
  
                    <div className="relative z-10 space-y-4">
                      <h3 className="text-2xl font-black leading-tight tracking-tight line-clamp-2 min-h-[3.5rem]">{t.title}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-4 py-1.5 bg-onyx text-white text-[9px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg">{t.mode}</span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-off-white rounded-full">
                          <Users size={14} className="text-onyx/20" />
                          <span className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest">{t.slots} PERSONNEL</span>
                        </div>
                      </div>
                    </div>
  
                    <div className="relative z-10 grid grid-cols-2 gap-8 pt-8 border-t border-black/[0.03]">
                      <div>
                        <p className="text-[9px] font-black text-charcoal/20 uppercase tracking-[0.2em] mb-2">Entry Credit</p>
                        <p className="text-2xl font-black text-onyx">₹{t.entry_fee}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-charcoal/20 uppercase tracking-[0.2em] mb-2">Prize Bounty</p>
                        <p className="text-2xl font-black text-onyx">₹{t.prize_pool.toLocaleString()}</p>
                      </div>
                    </div>
  
                  <div className="relative z-10 flex gap-3">
                        <button 
                          onClick={() => openEditModal(t)}
                          className="flex-1 py-4 bg-off-white hover:bg-black/[0.03] rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Configure
                        </button>
                        <button 
                          onClick={() => handleDelete(t.id)}
                          disabled={deleting === t.id}
                          className="w-14 h-14 flex items-center justify-center bg-off-white hover:bg-pastel-coral/30 rounded-[20px] text-onyx/20 hover:text-onyx transition-all disabled:opacity-50"
                        >
                          {deleting === t.id ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                        </button>
                      </div>
                    {/* Decorative Card Blob */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-off-white/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  </BentoCard>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-40 text-center flex flex-col items-center gap-8 bg-white/50 rounded-[48px] border-2 border-dashed border-black/[0.03]">
                <div className="w-24 h-24 bg-off-white rounded-[32px] flex items-center justify-center opacity-20 rotate-12">
                  <Zap size={48} />
                </div>
                <div className="space-y-2">
                  <p className="text-[14px] font-black uppercase tracking-[0.4em] text-charcoal/40">Registry Deserted</p>
                  <p className="text-[10px] font-bold text-charcoal/20 uppercase tracking-widest italic">No deployments found in the current sector</p>
                </div>
              </div>
            )}
          </section>
        </div>
  
        {/* Initialization Modal */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="p-0 border-none bg-off-white rounded-[48px] overflow-hidden max-w-[540px] shadow-2xl">
            <div className="bg-onyx p-12 text-white relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <DialogTitle className="text-[42px] font-black leading-none tracking-tight">Initialize<br />Event</DialogTitle>
                <DialogDescription className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em]">Arena Deployment Protocol</DialogDescription>
              </div>
              <Trophy size={140} className="absolute -bottom-10 -right-10 text-white/5 rotate-[-15deg]" />
            </div>
            
            <div className="p-12 space-y-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em] ml-2">Operation Title</label>
                  <Input 
                    placeholder="e.g. TITAN ASCENDANCY" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="h-16 rounded-[24px] border-none bg-white font-black text-[13px] px-6 shadow-soft placeholder:text-charcoal/10"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em] ml-2">Combat Mode</label>
                  <div className="relative">
                    <select 
                      className="w-full h-16 rounded-[24px] border-none bg-white font-black px-6 text-[13px] shadow-soft appearance-none cursor-pointer"
                      value={formData.mode}
                      onChange={(e) => setFormData({...formData, mode: e.target.value})}
                    >
                      <option>SQUAD</option>
                      <option>DUO</option>
                      <option>SOLO</option>
                    </select>
                    <ChevronRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-onyx/20 pointer-events-none" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em] ml-2">Personnel Limit</label>
                  <Input 
                    type="number"
                    value={formData.slots}
                    onChange={(e) => setFormData({...formData, slots: Number(e.target.value)})}
                    className="h-16 rounded-[24px] border-none bg-white font-black text-[13px] px-6 shadow-soft"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em] ml-2">Entry Credit (₹)</label>
                  <Input 
                    type="number"
                    value={formData.entry_fee}
                    onChange={(e) => setFormData({...formData, entry_fee: Number(e.target.value)})}
                    className="h-16 rounded-[24px] border-none bg-white font-black text-[13px] px-6 shadow-soft"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em] ml-2">Bounty Pool (₹)</label>
                  <Input 
                    type="number"
                    value={formData.prize_pool}
                    onChange={(e) => setFormData({...formData, prize_pool: Number(e.target.value)})}
                    className="h-16 rounded-[24px] border-none bg-white font-black text-[13px] px-6 shadow-soft"
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
                      Execute Deployment
                    </>
                  )}
                </motion.button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="p-0 border-none bg-off-white rounded-[48px] overflow-hidden max-w-[540px] shadow-2xl">
            <div className="bg-pastel-mint p-12 text-onyx relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <DialogTitle className="text-[42px] font-black leading-none tracking-tight">Edit<br />Event</DialogTitle>
                <DialogDescription className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em]">Update Tournament Details</DialogDescription>
              </div>
              <Edit2 size={140} className="absolute -bottom-10 -right-10 text-onyx/5 rotate-[-15deg]" />
            </div>
            
            <div className="p-12 space-y-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em] ml-2">Operation Title</label>
                  <Input 
                    placeholder="e.g. TITAN ASCENDANCY" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="h-16 rounded-[24px] border-none bg-white font-black text-[13px] px-6 shadow-soft placeholder:text-charcoal/10"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em] ml-2">Combat Mode</label>
                  <div className="relative">
                    <select 
                      className="w-full h-16 rounded-[24px] border-none bg-white font-black px-6 text-[13px] shadow-soft appearance-none cursor-pointer"
                      value={formData.mode}
                      onChange={(e) => setFormData({...formData, mode: e.target.value})}
                    >
                      <option>SQUAD</option>
                      <option>DUO</option>
                      <option>SOLO</option>
                    </select>
                    <ChevronRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-onyx/20 pointer-events-none" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em] ml-2">Personnel Limit</label>
                  <Input 
                    type="number"
                    value={formData.slots}
                    onChange={(e) => setFormData({...formData, slots: Number(e.target.value)})}
                    className="h-16 rounded-[24px] border-none bg-white font-black text-[13px] px-6 shadow-soft"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em] ml-2">Entry Credit (₹)</label>
                  <Input 
                    type="number"
                    value={formData.entry_fee}
                    onChange={(e) => setFormData({...formData, entry_fee: Number(e.target.value)})}
                    className="h-16 rounded-[24px] border-none bg-white font-black text-[13px] px-6 shadow-soft"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em] ml-2">Bounty Pool (₹)</label>
                  <Input 
                    type="number"
                    value={formData.prize_pool}
                    onChange={(e) => setFormData({...formData, prize_pool: Number(e.target.value)})}
                    className="h-16 rounded-[24px] border-none bg-white font-black text-[13px] px-6 shadow-soft"
                  />
                </div>
              </div>
              
              <DialogFooter className="pt-8 border-t border-black/[0.03]">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEdit}
                  disabled={creating}
                  className="w-full py-6 bg-onyx text-white rounded-[24px] text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50 transition-all hover:bg-carbon-black"
                >
                  {creating ? <Loader2 className="animate-spin" /> : (
                    <>
                      <CheckCircle2 size={20} className="text-pastel-mint" />
                      Save Changes
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
