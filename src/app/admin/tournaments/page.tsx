"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
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

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
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

  const filteredTournaments = tournaments.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="p-8 space-y-10 max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em]">Arena Hub</p>
          <h1 className="text-[40px] font-black leading-none">Tournaments</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal opacity-20" size={18} />
            <Input 
              placeholder="Search registry..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 rounded-2xl border-black/[0.03] bg-white pl-12 pr-4 shadow-sm focus-visible:ring-onyx/5"
            />
          </div>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreateOpen(true)}
            className="h-14 px-8 bg-onyx text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-3 whitespace-nowrap"
          >
            <Plus size={18} strokeWidth={3} />
            Initialize Event
          </motion.button>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-white/50 rounded-[2.5rem] animate-pulse" />
          ))
        ) : filteredTournaments.length > 0 ? (
          filteredTournaments.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <BentoCard className="p-8 space-y-8 border-none shadow-sm hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-2xl bg-off-white flex items-center justify-center group-hover:bg-pastel-mint transition-colors">
                    <Trophy size={24} className="text-onyx/30 group-hover:text-onyx transition-colors" />
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge variant={t.status === 'active' ? 'live' : 'upcoming'} className="text-[8px] px-3 py-1" />
                    <button className="p-2 hover:bg-off-white rounded-xl transition-colors">
                      <MoreVertical size={16} className="opacity-20" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black leading-tight truncate">{t.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-onyx text-white text-[9px] font-bold rounded uppercase tracking-widest">{t.mode}</span>
                    <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest flex items-center gap-1">
                      <Users size={12} /> {t.slots} SLOTS
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/[0.03]">
                  <div>
                    <p className="text-[9px] font-bold text-charcoal/30 uppercase tracking-widest mb-1">Entry</p>
                    <p className="text-lg font-black text-onyx">₹{t.entry_fee}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-charcoal/30 uppercase tracking-widest mb-1">Prize</p>
                    <p className="text-lg font-black text-onyx">₹{t.prize_pool.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-3 bg-off-white hover:bg-silver/20 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-colors">Edit Parameters</button>
                  <button className="w-12 h-12 flex items-center justify-center bg-off-white hover:bg-pastel-coral/30 rounded-xl text-onyx transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </BentoCard>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center space-y-6">
            <div className="w-20 h-20 bg-off-white rounded-full flex items-center justify-center mx-auto opacity-20">
              <Zap size={40} />
            </div>
            <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em]">No matches discovered in registry</p>
          </div>
        )}
      </div>

      {/* Initialization Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="p-0 border-none bg-white rounded-[3rem] overflow-hidden max-w-[500px]">
          <div className="bg-lime-yellow p-10">
            <DialogTitle className="text-3xl font-black mb-1">Initialize Event</DialogTitle>
            <DialogDescription className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Deploy a new arena deployment</DialogDescription>
          </div>
          <div className="p-10 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <label className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Event Title</label>
                <Input 
                  placeholder="e.g. Pro League Elite" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="h-14 rounded-xl border-black/[0.05] bg-off-white font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Combat Mode</label>
                <select 
                  className="w-full h-14 rounded-xl border-black/[0.05] bg-off-white font-bold px-4 text-sm"
                  value={formData.mode}
                  onChange={(e) => setFormData({...formData, mode: e.target.value})}
                >
                  <option>SQUAD</option>
                  <option>DUO</option>
                  <option>SOLO</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Capacity</label>
                <Input 
                  type="number"
                  value={formData.slots}
                  onChange={(e) => setFormData({...formData, slots: Number(e.target.value)})}
                  className="h-14 rounded-xl border-black/[0.05] bg-off-white font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Entry Fee (₹)</label>
                <Input 
                  type="number"
                  value={formData.entry_fee}
                  onChange={(e) => setFormData({...formData, entry_fee: Number(e.target.value)})}
                  className="h-14 rounded-xl border-black/[0.05] bg-off-white font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Prize Pool (₹)</label>
                <Input 
                  type="number"
                  value={formData.prize_pool}
                  onChange={(e) => setFormData({...formData, prize_pool: Number(e.target.value)})}
                  className="h-14 rounded-xl border-black/[0.05] bg-off-white font-bold"
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
                    <Globe size={18} />
                    Confirm Deployment
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
