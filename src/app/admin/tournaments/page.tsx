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
  LayoutGrid,
  Settings,
  Target,
  Signal,
  Map as MapIcon,
  ShieldCheck,
  AlertCircle
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
  participants_count?: number;
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
        .select(`*`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch participants count for each tournament
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
        toast.success("Deployment parameters updated");
      } else {
        const { error } = await supabase
          .from("tournaments")
          .insert([formData]);
        if (error) throw error;
        toast.success("New event initialized in the arena");
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
    if (!confirm("Are you sure you want to decommission this event?")) return;
    try {
      const { error } = await supabase.from("tournaments").delete().eq("id", id);
      if (error) throw error;
      toast.success("Event decommissioned");
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
      <div className="min-h-screen pb-24 bg-background text-foreground">
        <div className="px-4 sm:px-6 pt-6 sm:pt-8 relative z-10 space-y-6 sm:space-y-8 max-w-6xl mx-auto">
          {/* Header - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-[9px] sm:text-[10px] font-bold text-secondary uppercase tracking-wider">Events</h4>
              <h1 className="text-2xl sm:text-3xl font-heading text-foreground">Tournaments</h1>
            </div>
            <Button 
              className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-accent text-primary font-bold text-[10px] sm:text-[11px] tracking-wide px-5 sm:px-8 shadow-lg active:scale-95 transition-transform border-none touch-target"
              onClick={() => {
                setEditingTournament(null);
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus size={16} className="mr-1.5" strokeWidth={3} /> NEW EVENT
            </Button>
          </div>
  
          {/* Filter Bar - Mobile Optimized */}
          <div className="bg-card rounded-[20px] sm:rounded-[24px] border border-border p-4 sm:p-5 shadow-sm flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                className="bg-muted border-none pl-12 rounded-xl h-12 text-sm font-medium focus-visible:ring-accent placeholder:text-muted-foreground/50 text-foreground" 
                placeholder="Search events..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] sm:w-[140px] h-11 rounded-xl bg-muted border-none font-bold text-[10px] tracking-wide text-muted-foreground">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground">
                  {["All", "Draft", "Upcoming", "Active", "Completed", "Archived"].map(s => (
                    <SelectItem key={s} value={s} className="text-[11px] font-medium">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={modeFilter} onValueChange={setModeFilter}>
                <SelectTrigger className="w-[120px] sm:w-[140px] h-11 rounded-xl bg-muted border-none font-bold text-[10px] tracking-wide text-muted-foreground">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground">
                  {["All", "Solo", "Duo", "Squad"].map(m => (
                    <SelectItem key={m} value={m} className="text-[11px] font-medium">{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
  
          {/* Results Grid - Mobile Optimized */}
          <div className="space-y-4">
            <div className="flex items-end justify-between px-1">
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-heading text-foreground">Events</h3>
                <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{filteredTournaments.length} found</p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 bg-card rounded-[20px] border border-border">
                <Loader2 className="w-10 h-10 animate-spin text-accent" />
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredTournaments.map((t, idx) => (
                    <motion.div
                      key={t.id}
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      layout
                      className="mobile-card p-4 sm:p-5 space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`${
                            t.status === 'active' ? 'bg-accent text-primary' : 
                            t.status === 'upcoming' ? 'bg-secondary text-white' : 'bg-muted text-muted-foreground'
                          } border-none rounded-full text-[8px] font-bold px-2 py-0.5`}>
                            {t.status}
                          </Badge>
                          <Badge variant="outline" className="border-border text-muted-foreground text-[8px] font-bold bg-muted">
                            {t.game_mode}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg bg-muted text-muted-foreground touch-target">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-border p-1.5 bg-popover text-popover-foreground shadow-xl w-44">
                            <DropdownMenuItem className="rounded-lg flex gap-2 cursor-pointer py-2.5 text-[11px] font-medium" onClick={() => handleEdit(t)}>
                              <Edit2 size={14} /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg flex gap-2 cursor-pointer py-2.5 text-[11px] font-medium" onClick={() => {
                              supabase.from("tournaments").insert([{ ...t, id: undefined, created_at: undefined, title: `${t.title} (COPY)`, status: 'draft' }]).then(() => fetchTournaments());
                            }}>
                              <Copy size={14} /> Clone
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem className="rounded-lg flex gap-2 cursor-pointer py-2.5 text-[11px] font-medium text-destructive focus:text-destructive" onClick={() => handleDelete(t.id)}>
                              <Trash2 size={14} /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base sm:text-lg font-heading text-foreground leading-tight truncate">{t.title}</h3>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
                          <Calendar size={11} className="text-accent" /> {t.start_time ? format(new Date(t.start_time), "MMM d, HH:mm") : 'TBD'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-muted p-3 rounded-xl border border-border">
                          <span className="text-[8px] font-bold text-muted-foreground uppercase">Prize</span>
                          <p className="text-base sm:text-lg font-heading text-foreground">₹{Number(t.prize_pool).toLocaleString()}</p>
                        </div>
                        <div className="bg-muted p-3 rounded-xl border border-border">
                          <span className="text-[8px] font-bold text-muted-foreground uppercase">Entry</span>
                          <p className="text-base sm:text-lg font-heading text-foreground">₹{Number(t.entry_fee).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users size={12} className="text-accent" />
                          <span className="text-[10px] font-bold">{t.participants_count || 0} / {t.slots}</span>
                        </div>
                        <Button variant="link" className="text-muted-foreground font-bold text-[10px] tracking-wide p-0 h-auto">
                          View <ChevronRight size={12} className="ml-0.5" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {!loading && filteredTournaments.length === 0 && (
                  <div className="col-span-full py-16 text-center flex flex-col items-center gap-3 bg-card rounded-[20px] border border-dashed border-border">
                    <AlertCircle size={36} strokeWidth={1} className="text-muted-foreground/30" />
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">No events found</p>
                    <Button variant="link" onClick={() => { setSearch(""); setStatusFilter("All"); setModeFilter("All"); }} className="text-accent font-bold text-[10px]">
                      Reset Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
  
        {/* Management Dialog - Mobile Optimized */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl rounded-t-[24px] sm:rounded-[24px] p-0 overflow-hidden border-none shadow-2xl bg-popover text-popover-foreground fixed bottom-0 sm:bottom-auto sm:top-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 m-0">
            <div className="bg-accent/10 p-5 sm:p-8 border-b border-border relative overflow-hidden">
              <DialogHeader className="relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-accent/20 flex items-center justify-center text-accent mb-4 sm:mb-6">
                  <Settings size={20} className="sm:w-6 sm:h-6" />
                </div>
                <DialogTitle className="text-2xl sm:text-3xl font-heading leading-tight text-foreground">{editingTournament ? "Edit" : "Create"} Event</DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium text-[10px] sm:text-[11px] uppercase tracking-wide mt-1.5">
                  Configure event details
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="p-5 sm:p-8 space-y-5 sm:space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div className="space-y-4 sm:space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground ml-1">Title</Label>
                    <Input 
                      className="rounded-xl bg-muted border border-border h-12 font-medium text-sm focus-visible:ring-accent text-foreground" 
                      placeholder="Event name"
                      value={formData.title} 
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground ml-1">Mode</Label>
                      <Select value={formData.game_mode} onValueChange={(v) => setFormData({...formData, game_mode: v})}>
                        <SelectTrigger className="rounded-xl bg-muted border border-border h-12 font-medium text-sm text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground">
                          {["Solo", "Duo", "Squad"].map(m => (
                            <SelectItem key={m} value={m} className="font-medium text-sm">{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground ml-1">Slots</Label>
                      <Input 
                        type="number" 
                        className="rounded-xl bg-muted border border-border h-12 font-medium text-sm focus-visible:ring-accent text-foreground" 
                        value={formData.slots} 
                        onChange={(e) => setFormData({ ...formData, slots: Number(e.target.value) })} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground ml-1">Entry (₹)</Label>
                      <Input 
                        type="number" 
                        className="rounded-xl bg-muted border border-border h-12 font-medium text-sm focus-visible:ring-accent text-foreground" 
                        value={formData.entry_fee} 
                        onChange={(e) => setFormData({ ...formData, entry_fee: Number(e.target.value) })} 
                        required 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground ml-1">Prize (₹)</Label>
                      <Input 
                        type="number" 
                        className="rounded-xl bg-muted border border-border h-12 font-medium text-sm focus-visible:ring-accent text-foreground" 
                        value={formData.prize_pool} 
                        onChange={(e) => setFormData({ ...formData, prize_pool: Number(e.target.value) })} 
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground ml-1">Start Time</Label>
                    <Input 
                      type="datetime-local" 
                      className="rounded-xl bg-muted border border-border h-12 font-medium text-sm focus-visible:ring-accent text-foreground" 
                      value={formData.start_time} 
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} 
                      required 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground ml-1">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                      <SelectTrigger className="rounded-xl bg-muted border border-border h-12 font-medium text-sm text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground">
                        {["upcoming", "active", "completed", "draft"].map(s => (
                          <SelectItem key={s} value={s} className="font-medium text-sm capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground ml-1">Rules</Label>
                    <Textarea 
                      className="rounded-xl bg-muted border border-border min-h-[80px] font-medium text-sm focus-visible:ring-accent p-3 text-foreground" 
                      placeholder="Event rules..."
                      value={formData.rules} 
                      onChange={(e) => setFormData({ ...formData, rules: e.target.value })} 
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-3">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-accent text-primary font-bold uppercase tracking-wide text-[11px] shadow-lg active:scale-[0.98] transition-transform border-none touch-target"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : editingTournament ? "Update Event" : "Create Event"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>



      <AdminNav />
    </div>
  );
}
