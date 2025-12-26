"use client";

import { AdminNav } from "@/components/layout/AdminNav";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Copy, 
  Archive, 
  Loader2, 
  Trash2, 
  Swords, 
  Calendar,
  Filter,
  Users,
  Trophy,
  IndianRupee,
  ChevronRight,
  Clock,
  Zap,
  LayoutGrid
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Button } from "@/components/ui/button";

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
  participants?: { count: number }[];
}

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("All");
  
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
        .select(`
          *,
          participants:participants(count)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
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
        toast.success("Tournament updated successfully");
      } else {
        const { error } = await supabase
          .from("tournaments")
          .insert([formData]);
        if (error) throw error;
        toast.success("Tournament created successfully");
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
      description: tournament.description,
      entry_fee: tournament.entry_fee,
      prize_pool: tournament.prize_pool,
      start_time: new Date(tournament.start_time).toISOString().slice(0, 16),
      end_time: tournament.end_time ? new Date(tournament.end_time).toISOString().slice(0, 16) : "",
      status: tournament.status,
      game_mode: tournament.game_mode || "Solo",
      slots: tournament.slots || 100,
      rules: tournament.rules || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tournament?")) return;
    try {
      const { error } = await supabase.from("tournaments").delete().eq("id", id);
      if (error) throw error;
      toast.success("Tournament deleted");
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
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || t.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesMode = modeFilter === "All" || t.game_mode.toLowerCase() === modeFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesMode;
    });
  }, [tournaments, search, statusFilter, modeFilter]);

  return (
    <main className="min-h-screen pb-32 bg-zinc-50">
      <div className="px-6 pt-24 relative z-10 space-y-10 max-w-5xl mx-auto">
        {/* Action Bar */}
        <div className="bg-zinc-50 rounded-[2.5rem] border border-black/5 p-6 shadow-2xl shadow-black/5 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20" size={18} />
            <Input 
              className="bg-black/[0.03] border-none pl-14 rounded-2xl h-14 text-xs font-bold tracking-wide focus-visible:ring-black placeholder:text-black/20" 
              placeholder="SEARCH BY NAME OR ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button 
            className="h-14 rounded-2xl bg-primary text-black font-bold text-[10px] tracking-[0.2em] px-8 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
            onClick={() => {
              setEditingTournament(null);
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus size={18} className="mr-2" /> INITIALIZE EVENT
          </Button>
        </div>

        {/* Filters & Results */}
        <div className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-2xl font-heading text-black">Arena <span className="italic font-serif opacity-60">Logistics</span></h3>
              <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em]">{filteredTournaments.length} EVENTS LOADED</p>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] h-10 rounded-xl bg-black/[0.03] border-none font-bold text-[9px] tracking-widest">
                  <SelectValue placeholder="STATUS" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-black/5 bg-zinc-50">
                  {["All", "Draft", "Upcoming", "Live", "Completed", "Archived"].map(s => (
                    <SelectItem key={s} value={s} className="text-[10px] uppercase font-bold">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={modeFilter} onValueChange={setModeFilter}>
                <SelectTrigger className="w-[120px] h-10 rounded-xl bg-black/[0.03] border-none font-bold text-[9px] tracking-widest">
                  <SelectValue placeholder="MODE" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-black/5 bg-zinc-50">
                  {["All", "Solo", "Duo", "Squad"].map(m => (
                    <SelectItem key={m} value={m} className="text-[10px] uppercase font-bold">{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6 bg-zinc-50 rounded-[3rem] border border-black/5">
              <Loader2 className="w-12 h-12 animate-spin text-black/10" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20">Accessing Data Chambers...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredTournaments.map((t, idx) => (
                  <motion.div
                    key={t.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    layout
                    className="group relative bg-zinc-50 rounded-[2.5rem] p-8 shadow-2xl border border-black/5 hover:border-black/10 transition-all duration-500 overflow-hidden"
                  >
                    <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Badge className={`${
                            t.status === 'live' ? 'bg-primary text-black' : 
                            t.status === 'upcoming' ? 'bg-black text-white' : 'bg-black/5 text-black/40'
                          } border-none rounded-full text-[8px] font-bold px-3 py-1 tracking-widest uppercase`}>
                            {t.status}
                          </Badge>
                          <Badge variant="outline" className="border-black/5 text-black/20 text-[8px] font-bold uppercase tracking-widest">
                            {t.game_mode}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-black/[0.03] text-black/20 hover:text-black">
                              <MoreVertical size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-black/5 p-2 bg-zinc-50 shadow-2xl w-48">
                            <DropdownMenuLabel className="text-[9px] uppercase tracking-[0.2em] text-black/20 font-bold px-3 py-2">ACTIONS</DropdownMenuLabel>
                            <DropdownMenuItem className="rounded-xl flex gap-3 cursor-pointer py-3 text-xs font-bold tracking-wide" onClick={() => handleEdit(t)}>
                              <Edit2 size={16} /> EDIT DETAILS
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl flex gap-3 cursor-pointer py-3 text-xs font-bold tracking-wide" onClick={() => {
                              supabase.from("tournaments").insert([{ ...t, id: undefined, created_at: undefined, title: `${t.title} (COPY)`, status: 'draft' }]).then(() => fetchTournaments());
                            }}>
                              <Copy size={16} /> DUPLICATE
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-black/5" />
                            <DropdownMenuItem className="rounded-xl flex gap-3 cursor-pointer py-3 text-xs font-bold tracking-wide text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDelete(t.id)}>
                              <Trash2 size={16} /> DELETE EVENT
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-2xl font-heading text-black leading-tight line-clamp-1">{t.title}</h3>
                        <p className="text-[10px] text-black/30 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                          <Calendar size={12} strokeWidth={3} /> {format(new Date(t.start_time), "MMM d, HH:mm")}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/[0.02] p-4 rounded-2xl border border-black/5 space-y-0.5">
                          <span className="text-[9px] font-bold text-black/20 uppercase tracking-widest">Prize Pool</span>
                          <p className="text-xl font-heading text-black">₹{Number(t.prize_pool).toLocaleString()}</p>
                        </div>
                        <div className="bg-black/[0.02] p-4 rounded-2xl border border-black/5 space-y-0.5">
                          <span className="text-[9px] font-bold text-black/20 uppercase tracking-widest">Entry Fee</span>
                          <p className="text-xl font-heading text-black">₹{Number(t.entry_fee).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-black/5">
                        <div className="flex items-center gap-2 text-black/30">
                          <Users size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{t.participants?.[0]?.count || 0} / {t.slots} SLOTS</span>
                        </div>
                        <Button variant="link" className="text-black font-bold text-[10px] tracking-widest p-0 h-auto uppercase">
                          VIEW DETAILS <ChevronRight size={14} className="ml-1" />
                        </Button>
                      </div>
                    </div>
                    {/* Visual Glows */}
                    <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-zinc-200 blur-[100px] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Management Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-zinc-50">
          <div className="bg-black p-10 text-white relative overflow-hidden">
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-4xl font-heading leading-tight">{editingTournament ? "Update" : "Initialize"} <span className="italic opacity-60">Event</span></DialogTitle>
              <DialogDescription className="text-white/40 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">
                Configure arena parameters and deployment rules.
              </DialogDescription>
            </DialogHeader>
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[100px] rounded-full" />
          </div>
          
          <form onSubmit={handleCreateOrUpdate} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20 ml-2">Event Title</Label>
                <Input 
                  className="rounded-2xl bg-black/[0.03] border-none h-14 font-bold text-xs focus-visible:ring-primary" 
                  placeholder="E.G. PRO ARENA CHAMPIONSHIP"
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20 ml-2">Game Mode</Label>
                  <Select value={formData.game_mode} onValueChange={(v) => setFormData({...formData, game_mode: v})}>
                    <SelectTrigger className="rounded-2xl bg-black/[0.03] border-none h-14 font-bold text-xs uppercase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-black/5 bg-zinc-50">
                      {["Solo", "Duo", "Squad"].map(m => (
                        <SelectItem key={m} value={m} className="font-bold text-[10px] uppercase">{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20 ml-2">Total Slots</Label>
                  <Input 
                    type="number" 
                    className="rounded-2xl bg-black/[0.03] border-none h-14 font-bold text-xs focus-visible:ring-primary" 
                    value={formData.slots} 
                    onChange={(e) => setFormData({ ...formData, slots: Number(e.target.value) })} 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20 ml-2">Entry Fee (₹)</Label>
                  <Input 
                    type="number" 
                    className="rounded-2xl bg-black/[0.03] border-none h-14 font-bold text-xs focus-visible:ring-primary" 
                    value={formData.entry_fee} 
                    onChange={(e) => setFormData({ ...formData, entry_fee: Number(e.target.value) })} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20 ml-2">Prize Pool (₹)</Label>
                  <Input 
                    type="number" 
                    className="rounded-2xl bg-black/[0.03] border-none h-14 font-bold text-xs focus-visible:ring-primary" 
                    value={formData.prize_pool} 
                    onChange={(e) => setFormData({ ...formData, prize_pool: Number(e.target.value) })} 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20 ml-2">Start Time</Label>
                  <Input 
                    type="datetime-local" 
                    className="rounded-2xl bg-black/[0.03] border-none h-14 font-bold text-xs focus-visible:ring-primary" 
                    value={formData.start_time} 
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20 ml-2">Initial Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                    <SelectTrigger className="rounded-2xl bg-black/[0.03] border-none h-14 font-bold text-xs uppercase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-black/5 bg-zinc-50">
                      {["upcoming", "active", "completed", "draft"].map(s => (
                        <SelectItem key={s} value={s} className="font-bold text-[10px] uppercase">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20 ml-2">Rules & Description</Label>
                <Textarea 
                  className="rounded-2xl bg-black/[0.03] border-none min-h-[120px] font-bold text-xs focus-visible:ring-primary p-4" 
                  placeholder="DEFINE THE ENGAGEMENT PROTOCOLS..."
                  value={formData.rules} 
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })} 
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full h-16 rounded-3xl bg-primary text-black font-bold uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                {submitting ? <Loader2 className="animate-spin" /> : editingTournament ? "UPDATE DEPLOYMENT" : "INITIALIZE DEPLOYMENT"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AdminNav />
    </main>
  );
}
