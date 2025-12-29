"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState, useEffect, useCallback } from "react";
import { 
  Search, Loader2, Trophy, Calendar, Users, 
  ChevronRight, AlertCircle, Swords, Zap, 
  Map as MapIcon, ShieldCheck, Target
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
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] relative">
      <div className="unified-bg" />
      
      <main className="pb-[80px] relative z-10">
        <section className="px-4 pt-6 pb-4">
          <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wide mb-2">
            Tournament Hub
          </p>
          <h2 className="text-[32px] font-heading text-[#1A1A1A] leading-tight font-bold">
            MATCHES
          </h2>
          <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wide mt-1">
            Enter the Arena
          </p>
        </section>

        <section className="px-4 space-y-4 pt-2">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E5E7EB] rounded-lg py-3 pl-12 pr-4 text-sm font-medium shadow-[2px_8px_16px_rgba(0,0,0,0.06)] placeholder:text-[#9CA3AF] focus:border-[#5FD3BC] focus:ring-2 focus:ring-[#5FD3BC]/20 focus:outline-none"
              />
            </div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-[2px_8px_16px_rgba(0,0,0,0.06)] border border-[#E5E7EB]"
            >
              <Zap size={20} className="text-[#1A1A1A]" />
            </motion.button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all touch-target ${
                  activeFilter === f 
                    ? "bg-[#1A1A1A] text-white shadow-lg" 
                    : "bg-white text-[#6B7280] shadow-[2px_8px_16px_rgba(0,0,0,0.06)] border border-[#E5E7EB]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {myEntries.length > 0 && activeFilter === "Upcoming" && (
          <section className="px-4 pt-6">
            <h3 className="text-lg font-heading text-[#1A1A1A] font-bold mb-4 flex items-center gap-2">
              My Entries <span className="w-6 h-6 rounded-full bg-[#5FD3BC] text-[10px] flex items-center justify-center font-bold">{myEntries.length}</span>
            </h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {myEntries.map((match) => (
                <BentoCard 
                  key={match.id} 
                  variant="dark" 
                  className="w-64 flex-shrink-0 p-5"
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <StatusBadge variant="upcoming" className="bg-white/10 text-white" />
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <ChevronRight size={16} className="text-white" />
                    </div>
                  </div>
                  <h4 className="text-base font-heading text-white font-bold leading-tight mb-3">{match.title}</h4>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-white/50 uppercase tracking-wide">Starts at</p>
                      <p className="text-sm font-bold text-white">{new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <p className="text-sm font-bold text-[#5FD3BC]">JOINED</p>
                  </div>
                </BentoCard>
              ))}
            </div>
          </section>
        )}

        <section className="px-4 pt-6 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-[#5FD3BC]" />
              <p className="text-[12px] font-bold text-[#1A1A1A] uppercase tracking-wide">Scanning Arena...</p>
            </div>
          ) : filteredMatches.length > 0 ? (
            filteredMatches.map((match) => (
              <BentoCard 
                key={match.id} 
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setSelectedMatch(match)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#D1FAE5] flex items-center justify-center">
                    <Swords size={22} className="text-[#1A1A1A]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-heading text-[#1A1A1A] font-bold leading-tight">{match.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wide">₹{match.tournament?.entry_fee} ENTRY</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="w-16 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#5FD3BC] rounded-full" 
                          style={{ width: `${(match.current_slots / (match.tournament?.slots || 48)) * 100}%` }} 
                        />
                      </div>
                      <span className="text-[8px] font-bold text-[#6B7280]">{match.current_slots}/{match.tournament?.slots || 48}</span>
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                  <ChevronRight size={18} className="text-[#1A1A1A]" />
                </div>
              </BentoCard>
            ))
          ) : (
            <div className="py-16 text-center">
              <div className="w-14 h-14 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} className="text-[#9CA3AF]" />
              </div>
              <h3 className="text-lg font-heading text-[#1A1A1A] font-bold">No Matches Found</h3>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide mt-1">Try a different filter</p>
            </div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {selectedMatch && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[60] bg-[#F5F5F5] flex flex-col"
          >
            <div className="unified-bg" />
            
            <header className="relative z-10 px-4 py-6 flex items-center justify-between">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedMatch(null)}
                className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-[2px_8px_16px_rgba(0,0,0,0.06)]"
              >
                <ChevronRight className="rotate-180 text-[#1A1A1A]" size={20} />
              </motion.button>
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#1A1A1A]">Match Details</h2>
              <div className="w-10" />
            </header>

            <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-4 pb-32">
              <div className="mb-6">
                <StatusBadge variant={selectedMatch.status} className="mb-3" />
                <h1 className="text-[32px] font-heading text-[#1A1A1A] font-bold leading-tight mb-2">
                  {selectedMatch.title}
                </h1>
                <p className="text-sm font-bold text-[#6B7280] uppercase tracking-wide">{selectedMatch.tournament?.title}</p>
              </div>

              <BentoCard variant="vibrant" className="p-6 mb-6 text-center relative overflow-hidden">
                <p className="text-[10px] font-bold text-[#1A1A1A]/60 uppercase tracking-wide mb-2">Grand Prize Pool</p>
                <p className="text-[48px] font-heading text-[#1A1A1A] font-bold leading-none mb-2">₹{selectedMatch.tournament?.prize_pool}</p>
                <div className="absolute right-[-20px] bottom-[-20px] rotate-[-15deg] opacity-10">
                  <Trophy size={100} />
                </div>
              </BentoCard>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <BentoCard className="p-4">
                  <Calendar size={16} className="text-[#9CA3AF] mb-2" />
                  <p className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wide mb-1">Date & Time</p>
                  <p className="text-sm font-bold text-[#1A1A1A]">{new Date(selectedMatch.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(selectedMatch.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </BentoCard>
                <BentoCard className="p-4">
                  <MapIcon size={16} className="text-[#9CA3AF] mb-2" />
                  <p className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wide mb-1">Game Map</p>
                  <p className="text-sm font-bold text-[#1A1A1A]">{selectedMatch.map || 'Bermuda'}</p>
                </BentoCard>
                <BentoCard className="p-4">
                  <Target size={16} className="text-[#9CA3AF] mb-2" />
                  <p className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wide mb-1">Mode</p>
                  <p className="text-sm font-bold text-[#1A1A1A]">{selectedMatch.mode}</p>
                </BentoCard>
                <BentoCard className="p-4">
                  <Users size={16} className="text-[#9CA3AF] mb-2" />
                  <p className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wide mb-1">Slots Filled</p>
                  <p className="text-sm font-bold text-[#1A1A1A]">{selectedMatch.current_slots} / {selectedMatch.tournament?.slots || 48}</p>
                </BentoCard>
              </div>

              <BentoCard variant="pastel" pastelColor="sky" className="p-6 mb-6">
                <h4 className="text-lg font-heading text-[#1A1A1A] font-bold mb-4">Prize Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-[#1A1A1A]/5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-[#5FD3BC] flex items-center justify-center font-bold text-xs">1st</div>
                      <span className="text-sm font-bold text-[#1A1A1A]">Winner</span>
                    </div>
                    <span className="text-base font-bold text-[#1A1A1A]">₹2,500</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#1A1A1A]/5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-[#E5E7EB] flex items-center justify-center font-bold text-xs">2nd</div>
                      <span className="text-sm font-bold text-[#1A1A1A]">Runner Up</span>
                    </div>
                    <span className="text-base font-bold text-[#1A1A1A]">₹1,200</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-[#F5F5F5] flex items-center justify-center font-bold text-xs">K</div>
                      <span className="text-sm font-bold text-[#1A1A1A]">Per Kill</span>
                    </div>
                    <span className="text-base font-bold text-[#1A1A1A]">₹10</span>
                  </div>
                </div>
              </BentoCard>

              <BentoCard variant="pastel" pastelColor="mint" className="p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck size={22} className="text-[#1A1A1A]" />
                  <h4 className="text-lg font-heading text-[#1A1A1A] font-bold">Rules & Guidelines</h4>
                </div>
                <ul className="space-y-2">
                  {['No emulators allowed', 'Mobile only tournament', 'Team up = Ban', 'Min Level 40 required'].map((rule, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A]/70">
                      <div className="w-1.5 h-1.5 bg-[#1A1A1A]/30 rounded-full" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </BentoCard>

              <div className="space-y-3 mb-6">
                <h4 className="text-lg font-heading text-[#1A1A1A] font-bold px-1">How to Join</h4>
                {[
                  "1. Pay the entry fee from your wallet",
                  "2. You'll be added to the match lobby",
                  "3. Room ID & Password will be shared 15m before start",
                  "4. Join the Free Fire custom room and win!"
                ].map((step, i) => (
                  <div key={i} className="p-4 bg-white rounded-lg shadow-[2px_8px_16px_rgba(0,0,0,0.06)] text-[12px] font-bold text-[#6B7280] leading-relaxed">
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-[70] px-4 py-6 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.08)] rounded-t-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide mb-1">Entry Fee</p>
                  <p className="text-2xl font-heading text-[#1A1A1A] font-bold">₹{selectedMatch.tournament?.entry_fee}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide mb-1">Available Slots</p>
                  <p className="text-lg font-heading text-[#1A1A1A] font-bold">{selectedMatch.tournament?.slots - selectedMatch.current_slots} LEFT</p>
                </div>
              </div>
              
              {selectedMatch.status === 'upcoming' ? (
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleJoinMatch(selectedMatch.tournament_id, selectedMatch.id)}
                  disabled={joining === selectedMatch.id}
                  className="w-full py-4 bg-[#5FD3BC] text-[#1A1A1A] rounded-lg text-[12px] font-bold uppercase tracking-wide shadow-lg flex items-center justify-center gap-2 disabled:bg-[#D1D5DB]"
                >
                  {joining === selectedMatch.id ? <Loader2 size={20} className="animate-spin" /> : "Confirm Entry"}
                </motion.button>
              ) : selectedMatch.status === 'live' ? (
                <Link href={`/live?match=${selectedMatch.id}`}>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-4 bg-[#5FD3BC] text-[#1A1A1A] rounded-lg text-[12px] font-bold uppercase tracking-wide shadow-lg flex items-center justify-center gap-2"
                  >
                    Watch Now
                  </motion.button>
                </Link>
              ) : (
                <motion.button 
                  disabled
                  className="w-full py-4 bg-[#E5E7EB] text-[#9CA3AF] rounded-lg text-[12px] font-bold uppercase tracking-wide flex items-center justify-center gap-2"
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
