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
      <div className="min-h-screen pb-32 bg-background text-foreground">
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
        </div>
  
        <div className="px-6 pt-24 relative z-10 space-y-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-secondary uppercase tracking-[0.4em]">Tactical Operations</h4>
              <h1 className="text-4xl font-heading text-foreground">Event <span className="italic font-serif opacity-60">Logistics</span></h1>
            </div>
            <Button 
              className="h-14 rounded-2xl bg-accent text-primary font-bold text-[10px] tracking-[0.2em] px-8 shadow-xl shadow-accent/20 hover:scale-105 transition-all border-none"
              onClick={() => {
                setEditingTournament(null);
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus size={18} className="mr-2" strokeWidth={3} /> INITIALIZE EVENT
            </Button>
          </div>
  
          {/* Action & Filter Bar */}
          <div className="bg-card rounded-[2.5rem] border border-border p-6 shadow-lg flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                className="bg-muted border-none pl-14 rounded-2xl h-14 text-xs font-bold tracking-wide focus-visible:ring-accent placeholder:text-muted-foreground/50 text-foreground" 
                placeholder="SEARCH BY NAME, ID OR MODE..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-14 rounded-2xl bg-muted border-none font-bold text-[10px] tracking-widest text-muted-foreground">
                  <SelectValue placeholder="STATUS" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border bg-popover text-popover-foreground">
                  {["All", "Draft", "Upcoming", "Active", "Completed", "Archived"].map(s => (
                    <SelectItem key={s} value={s} className="text-[10px] uppercase font-bold">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={modeFilter} onValueChange={setModeFilter}>
                <SelectTrigger className="w-[140px] h-14 rounded-2xl bg-muted border-none font-bold text-[10px] tracking-widest text-muted-foreground">
                  <SelectValue placeholder="MODE" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border bg-popover text-popover-foreground">
                  {["All", "Solo", "Duo", "Squad"].map(m => (
                    <SelectItem key={m} value={m} className="text-[10px] uppercase font-bold">{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
  
          {/* Results Grid */}
          <div className="space-y-6">
            <div className="flex items-end justify-between px-2">
              <div className="space-y-1">
                <h3 className="text-2xl font-heading text-foreground">Arena <span className="italic font-serif opacity-60">Manifest</span></h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{filteredTournaments.length} DEPLOYMENTS LOADED</p>
              </div>
            </div>
  
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6 bg-card rounded-[3rem] border border-border shadow-sm">
                <Loader2 className="w-12 h-12 animate-spin text-accent" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Accessing Data Chambers...</p>
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
                      className="group relative bg-card rounded-[2.5rem] p-8 shadow-md border border-border hover:border-accent/30 transition-all duration-500 overflow-hidden cursor-pointer"
                    >
                      <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              t.status === 'active' ? 'bg-accent text-primary shadow-lg shadow-accent/20' : 
                              t.status === 'upcoming' ? 'bg-secondary text-white' : 'bg-muted text-muted-foreground border border-border'
                            } border-none rounded-full text-[8px] font-bold px-3 py-1 tracking-widest uppercase`}>
                              {t.status}
                            </Badge>
                            <Badge variant="outline" className="border-border text-muted-foreground text-[8px] font-bold uppercase tracking-widest bg-muted">
                              {t.game_mode}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                <MoreVertical size={18} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl border-border p-2 bg-popover text-popover-foreground shadow-2xl w-48">
                              <DropdownMenuLabel className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold px-3 py-2">MANAGEMENT</DropdownMenuLabel>
                              <DropdownMenuItem className="rounded-xl flex gap-3 cursor-pointer py-3 text-xs font-bold tracking-wide hover:bg-muted" onClick={() => handleEdit(t)}>
                                <Edit2 size={16} /> EDIT PARAMETERS
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl flex gap-3 cursor-pointer py-3 text-xs font-bold tracking-wide hover:bg-muted" onClick={() => {
                                supabase.from("tournaments").insert([{ ...t, id: undefined, created_at: undefined, title: `${t.title} (COPY)`, status: 'draft' }]).then(() => fetchTournaments());
                              }}>
                                <Copy size={16} /> CLONE EVENT
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-border" />
                              <DropdownMenuItem className="rounded-xl flex gap-3 cursor-pointer py-3 text-xs font-bold tracking-wide text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDelete(t.id)}>
                                <Trash2 size={16} /> DECOMMISSION
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
  
                        <div className="space-y-1">
                          <h3 className="text-2xl font-heading text-foreground leading-tight line-clamp-1 group-hover:text-secondary transition-colors">{t.title}</h3>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                            <Calendar size={12} strokeWidth={3} className="text-accent" /> {t.start_time ? format(new Date(t.start_time), "MMM d, HH:mm") : 'TBD'}
                          </p>
                        </div>
  
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-muted p-4 rounded-2xl border border-border space-y-0.5">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Prize Pool</span>
                            <p className="text-xl font-heading text-foreground">₹{Number(t.prize_pool).toLocaleString()}</p>
                          </div>
                          <div className="bg-muted p-4 rounded-2xl border border-border space-y-0.5">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Entry Fee</span>
                            <p className="text-xl font-heading text-foreground">₹{Number(t.entry_fee).toLocaleString()}</p>
                          </div>
                        </div>
  
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users size={14} className="text-accent" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t.participants_count || 0} / {t.slots} WARRIORS</span>
                          </div>
                          <Button variant="link" className="text-muted-foreground hover:text-secondary font-bold text-[10px] tracking-widest p-0 h-auto uppercase transition-colors">
                            AUDIT EVENT <ChevronRight size={14} className="ml-1" />
                          </Button>
                        </div>
                      </div>
                      {/* Visual Glows */}
                      <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-accent/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {!loading && filteredTournaments.length === 0 && (
                  <div className="col-span-full py-32 text-center flex flex-col items-center gap-4 bg-card rounded-[3rem] border border-dashed border-border shadow-sm">
                    <AlertCircle size={48} strokeWidth={1} className="text-muted-foreground/30" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">No events detected in sectors</p>
                    <Button variant="link" onClick={() => { setSearch(""); setStatusFilter("All"); setModeFilter("All"); }} className="text-accent font-bold mt-2 text-[10px] tracking-widest uppercase">
                      RESET SCANNERS
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
  
        {/* Management Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-popover text-popover-foreground">
            <div className="bg-accent/10 p-10 border-b border-border relative overflow-hidden">
              <DialogHeader className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent mb-6 shadow-inner">
                  <Settings size={24} />
                </div>
                <DialogTitle className="text-4xl font-heading leading-tight text-foreground">{editingTournament ? "Update" : "Initialize"} <span className="italic opacity-60">Deployment</span></DialogTitle>
                <DialogDescription className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em] mt-2">
                  Configure arena parameters and engagement protocols.
                </DialogDescription>
              </DialogHeader>
              <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/10 blur-[100px] rounded-full" />
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground ml-2">Event Designation</Label>
                    <Input 
                      className="rounded-2xl bg-muted border border-border h-14 font-bold text-xs focus-visible:ring-accent placeholder:text-muted-foreground/50 text-foreground shadow-sm" 
                      placeholder="E.G. GLOBAL CHAMPIONSHIP"
                      value={formData.title} 
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                      required 
                    />
                  </div>
  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground ml-2">Mode</Label>
                      <Select value={formData.game_mode} onValueChange={(v) => setFormData({...formData, game_mode: v})}>
                        <SelectTrigger className="rounded-2xl bg-muted border border-border h-14 font-bold text-xs uppercase text-foreground shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border bg-popover text-popover-foreground">
                          {["Solo", "Duo", "Squad"].map(m => (
                            <SelectItem key={m} value={m} className="font-bold text-[10px] uppercase">{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground ml-2">Warrior Slots</Label>
                      <Input 
                        type="number" 
                        className="rounded-2xl bg-muted border border-border h-14 font-bold text-xs focus-visible:ring-accent text-foreground shadow-sm" 
                        value={formData.slots} 
                        onChange={(e) => setFormData({ ...formData, slots: Number(e.target.value) })} 
                        required 
                      />
                    </div>
                  </div>
  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground ml-2">Entry Fee (₹)</Label>
                      <Input 
                        type="number" 
                        className="rounded-2xl bg-muted border border-border h-14 font-bold text-xs focus-visible:ring-accent text-foreground shadow-sm" 
                        value={formData.entry_fee} 
                        onChange={(e) => setFormData({ ...formData, entry_fee: Number(e.target.value) })} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground ml-2">Prize Pool (₹)</Label>
                      <Input 
                        type="number" 
                        className="rounded-2xl bg-muted border border-border h-14 font-bold text-xs focus-visible:ring-accent text-foreground shadow-sm" 
                        value={formData.prize_pool} 
                        onChange={(e) => setFormData({ ...formData, prize_pool: Number(e.target.value) })} 
                        required 
                      />
                    </div>
                  </div>
                </div>
  
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground ml-2">Deployment Schedule</Label>
                    <Input 
                      type="datetime-local" 
                      className="rounded-2xl bg-muted border border-border h-14 font-bold text-xs focus-visible:ring-accent text-foreground shadow-sm" 
                      value={formData.start_time} 
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} 
                      required 
                    />
                  </div>
  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground ml-2">Mission Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                      <SelectTrigger className="rounded-2xl bg-muted border border-border h-14 font-bold text-xs uppercase text-foreground shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border bg-popover text-popover-foreground">
                        {["upcoming", "active", "completed", "draft"].map(s => (
                          <SelectItem key={s} value={s} className="font-bold text-[10px] uppercase">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground ml-2">Arena Briefing</Label>
                    <Textarea 
                      className="rounded-2xl bg-muted border border-border min-h-[120px] font-bold text-xs focus-visible:ring-accent p-4 placeholder:text-muted-foreground/50 text-foreground shadow-sm" 
                      placeholder="DEFINE THE ENGAGEMENT PROTOCOLS..."
                      value={formData.rules} 
                      onChange={(e) => setFormData({ ...formData, rules: e.target.value })} 
                    />
                  </div>
                </div>
              </div>
  
              <DialogFooter className="pt-4">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full h-16 rounded-3xl bg-accent text-primary font-bold uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-accent/20 hover:scale-[1.02] transition-all border-none"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : editingTournament ? "CONFIRM PARAMETER UPDATE" : "INITIALIZE DEPLOYMENT"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>



      <AdminNav />
    </div>
  );
}
