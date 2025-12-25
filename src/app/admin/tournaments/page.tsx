"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { AdminNav } from "@/components/layout/AdminNav";
import { PillButton } from "@/components/ui/PillButton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreVertical, Edit2, Copy, Archive, Loader2, Trash2, Swords, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
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
}

interface Match {
  id: string;
  tournament_id: string;
  title: string;
  start_time: string;
  status: string;
}

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  
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
  });

  // Match Management State
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchFormData, setMatchFormData] = useState({
    title: "",
    start_time: "",
    status: "upcoming",
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
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
      end_time: new Date(tournament.end_time).toISOString().slice(0, 16),
      status: tournament.status,
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
      const { id, created_at, ...rest } = tournament;
      const { error } = await supabase.from("tournaments").insert([{ ...rest, title: `${rest.title} (Copy)`, status: 'upcoming' }]);
      if (error) throw error;
      toast.success("Tournament duplicated");
      fetchTournaments();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Match Management Functions
  const openMatchManagement = async (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsMatchDialogOpen(true);
    fetchMatches(tournament.id);
  };

  const fetchMatches = async (tournamentId: string) => {
    setLoadingMatches(true);
    try {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("start_time", { ascending: true });
      if (error) throw error;
      setMatches(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournament) return;
    try {
      const { error } = await supabase
        .from("matches")
        .insert([{ ...matchFormData, tournament_id: selectedTournament.id }]);
      if (error) throw error;
      toast.success("Match created successfully");
      setMatchFormData({ title: "", start_time: "", status: "upcoming" });
      fetchMatches(selectedTournament.id);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteMatch = async (matchId: string) => {
    if (!confirm("Delete this match?")) return;
    try {
      const { error } = await supabase.from("matches").delete().eq("id", matchId);
      if (error) throw error;
      toast.success("Match deleted");
      if (selectedTournament) fetchMatches(selectedTournament.id);
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
    });
  };

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || t.status.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="min-h-screen pb-24 bg-stone-100">
      <HeroSection 
        title="Tournaments" 
        subtitle="Create and manage arena events."
        className="mx-0 rounded-none pb-24"
      >
        <div className="flex flex-col gap-4 mt-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <Input 
              className="bg-white/10 border-white/10 text-white pl-12 rounded-full h-12" 
              placeholder="Search events..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <PillButton 
            className="w-full flex items-center justify-center gap-2"
            onClick={() => {
              setEditingTournament(null);
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus size={18} /> Create Tournament
          </PillButton>
        </div>
      </HeroSection>

      <div className="px-6 -mt-8 relative z-10 flex flex-col gap-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {["All", "Active", "Upcoming", "Completed", "Archived"].map((f) => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1 text-xs font-bold transition-all ${filter === f ? "bg-onyx text-white" : "bg-stone-200 text-stone-500"}`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-lemon-lime" />
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[24px] border border-dashed border-stone-300">
            <p className="text-stone-500">No tournaments found</p>
          </div>
        ) : (
          filteredTournaments.map((t) => (
            <div key={t.id} className="bg-white rounded-[24px] p-6 border border-stone-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Badge className="bg-lime-yellow/10 text-olive border-none rounded-full text-[10px] font-bold mb-2 uppercase">
                    {t.status}
                  </Badge>
                  <h3 className="text-xl font-heading">{t.title}</h3>
                  <p className="text-xs text-stone-500">
                    Starts {new Date(t.start_time).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <PillButton 
                    variant="outline" 
                    className="h-9 px-3 text-xs flex gap-1 items-center"
                    onClick={() => openMatchManagement(t)}
                  >
                    <Swords size={14} /> Matches
                  </PillButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 text-stone-400 hover:text-onyx transition-all">
                        <MoreVertical size={20} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl p-2 border-stone-200">
                      <DropdownMenuItem className="rounded-xl gap-2 font-medium" onClick={() => handleEdit(t)}>
                        <Edit2 size={16} /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl gap-2 font-medium" onClick={() => handleDuplicate(t)}>
                        <Copy size={16} /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl gap-2 font-medium text-amber-600" onClick={() => handleArchive(t.id)}>
                        <Archive size={16} /> Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl gap-2 font-medium text-red-500" onClick={() => handleDelete(t.id)}>
                        <Trash2 size={16} /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="flex justify-between items-end mt-6">
                <div className="flex gap-6">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-stone-400 uppercase font-bold">Prize Pool</p>
                    <p className="text-lg font-heading">₹{Number(t.prize_pool).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-stone-400 uppercase font-bold">Entry Fee</p>
                    <p className="text-lg font-heading">₹{Number(t.entry_fee).toLocaleString()}</p>
                  </div>
                </div>
                <Badge className={t.status === 'active' ? "bg-onyx text-white" : "bg-stone-100 text-stone-400"}>
                  {t.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tournament Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTournament ? "Edit Tournament" : "Create Tournament"}</DialogTitle>
            <DialogDescription>Fill in the details for your arena event.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateOrUpdate} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Tournament Title</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="entry_fee">Entry Fee (₹)</Label>
                <Input id="entry_fee" type="number" value={formData.entry_fee} onChange={(e) => setFormData({ ...formData, entry_fee: Number(e.target.value) })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prize_pool">Prize Pool (₹)</Label>
                <Input id="prize_pool" type="number" value={formData.prize_pool} onChange={(e) => setFormData({ ...formData, prize_pool: Number(e.target.value) })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input id="start_time" type="datetime-local" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input id="end_time" type="datetime-local" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <DialogFooter>
              <PillButton type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingTournament ? "Update" : "Create"}
              </PillButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Match Management Dialog */}
      <Dialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Matches</DialogTitle>
            <DialogDescription>Tournament: {selectedTournament?.title}</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateMatch} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 mb-6">
            <h4 className="font-bold text-sm mb-3">Add New Match</h4>
            <div className="grid gap-3">
              <Input 
                placeholder="Match Title (e.g. Round 1, Qualifier)" 
                value={matchFormData.title} 
                onChange={(e) => setMatchFormData({...matchFormData, title: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  type="datetime-local" 
                  value={matchFormData.start_time} 
                  onChange={(e) => setMatchFormData({...matchFormData, start_time: e.target.value})}
                  required
                />
                <PillButton type="submit" className="h-10">Add Match</PillButton>
              </div>
            </div>
          </form>

          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm">Existing Matches</h4>
            {loadingMatches ? (
              <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-stone-400" /></div>
            ) : matches.length === 0 ? (
              <p className="text-center text-stone-500 py-4 text-sm italic">No matches created yet.</p>
            ) : (
              matches.map((m) => (
                <div key={m.id} className="flex justify-between items-center p-3 bg-white border border-stone-200 rounded-xl">
                  <div>
                    <p className="font-bold text-sm">{m.title}</p>
                    <p className="text-[10px] text-stone-500 flex items-center gap-1">
                      <Calendar size={10} /> {new Date(m.start_time).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="text-[10px] uppercase">{m.status}</Badge>
                    <button onClick={() => deleteMatch(m.id)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AdminNav />
    </main>
  );
}
