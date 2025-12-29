"use client";

import { AdminNav } from "@/components/layout/AdminNav";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Copy, 
  Loader2, 
  Trash2, 
  Calendar,
  Users, 
  Trophy, 
  ChevronRight,
  Zap,
  Settings,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface Tournament {
  id: string;
  title: string;
  description: string;
  entry_fee: number;
  prize_pool: number;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  game_mode: string;
  slots: number;
  rules: string;
  participants_count?: number;
}

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    entry_fee: 0,
    prize_pool: 0,
    start_time: "",
    end_time: "",
    status: "upcoming",
    game_mode: "Solo",
    slots: 100,
    rules: "",
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select(`*`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const withCounts = await Promise.all((data || []).map(async (t) => {
        const { count } = await supabase
          .from("participants")
          .select("user_id", { count: 'exact' })
          .eq("tournament_id", t.id);
        return { ...t, participants_count: count || 0 };
      }));

      setTournaments(withCounts);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTournament) {
        const { error } = await supabase
          .from("tournaments")
          .update(formData)
          .eq("id", editingTournament.id);
        if (error) throw error;
        toast.success("Event updated successfully");
      } else {
        const { error } = await supabase
          .from("tournaments")
          .insert([formData]);
        if (error) throw error;
        toast.success("New tournament initialized");
      }
      setIsDialogOpen(false);
      setEditingTournament(null);
      resetForm();
      fetchTournaments();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setFormData({
      title: tournament.title,
      description: tournament.description || "",
      entry_fee: tournament.entry_fee,
      prize_pool: tournament.prize_pool,
      start_time: tournament.start_time ? new Date(tournament.start_time).toISOString().slice(0, 16) : "",
      end_time: tournament.end_time ? new Date(tournament.end_time).toISOString().slice(0, 16) : "",
      status: tournament.status,
      game_mode: tournament.game_mode || "Solo",
      slots: tournament.slots || 100,
      rules: tournament.rules || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    try {
      const { error } = await supabase.from("tournaments").delete().eq("id", id);
      if (error) throw error;
      toast.success("Tournament removed");
      fetchTournaments();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      entry_fee: 0,
      prize_pool: 0,
      start_time: "",
      end_time: "",
      status: "upcoming",
      game_mode: "Solo",
      slots: 100,
      rules: "",
    });
  };

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || t.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [tournaments, search, statusFilter]);

  return (
    <main className="min-h-screen p-8 lg:p-12 space-y-12 bg-background">
      {/* Header Section */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 blob-header blob-header-mint">
        <div className="relative z-10">
          <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em] mb-2">Event Management</p>
          <h1 className="text-[44px] font-heading font-black leading-none tracking-tight text-onyx">
            Tournaments <br />
            <span className="text-charcoal-brown/40">Resource Control</span>
          </h1>
        </div>
        
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingTournament(null);
            resetForm();
            setIsDialogOpen(true);
          }}
          className="relative z-10 h-16 px-10 bg-onyx text-white rounded-[24px] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3"
        >
          <Plus size={20} strokeWidth={3} className="text-lime-yellow" /> Initialize New
        </motion.button>
      </section>

      {/* Filter & Search Strip */}
      <section className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-charcoal/30" size={20} />
          <input 
            type="text" 
            placeholder="Search Arena Resources..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-none rounded-[24px] py-5 pl-14 pr-6 text-sm font-bold shadow-sm placeholder:text-charcoal/30 focus:ring-2 focus:ring-onyx/5 transition-all"
          />
        </div>
        <div className="flex bg-white p-1.5 rounded-[24px] shadow-sm border border-black/5">
          {["All", "Upcoming", "Active", "Completed"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === filter 
                  ? "bg-onyx text-white shadow-lg" 
                  : "text-charcoal/40 hover:text-onyx"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* Results Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-32 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-onyx/20" />
            <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-[0.3em]">Querying Arena Database...</p>
          </div>
        ) : filteredTournaments.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredTournaments.map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <BentoCard className="p-8 space-y-8 border-none shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-pastel-mint flex items-center justify-center shadow-inner">
                        <Trophy size={28} className="text-onyx" />
                      </div>
                      <div>
                        <h3 className="text-xl font-heading text-onyx font-black leading-tight truncate max-w-[180px]">{t.title}</h3>
                        <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-widest mt-1">{t.game_mode} • {t.slots} SLOTS</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-10 h-10 rounded-xl bg-off-white flex items-center justify-center hover:bg-silver/20 transition-colors">
                          <MoreVertical size={20} className="text-charcoal" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl border-none p-2 shadow-2xl bg-white min-w-[160px]">
                        <DropdownMenuItem onClick={() => handleEdit(t)} className="rounded-xl flex gap-3 px-4 py-3 cursor-pointer hover:bg-off-white transition-colors">
                          <Edit2 size={16} /> <span className="text-[11px] font-black uppercase">Edit Parameters</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl flex gap-3 px-4 py-3 cursor-pointer hover:bg-off-white transition-colors">
                          <Copy size={16} /> <span className="text-[11px] font-black uppercase">Clone Resource</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-onyx/5 my-1" />
                        <DropdownMenuItem onClick={() => handleDelete(t.id)} className="rounded-xl flex gap-3 px-4 py-3 cursor-pointer text-pastel-coral hover:bg-pastel-coral/10 transition-colors">
                          <Trash2 size={16} /> <span className="text-[11px] font-black uppercase">Decommission</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-background rounded-2xl p-5 border border-black/5">
                      <p className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mb-1">Prize Pool</p>
                      <p className="text-2xl font-heading text-onyx font-black">₹{t.prize_pool.toLocaleString()}</p>
                    </div>
                    <div className="bg-background rounded-2xl p-5 border border-black/5">
                      <p className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mb-1">Entry Fee</p>
                      <p className="text-2xl font-heading text-onyx font-black">₹{t.entry_fee.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-end mb-1">
                      <div className="flex items-center gap-2 text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">
                        <Users size={12} strokeWidth={3} />
                        <span>Recruitment Status</span>
                      </div>
                      <span className="text-[10px] font-black text-onyx">{t.participants_count} / {t.slots}</span>
                    </div>
                    <div className="w-full h-2.5 bg-background rounded-full overflow-hidden border border-black/5">
                      <div 
                        className="h-full bg-onyx rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${((t.participants_count || 0) / t.slots) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-onyx/5 relative z-10">
                    <div className="flex items-center gap-3">
                      <StatusBadge variant={t.status === 'active' ? 'live' : t.status === 'upcoming' ? 'upcoming' : 'completed'} className="px-3 py-1 text-[8px]" />
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">
                        <Calendar size={12} strokeWidth={3} />
                        {t.start_time ? format(new Date(t.start_time), "MMM d, HH:mm") : 'TBD'}
                      </div>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-off-white flex items-center justify-center hover:bg-onyx hover:text-white transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  {/* Decorative Background Icon */}
                  <div className="absolute right-[-20px] bottom-[-20px] rotate-[-15deg] opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                    <Zap size={160} strokeWidth={1} />
                  </div>
                </BentoCard>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="col-span-full py-32 text-center flex flex-col items-center gap-6 bg-white rounded-[40px] shadow-sm">
            <div className="w-24 h-24 rounded-full bg-off-white flex items-center justify-center">
              <AlertCircle size={48} strokeWidth={1} className="text-charcoal/20" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-heading text-onyx font-black">No Arenas Found</h3>
              <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.2em]">Deployment list is currently clear</p>
            </div>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => { setSearch(""); setStatusFilter("All"); }}
              className="px-10 py-5 bg-onyx text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl"
            >
              Reset Protocols
            </motion.button>
          </div>
        )}
      </section>

      {/* Deployment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl rounded-t-[40px] sm:rounded-[40px] p-0 overflow-hidden border-none shadow-2xl bg-white fixed bottom-0 sm:bottom-auto sm:top-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 m-0">
          <div className="bg-lime-yellow p-10 relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-onyx flex items-center justify-center text-lime-yellow mb-6 shadow-xl">
                <Settings size={24} strokeWidth={3} />
              </div>
              <DialogTitle className="text-3xl font-heading font-black text-onyx leading-none">{editingTournament ? "Update" : "Initialize"} Event</DialogTitle>
              <DialogDescription className="text-onyx/40 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Configure Arena Deployment Parameters</DialogDescription>
            </div>
            <div className="absolute right-[-20px] top-[-20px] rotate-[15deg] opacity-10">
              <Zap size={180} strokeWidth={1} />
            </div>
          </div>
          
          <form onSubmit={handleCreateOrUpdate} className="p-10 space-y-10 max-h-[60vh] overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 ml-1">Arena Title</Label>
                  <Input 
                    className="h-16 rounded-[20px] bg-background border-none font-bold text-sm focus-visible:ring-onyx px-6" 
                    placeholder="Event Name"
                    value={formData.title} 
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 ml-1">Mode</Label>
                    <Select value={formData.game_mode} onValueChange={(v) => setFormData({...formData, game_mode: v})}>
                      <SelectTrigger className="h-16 rounded-[20px] bg-background border-none font-bold text-sm text-onyx">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        {["Solo", "Duo", "Squad"].map(m => (
                          <SelectItem key={m} value={m} className="font-bold text-xs py-3">{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 ml-1">Capacity</Label>
                    <Input 
                      type="number" 
                      className="h-16 rounded-[20px] bg-background border-none font-bold text-sm focus-visible:ring-onyx px-6" 
                      value={formData.slots} 
                      onChange={(e) => setFormData({ ...formData, slots: Number(e.target.value) })} 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 ml-1">Entry (₹)</Label>
                    <Input 
                      type="number" 
                      className="h-16 rounded-[20px] bg-background border-none font-bold text-sm focus-visible:ring-onyx px-6" 
                      value={formData.entry_fee} 
                      onChange={(e) => setFormData({ ...formData, entry_fee: Number(e.target.value) })} 
                      required 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 ml-1">Prize (₹)</Label>
                    <Input 
                      type="number" 
                      className="h-16 rounded-[20px] bg-background border-none font-bold text-sm focus-visible:ring-onyx px-6" 
                      value={formData.prize_pool} 
                      onChange={(e) => setFormData({ ...formData, prize_pool: Number(e.target.value) })} 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 ml-1">Start Timeline</Label>
                  <Input 
                    type="datetime-local" 
                    className="h-16 rounded-[20px] bg-background border-none font-bold text-sm focus-visible:ring-onyx px-6" 
                    value={formData.start_time} 
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} 
                    required 
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 ml-1">Current Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                    <SelectTrigger className="h-16 rounded-[20px] bg-background border-none font-bold text-sm text-onyx">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      {["upcoming", "active", "completed", "draft"].map(s => (
                        <SelectItem key={s} value={s} className="font-bold text-xs py-3 capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 ml-1">Operational Rules</Label>
                  <Textarea 
                    className="rounded-[20px] bg-background border-none min-h-[120px] font-bold text-sm focus-visible:ring-onyx p-6" 
                    placeholder="Enter guidelines..."
                    value={formData.rules} 
                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <motion.button 
                type="submit" 
                whileTap={{ scale: 0.98 }}
                disabled={submitting}
                className="w-full h-20 bg-onyx text-white rounded-[32px] font-black uppercase tracking-[0.3em] text-[14px] shadow-2xl flex items-center justify-center gap-4"
              >
                {submitting ? <Loader2 className="animate-spin" /> : (
                  editingTournament ? "Apply Parameters" : "Deploy Arena Resource"
                )}
              </motion.button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AdminNav />
    </main>
  );
}
