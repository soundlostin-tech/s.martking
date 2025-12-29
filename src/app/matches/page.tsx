"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState, useEffect, useCallback } from "react";
import { 
  Search, Loader2, Trophy, Calendar, Users, 
  ChevronRight, AlertCircle, Swords, Zap, 
  Map as MapIcon, ShieldCheck, Info
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const filters = ["Upcoming", "Live", "Completed"];

export default function MatchesPage() {
  const { user } = useAuth(false);
  const [activeFilter, setActiveFilter] = useState("Upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [myEntries, setMyEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("matches")
        .select(`*, tournament:tournaments(*)`)
        .order("start_time", { ascending: true });
      
      if (error) throw error;

      const withCounts = await Promise.all((data || []).map(async (m) => {
        const { count } = await supabase
          .from("participants")
          .select("user_id", { count: 'exact' })
          .eq("match_id", m.id);
        return { ...m, current_slots: count || 0 };
      }));

      setMatches(withCounts);

      if (user) {
        const { data: entries } = await supabase
          .from("participants")
          .select("match_id")
          .eq("user_id", user.id);
        
        if (entries) {
          const joinedIds = entries.map(e => e.match_id);
          setMyEntries(withCounts.filter(m => joinedIds.includes(m.id)));
        }
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load matches");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const filteredMatches = matches.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.tournament?.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = m.status.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleJoinMatch = async (tournamentId: string, matchId: string) => {
    if (!user) {
      toast.error("Please sign in to join");
      return;
    }

    setJoining(matchId);
    try {
      const { data, error } = await supabase.rpc('join_tournament', {
        p_tournament_id: tournamentId,
        p_match_id: matchId
      });

      if (error) throw error;

      const result = typeof data === 'string' ? JSON.parse(data) : data;

      if (result.success) {
        toast.success(result.message);
        fetchMatches();
        setSelectedMatch(null);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error("Error joining match:", error);
      toast.error(error.message || "Failed to join");
    } finally {
      setJoining(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-onyx">
      <main className="pb-32 relative z-10">
        <TopHeader />

        {/* Header Section */}
        <section className="relative px-6 pt-10 pb-8 blob-header blob-header-mint">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-charcoal/50 uppercase tracking-[0.2em] mb-2">
              Tournament Hub
            </p>
            <h2 className="text-[44px] font-heading text-onyx leading-tight font-black">
              MATCHES <br />
              <span className="text-charcoal-brown/40">Enter the Arena</span>
            </h2>
          </div>
        </section>

        {/* Search & Tabs Strip */}
        <section className="px-6 space-y-6 -mt-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold shadow-sm placeholder:text-charcoal/30"
              />
            </div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm"
            >
              <Zap size={20} className="text-onyx" />
            </motion.button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeFilter === f 
                    ? "bg-onyx text-white shadow-lg" 
                    : "bg-white text-charcoal/40 shadow-sm"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {/* My Entries Section */}
        {myEntries.length > 0 && activeFilter === "Upcoming" && (
          <section className="px-6 pt-8">
            <h3 className="text-xl font-heading text-onyx font-black mb-6 flex items-center gap-2">
              My Entries <span className="w-6 h-6 rounded-full bg-electric-blue text-[10px] flex items-center justify-center">{myEntries.length}</span>
            </h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {myEntries.map((match) => (
                <BentoCard 
                  key={match.id} 
                  variant="dark" 
                  className="w-72 flex-shrink-0 p-6"
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="flex justify-between items-start mb-6">
                    <StatusBadge variant="upcoming" className="bg-white/10 text-white border-none" />
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <ChevronRight size={18} className="text-white" />
                    </div>
                  </div>
                  <h4 className="text-lg font-heading text-white font-black leading-tight mb-4">{match.title}</h4>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Starts at</p>
                      <p className="text-sm font-black text-white">{new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <p className="text-sm font-black text-electric-blue">JOINED</p>
                  </div>
                </BentoCard>
              ))}
            </div>
          </section>
        )}

        {/* Match List */}
        <section className="px-6 pt-8 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-onyx/20" />
              <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest">Scanning Arena...</p>
            </div>
          ) : filteredMatches.length > 0 ? (
            filteredMatches.map((match) => (
              <BentoCard 
                key={match.id} 
                className="p-5 flex items-center justify-between border-none shadow-sm cursor-pointer"
                onClick={() => setSelectedMatch(match)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-pastel-mint flex items-center justify-center shadow-inner">
                    <Swords size={24} className="text-onyx" />
                  </div>
                  <div>
                    <h4 className="text-[16px] font-heading text-onyx font-black leading-tight">{match.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] font-black text-charcoal/40 uppercase tracking-widest">₹{match.tournament?.entry_fee} ENTRY • ₹{match.tournament?.prize_pool} PRIZE</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="w-20 h-1.5 bg-silver/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-onyx rounded-full" 
                          style={{ width: `${(match.current_slots / (match.tournament?.slots || 48)) * 100}%` }} 
                        />
                      </div>
                      <span className="text-[8px] font-black text-charcoal/40">{match.current_slots}/{match.tournament?.slots || 48}</span>
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-off-white flex items-center justify-center">
                  <ChevronRight size={20} className="text-onyx" />
                </div>
              </BentoCard>
            ))
          ) : (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-off-white rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} className="text-charcoal/20" />
              </div>
              <h3 className="text-lg font-heading text-onyx font-black">No Matches Found</h3>
              <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest mt-1">Try a different filter</p>
            </div>
          )}
        </section>
      </main>

      {/* Match Details Overlay (Sticker Style) */}
      <AnimatePresence>
        {selectedMatch && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[60] bg-background flex flex-col"
          >
            <div className={`absolute inset-0 blob-header ${
              selectedMatch.status === 'live' ? 'blob-header-coral' : 'blob-header-yellow'
            } opacity-50`} />
            
            <header className="relative z-10 px-6 py-8 flex items-center justify-between">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedMatch(null)}
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"
              >
                <ChevronRight className="rotate-180 text-onyx" size={24} />
              </motion.button>
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-onyx">Match Details</h2>
              <div className="w-12" />
            </header>

            <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-6 pb-32">
              <div className="mb-8 pt-4">
                <StatusBadge variant={selectedMatch.status} className="mb-4" />
                <h1 className="text-[44px] font-heading text-onyx font-black leading-tight mb-2">
                  {selectedMatch.title}
                </h1>
                <p className="text-sm font-bold text-charcoal/40 uppercase tracking-widest">{selectedMatch.tournament?.title}</p>
              </div>

              {/* Prize Pool Sticker */}
              <BentoCard variant="vibrant" className="p-8 mb-8 text-center relative overflow-hidden">
                <p className="text-[10px] font-black text-onyx/40 uppercase tracking-[0.2em] mb-2">Grand Prize Pool</p>
                <p className="text-[56px] font-heading text-onyx font-black leading-none mb-2">₹{selectedMatch.tournament?.prize_pool}</p>
                <div className="absolute right-[-20px] bottom-[-20px] rotate-[-15deg] opacity-10">
                  <Trophy size={120} />
                </div>
              </BentoCard>

              {/* Key Facts Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <BentoCard className="p-6 bg-white shadow-sm border-none">
                  <Calendar size={18} className="text-charcoal/20 mb-3" />
                  <p className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mb-1">Date & Time</p>
                  <p className="text-sm font-black text-onyx">{new Date(selectedMatch.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(selectedMatch.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </BentoCard>
                <BentoCard className="p-6 bg-white shadow-sm border-none">
                  <MapIcon size={18} className="text-charcoal/20 mb-3" />
                  <p className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mb-1">Game Map</p>
                  <p className="text-sm font-black text-onyx">{selectedMatch.map || 'Bermuda'}</p>
                </BentoCard>
                <BentoCard className="p-6 bg-white shadow-sm border-none">
                  <Target size={18} className="text-charcoal/20 mb-3" />
                  <p className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mb-1">Mode</p>
                  <p className="text-sm font-black text-onyx">{selectedMatch.mode}</p>
                </BentoCard>
                <BentoCard className="p-6 bg-white shadow-sm border-none">
                  <Users size={18} className="text-charcoal/20 mb-3" />
                  <p className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mb-1">Slots Filled</p>
                  <p className="text-sm font-black text-onyx">{selectedMatch.current_slots} / {selectedMatch.tournament?.slots || 48}</p>
                </BentoCard>
              </div>

              {/* Prize Breakdown */}
              <BentoCard variant="pastel" pastelColor="sky" className="p-8 mb-8 border-none">
                <h4 className="text-lg font-heading text-onyx font-black mb-6">Prize Breakdown</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-onyx/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-electric-blue flex items-center justify-center font-black text-xs">1st</div>
                      <span className="text-sm font-bold text-onyx">Winner</span>
                    </div>
                    <span className="text-lg font-black text-onyx">₹2,500</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-onyx/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-silver/40 flex items-center justify-center font-black text-xs">2nd</div>
                      <span className="text-sm font-bold text-onyx">Runner Up</span>
                    </div>
                    <span className="text-lg font-black text-onyx">₹1,200</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-charcoal/10 flex items-center justify-center font-black text-xs">K</div>
                      <span className="text-sm font-bold text-onyx">Per Kill</span>
                    </div>
                    <span className="text-lg font-black text-onyx">₹10</span>
                  </div>
                </div>
              </BentoCard>

              {/* Rules & Guidelines */}
              <BentoCard variant="pastel" pastelColor="mint" className="p-8 mb-8 border-none">
                <div className="flex items-center gap-4 mb-6">
                  <ShieldCheck size={24} className="text-onyx" />
                  <h4 className="text-lg font-heading text-onyx font-black">Rules & Guidelines</h4>
                </div>
                <ul className="space-y-3">
                  {['No emulators allowed', 'Mobile only tournament', 'Team up = Ban', 'Min Level 40 required'].map((rule, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-onyx/60">
                      <div className="w-1.5 h-1.5 bg-onyx/20 rounded-full" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </BentoCard>

              {/* Steps to Join */}
              <div className="space-y-4 mb-8">
                <h4 className="text-xl font-heading text-onyx font-black px-1">How to Join</h4>
                <div className="space-y-3">
                  {[
                    "1. Pay the entry fee from your wallet",
                    "2. You'll be added to the match lobby",
                    "3. Room ID & Password will be shared 15m before start",
                    "4. Join the Free Fire custom room and win!"
                  ].map((step, i) => (
                    <div key={i} className="p-5 bg-white rounded-2xl shadow-sm border-none text-[12px] font-bold text-onyx/60 leading-relaxed">
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="relative z-[70] px-6 py-8 bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.05)] rounded-t-[40px]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest mb-1">Entry Fee</p>
                  <p className="text-3xl font-heading text-onyx font-black">₹{selectedMatch.tournament?.entry_fee}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest mb-1">Available Slots</p>
                  <p className="text-xl font-heading text-onyx font-black">{selectedMatch.tournament?.slots - selectedMatch.current_slots} LEFT</p>
                </div>
              </div>
              
              {selectedMatch.status === 'upcoming' ? (
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleJoinMatch(selectedMatch.tournament_id, selectedMatch.id)}
                  disabled={joining === selectedMatch.id}
                  className="w-full py-6 bg-onyx text-white rounded-[24px] text-[14px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3"
                >
                  {joining === selectedMatch.id ? <Loader2 size={24} className="animate-spin" /> : "Confirm Entry"}
                </motion.button>
              ) : selectedMatch.status === 'live' ? (
                <Link href={`/live?match=${selectedMatch.id}`}>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-6 bg-electric-blue text-onyx rounded-[24px] text-[14px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3"
                  >
                    Watch Now
                  </motion.button>
                </Link>
              ) : (
                <motion.button 
                  disabled
                  className="w-full py-6 bg-silver/20 text-charcoal/40 rounded-[24px] text-[14px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                >
                  Match Completed
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
