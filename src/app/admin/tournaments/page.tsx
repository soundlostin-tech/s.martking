"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { AdminNav } from "@/components/layout/AdminNav";
import { PillButton } from "@/components/ui/PillButton";
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
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  
  // Tournament Dialog State
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
      // Fetch tournaments with participant counts
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

  const handleArchive = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tournaments")
        .update({ status: "archived" })
        .eq("id", id);
      if (error) throw error;
      toast.success("Tournament archived");
      fetchTournaments();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDuplicate = async (tournament: Tournament) => {
    try {
      const { id, created_at, participants, ...rest } = tournament;
      const { error } = await supabase.from("tournaments").insert([{ ...rest, title: `${rest.title} (Copy)`, status: 'upcoming' }]);
      if (error) throw error;
      toast.success("Tournament duplicated");
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
    <main className="min-h-screen pb-32 bg-stone-50">
      <HeroSection 
        title="Arena Management" 
        subtitle="Configure and monitor tournament logistics."
        className="mx-0 rounded-none pb-24"
      >
        <div className="flex flex-col gap-4 mt-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <Input 
              className="bg-white/10 border-white/10 text-white placeholder:text-white/40 pl-12 rounded-[20px] h-14 focus-visible:ring-lime-yellow/50 focus-visible:bg-white/15" 
              placeholder="Search by name or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <PillButton 
            className="w-full h-14 flex items-center justify-center gap-3 bg-lime-yellow text-onyx hover:bg-white shadow-xl shadow-lime-yellow/20"
            onClick={() => {
              setEditingTournament(null);
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus size={20} /> Create Tournament
          </PillButton>
        </div>
      </HeroSection>

      <div className="px-6 -mt-12 relative z-10 flex flex-col gap-6">
        {/* Filters Section */}
        <div className="bg-white p-4 rounded-[32px] border border-stone-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest px-2">
            <Filter size={12} /> Filters
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-2xl bg-stone-50 border-stone-100 h-11 text-xs font-bold uppercase tracking-wider">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {["All", "Draft", "Upcoming", "Live", "Completed", "Archived"].map(s => (
                  <SelectItem key={s} value={s} className="text-xs uppercase font-bold">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={modeFilter} onValueChange={setModeFilter}>
              <SelectTrigger className="rounded-2xl bg-stone-50 border-stone-100 h-11 text-xs font-bold uppercase tracking-wider">
                <SelectValue placeholder="Game Mode" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {["All", "Solo", "Duo", "Squad"].map(m => (
                  <SelectItem key={m} value={m} className="text-xs uppercase font-bold">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tournament List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-lime-yellow" />
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Loading Arena Data...</p>
            </div>
          ) : filteredTournaments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-white rounded-[40px] border border-dashed border-stone-200"
            >
              <div className="w-16 h-16 bg-stone-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-stone-300">
                <Trophy size={32} />
              </div>
              <p className="text-stone-500 font-medium">No tournaments found matching your filters.</p>
              <button 
                onClick={() => { setStatusFilter("All"); setModeFilter("All"); setSearch(""); }}
                className="mt-4 text-[10px] font-bold text-lime-yellow uppercase tracking-widest hover:underline"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTournaments.map((t) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={t.id} 
                  className="bg-white rounded-[32px] p-6 border border-stone-100 shadow-sm relative group"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={`${
                          t.status === 'live' ? 'bg-red-500' : 
                          t.status === 'upcoming' ? 'bg-blue-500' : 
                          t.status === 'completed' ? 'bg-green-500' : 'bg-stone-400'
                        } text-white border-none rounded-full text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest`}>
                          {t.status}
                        </Badge>
                        <Badge variant="outline" className="border-stone-100 text-stone-400 text-[8px] font-bold uppercase tracking-widest">
                          {t.game_mode}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-heading text-onyx line-clamp-1">{t.title}</h3>
                      <div className="flex items-center gap-3 text-[10px] text-stone-400 font-medium">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {format(new Date(t.start_time), "MMM d, HH:mm")}</span>
                        <span className="flex items-center gap-1"><Users size={12} /> {t.participants?.[0]?.count || 0}/{t.slots} Slots</span>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-10 h-10 flex items-center justify-center bg-stone-50 rounded-xl text-stone-400 hover:text-onyx hover:bg-stone-100 transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-[20px] p-2 border-stone-200 shadow-xl min-w-[160px]">
                        <DropdownMenuItem className="rounded-xl gap-2 font-bold text-[11px] uppercase p-3" onClick={() => handleEdit(t)}>
                          <Edit2 size={14} className="text-blue-500" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl gap-2 font-bold text-[11px] uppercase p-3" onClick={() => handleDuplicate(t)}>
                          <Copy size={14} className="text-purple-500" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl gap-2 font-bold text-[11px] uppercase p-3 text-amber-600" onClick={() => handleArchive(t.id)}>
                          <Archive size={14} /> Archive Event
                        </DropdownMenuItem>
                        <div className="h-[1px] bg-stone-100 my-1" />
                        <DropdownMenuItem className="rounded-xl gap-2 font-bold text-[11px] uppercase p-3 text-red-500" onClick={() => handleDelete(t.id)}>
                          <Trash2 size={14} /> Delete Permanent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-stone-50">
                    <div className="bg-stone-50/50 p-3 rounded-2xl">
                      <p className="text-[9px] text-stone-400 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                        <Trophy size={10} className="text-lime-yellow" /> Prize Pool
                      </p>
                      <p className="text-lg font-heading text-onyx">₹{Number(t.prize_pool).toLocaleString()}</p>
                    </div>
                    <div className="bg-stone-50/50 p-3 rounded-2xl">
                      <p className="text-[9px] text-stone-400 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                        <IndianRupee size={10} className="text-green-500" /> Entry Fee
                      </p>
                      <p className="text-lg font-heading text-onyx">₹{Number(t.entry_fee).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="absolute top-4 right-14 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] font-bold text-stone-300 uppercase tracking-tighter">ID: {t.id.slice(0, 8)}...</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tournament Management Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[40px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-onyx p-8 text-white relative overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-3xl font-heading tracking-tight">{editingTournament ? "Update Event" : "Create Event"}</DialogTitle>
              <DialogDescription className="text-white/60 font-medium">
                {editingTournament ? "Modify your tournament configuration." : "Define the parameters for your new arena event."}
              </DialogDescription>
            </DialogHeader>
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime-yellow/10 rounded-full blur-3xl -mr-16 -mt-16" />
          </div>
          
          <form onSubmit={handleCreateOrUpdate} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[11px] font-bold uppercase tracking-widest text-stone-500 ml-1">Event Title</Label>
                <Input 
                  id="title" 
                  className="rounded-2xl bg-stone-50 border-stone-100 h-12 focus-visible:ring-lime-yellow" 
                  placeholder="e.g. Pro Arena Cup 2025"
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[11px] font-bold uppercase tracking-widest text-stone-500 ml-1">Description</Label>
                <Textarea 
                  id="description" 
                  className="rounded-2xl bg-stone-50 border-stone-100 min-h-[100px] focus-visible:ring-lime-yellow" 
                  placeholder="Describe the tournament and its appeal..."
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="game_mode" className="text-[11px] font-bold uppercase tracking-widest text-stone-500 ml-1">Game Mode</Label>
                  <Select 
                    value={formData.game_mode} 
                    onValueChange={(v) => setFormData({...formData, game_mode: v})}
                  >
                    <SelectTrigger className="rounded-2xl bg-stone-50 border-stone-100 h-12">
                      <SelectValue placeholder="Mode" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {["Solo", "Duo", "Squad"].map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slots" className="text-[11px] font-bold uppercase tracking-widest text-stone-500 ml-1">Total Slots</Label>
                  <Input 
                    id="slots" 
                    type="number" 
                    className="rounded-2xl bg-stone-50 border-stone-100 h-12 focus-visible:ring-lime-yellow" 
                    value={formData.slots} 
                    onChange={(e) => setFormData({ ...formData, slots: Number(e.target.value) })} 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entry_fee" className="text-[11px] font-bold uppercase tracking-widest text-stone-500 ml-1">Entry Fee (₹)</Label>
                  <Input 
                    id="entry_fee" 
                    type="number" 
                    className="rounded-2xl bg-stone-50 border-stone-100 h-12 focus-visible:ring-lime-yellow" 
                    value={formData.entry_fee} 
                    onChange={(e) => setFormData({ ...formData, entry_fee: Number(e.target.value) })} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prize_pool" className="text-[11px] font-bold uppercase tracking-widest text-stone-500 ml-1">Prize Pool (₹)</Label>
                  <Input 
                    id="prize_pool" 
                    type="number" 
                    className="rounded-2xl bg-stone-50 border-stone-100 h-12 focus-visible:ring-lime-yellow" 
                    value={formData.prize_pool} 
                    onChange={(e) => setFormData({ ...formData, prize_pool: Number(e.target.value) })} 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time" className="text-[11px] font-bold uppercase tracking-widest text-stone-500 ml-1">Start Time</Label>
                  <Input 
                    id="start_time" 
                    type="datetime-local" 
                    className="rounded-2xl bg-stone-50 border-stone-100 h-12 focus-visible:ring-lime-yellow" 
                    value={formData.start_time} 
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-[11px] font-bold uppercase tracking-widest text-stone-500 ml-1">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(v) => setFormData({...formData, status: v})}
                  >
                    <SelectTrigger className="rounded-2xl bg-stone-50 border-stone-100 h-12">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {["upcoming", "active", "completed", "archived", "draft"].map(s => (
                        <SelectItem key={s} value={s} className="uppercase font-bold text-[10px]">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rules" className="text-[11px] font-bold uppercase tracking-widest text-stone-500 ml-1">Arena Rules</Label>
                <Textarea 
                  id="rules" 
                  className="rounded-2xl bg-stone-50 border-stone-100 min-h-[100px] focus-visible:ring-lime-yellow" 
                  placeholder="Specify rules for participation..."
                  value={formData.rules} 
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })} 
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <PillButton 
                type="submit" 
                disabled={submitting}
                className="w-full h-14 bg-onyx text-white hover:bg-lime-yellow hover:text-onyx shadow-xl transition-all font-heading text-lg"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : editingTournament ? "Update Arena Event" : "Initialize Tournament"}
              </PillButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AdminNav />
    </main>
  );
}
