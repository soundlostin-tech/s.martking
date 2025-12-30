"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, Trophy, Calendar, Users, 
  ChevronRight, AlertCircle, Swords, Zap, 
  Map as MapIcon, Target, Loader2,
  CheckCircle2, Clock
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const filters = ["All", "Upcoming", "Live", "Completed"];
const sortOptions = [
  { label: "Start Time", value: "start_time" },
  { label: "Prize Pool", value: "prize" },
  { label: "Entry Fee", value: "entry" }
];

function MatchesContent() {
  const { user } = useAuth(false);
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Upcoming");
  const [activeSort, setActiveSort] = useState("start_time");

  const [searchQuery, setSearchQuery] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [myEntries, setMyEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isInsufficientFundsOpen, setIsInsufficientFundsOpen] = useState(false);
  const [showProcessingOverlay, setShowProcessingOverlay] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedFilter = localStorage.getItem('matches_filter');
    const savedSort = localStorage.getItem('matches_sort');
    if (savedFilter) setActiveFilter(savedFilter);
    if (savedSort) setActiveSort(savedSort);
  }, []);

  const fetchBalance = useCallback(async () => {
    if (user) {
      const { data } = await supabase.from('wallets').select('balance').eq('user_id', user.id).single();
      if (data) setWalletBalance(data.balance);
    }
  }, [user]);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(`*, tournament:tournaments(*)`)
        .order('start_time', { ascending: true });
      
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
    if (mounted) {
      fetchMatches();
      fetchBalance();
    }
  }, [fetchMatches, fetchBalance, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('matches_filter', activeFilter);
    }
  }, [activeFilter, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('matches_sort', activeSort);
    }
  }, [activeSort, mounted]);

  const handleJoinMatch = async (tournamentId: string, matchId: string) => {
    if (!user) {
      toast.error("Please sign in to join");
      return;
    }

    setJoining(matchId);
    
    const processingTimer = setTimeout(() => {
      setShowProcessingOverlay(true);
    }, 800);

    try {
      const { data, error } = await supabase.rpc('join_tournament', {
        p_tournament_id: tournamentId,
        p_match_id: matchId
      });

      if (error) throw error;

      const result = typeof data === 'string' ? JSON.parse(data) : data;

      if (result.success) {
        setTransactionId(result.transaction_id);
        toast.success("Joined Successfully!", {
          description: `Transaction ID: ${result.transaction_id.slice(0, 8)}...`
        });
        fetchMatches();
        fetchBalance();
        setTimeout(() => {
          setSelectedMatch(null);
          setTransactionId(null);
        }, 2000);
      } else {
        if (result.message?.toLowerCase().includes("balance")) {
          setIsInsufficientFundsOpen(true);
        } else {
          toast.error(result.message || "Entry failed. Please try again.");
        }
      }
    } catch (error: any) {
      console.error("Error joining match:", error);
      toast.error(error.message || "Failed to join");
    } finally {
      clearTimeout(processingTimer);
      setJoining(null);
      setTimeout(() => setShowProcessingOverlay(false), 250);
    }
  };

  const filteredAndSortedMatches = useMemo(() => {
    let result = matches.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           m.tournament?.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === "All" || m.status.toLowerCase() === activeFilter.toLowerCase();
      return matchesSearch && matchesFilter;
    });

    result.sort((a, b) => {
      if (activeSort === "start_time") {
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      }
      if (activeSort === "prize") {
        return (b.tournament?.prize_pool || 0) - (a.tournament?.prize_pool || 0);
      }
      if (activeSort === "entry") {
        return (a.tournament?.entry_fee || 0) - (b.tournament?.entry_fee || 0);
      }
      return 0;
    });

    return result;
  }, [matches, searchQuery, activeFilter, activeSort]);

  if (!mounted) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1A1A1A] relative">
      <main className="pb-[80px] relative z-10">
        <section className="px-5 pt-8 pb-4">
          <p className="text-[12px] font-black text-[#6B7280] uppercase tracking-widest mb-2">
            Tournament Hub
          </p>
          <h2 className="text-[36px] font-heading text-[#1A1A1A] leading-tight font-black tracking-tighter">
            ARENA BATTLES
          </h2>
        </section>

        <section className="px-5 space-y-6 pt-2">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={20} strokeWidth={3} />
                <input 
                  type="text" 
                  placeholder="Search matches..." 
                  aria-label="Search for matches"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border-2 border-[#E5E7EB] rounded-2xl py-4 pl-14 pr-6 text-sm font-bold shadow-md placeholder:text-[#9CA3AF] focus:border-[#1A1A1A] focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Filter matches by status">
                {filters.map((f) => (
                  <button
                    key={f}
                    role="tab"
                    aria-selected={activeFilter === f}
                    aria-label={`Filter by ${f}`}
                    onClick={() => setActiveFilter(f)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      activeFilter === f 
                        ? "bg-[#1A1A1A] text-white shadow-lg scale-105" 
                        : "bg-white text-[#6B7280] border-2 border-[#E5E7EB]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest">SORT BY:</span>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {sortOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setActiveSort(opt.value)}
                      className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        activeSort === opt.value
                          ? "bg-[#A8E6CF] text-[#1A1A1A] border-2 border-[#1A1A1A]"
                          : "bg-white text-[#6B7280] border-2 border-[#E5E7EB]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
          </div>
        </section>

        {myEntries.length > 0 && activeFilter === "Upcoming" && (
          <section className="px-5 pt-10">
            <h3 className="text-sm font-black text-[#6B7280] uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
              MY BATTLES <span className="w-6 h-6 rounded-lg bg-[#1A1A1A] text-white text-[10px] flex items-center justify-center font-black shadow-lg">{myEntries.length}</span>
            </h3>
            <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4">
              {myEntries.map((match) => (
                <BentoCard 
                  key={match.id} 
                  variant="dark" 
                  className="w-[280px] flex-shrink-0 p-8 shadow-2xl relative overflow-hidden group"
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-white/20 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">JOINED</div>
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <ChevronRight size={20} className="text-white" />
                      </div>
                    </div>
                    <h4 className="text-xl font-heading text-white font-black leading-tight mb-6 tracking-tight">{match.title}</h4>
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">BATTLE TIME</p>
                        <p className="text-base font-black text-white">{new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.05] group-hover:scale-110 transition-transform">
                    <Zap size={120} />
                  </div>
                </BentoCard>
              ))}
            </div>
          </section>
        )}

          <section className="px-5 pt-8 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-[120px] w-full rounded-[24px]" />
                ))}
              </div>
            ) : filteredAndSortedMatches.length > 0 ? (
              filteredAndSortedMatches.map((match, idx) => {
                const totalSlots = match.tournament?.slots || 48;
                const filledSlots = match.current_slots;
                const isFull = filledSlots >= totalSlots;
                const isJoined = myEntries.some(e => e.id === match.id);
                
                const colors = ["mint", "blue", "pink", "yellow", "coral", "teal"];
                const color = colors[idx % colors.length] as any;
                
                return (
                  <motion.div 
                    key={match.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMatch(match)}
                  >
                    <BentoCard 
                      variant={color}
                      className={`p-5 sm:p-6 flex items-center justify-between border-none shadow-xl group relative overflow-hidden ${isJoined ? 'ring-4 ring-[#1A1A1A]' : ''}`}
                    >
                      <div className="flex items-center gap-4 sm:gap-5 relative z-10 flex-1 min-w-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-[24px] bg-white/40 flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                          <Swords size={24} className="text-[#1A1A1A]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base sm:text-lg font-heading text-[#1A1A1A] font-black leading-tight mb-1 tracking-tight truncate">{match.title}</h4>
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <span className="text-[9px] sm:text-[10px] font-black text-[#1A1A1A]/60 uppercase tracking-widest whitespace-nowrap">₹{match.tournament?.entry_fee} ENTRY</span>
                            <span className="text-[9px] text-[#1A1A1A]/20 font-black">•</span>
                            <span className="text-[9px] sm:text-[10px] font-black text-[#1A1A1A]/60 uppercase tracking-widest">{match.mode}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            <div className="w-20 sm:w-28 h-2 bg-white/30 rounded-full overflow-hidden border border-white/20">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(filledSlots / totalSlots) * 100}%` }}
                                className={`h-full ${isFull ? 'bg-red-500' : 'bg-[#1A1A1A]'} rounded-full`} 
                              />
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-black text-[#1A1A1A]/80 uppercase tracking-widest whitespace-nowrap">
                              {isFull || match.status === 'live' ? "CLOSED" : `${filledSlots}/${totalSlots}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#1A1A1A] text-white flex-shrink-0 flex items-center justify-center shadow-xl group-hover:translate-x-1 transition-transform relative z-10 ml-4">
                        <ChevronRight size={20} strokeWidth={3} />
                      </div>
                      {isJoined && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-[#1A1A1A] rounded-full flex items-center justify-center border-2 border-white shadow-lg z-20">
                          <CheckCircle2 size={12} className="text-[#5FD3BC]" />
                        </div>
                      )}
                    </BentoCard>
                  </motion.div>
                );
              })
          ) : (
            <div className="py-20 text-center bg-white rounded-[40px] shadow-2xl border-none mx-2">
              <div className="w-20 h-20 bg-[#F3F4F6] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <AlertCircle size={40} className="text-[#9CA3AF]" />
              </div>
              <h3 className="text-2xl font-heading text-[#1A1A1A] font-black tracking-tighter mb-2">ARENA EMPTY</h3>
              <p className="text-[10px] text-[#6B7280] font-black uppercase tracking-widest">Try adjusting your filters</p>
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
            className="fixed inset-0 z-[60] bg-[#F8F6F0] flex flex-col"
          >
            <header className="relative z-10 px-5 py-8 flex items-center justify-between">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedMatch(null)}
                className="w-12 h-12 bg-white border-2 border-[#E5E7EB] rounded-2xl flex items-center justify-center shadow-lg"
              >
                <ChevronRight className="rotate-180 text-[#1A1A1A]" size={24} strokeWidth={3} />
              </motion.button>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280]">Match Intelligence</h2>
              <div className="w-12" />
            </header>

            <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-5 pb-32">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <StatusBadge variant={selectedMatch.status} className="bg-[#1A1A1A] text-white px-4 py-1.5 rounded-full font-black text-[10px]" />
                  <div className="px-3 py-1 bg-white border-2 border-[#E5E7EB] rounded-xl text-[10px] font-black text-[#1A1A1A] flex items-center gap-1.5 shadow-sm">
                    <Clock size={12} strokeWidth={3} />
                    {selectedMatch.status === 'live' ? 'LIVE' : 'SOON'}
                  </div>
                </div>
                <h1 className="text-[40px] font-heading text-[#1A1A1A] font-black leading-[0.9] mb-4 tracking-tighter">
                  {selectedMatch.title}
                </h1>
                <p className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest">{selectedMatch.tournament?.title}</p>
              </div>

              <BentoCard variant="purple" className="p-8 mb-8 text-center relative overflow-hidden shadow-2xl">
                <p className="text-[11px] font-black text-[#1A1A1A]/40 uppercase tracking-[0.2em] mb-3">GRAND PRIZE POOL</p>
                <p className="text-[56px] font-heading text-[#1A1A1A] font-black leading-none mb-2 tracking-tighter">₹{selectedMatch.tournament?.prize_pool?.toLocaleString()}</p>
                <div className="absolute right-[-30px] bottom-[-30px] rotate-[-15deg] opacity-[0.03] pointer-events-none">
                  <Trophy size={180} />
                </div>
              </BentoCard>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <BentoCard className="p-6 bg-white shadow-xl border-none">
                    <div className="w-10 h-10 rounded-xl bg-[#A8D8EA]/30 flex items-center justify-center mb-4">
                    <Calendar size={20} className="text-[#1A1A1A]" strokeWidth={2.5} />
                  </div>
                  <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-1">SCHEDULE</p>
                  <p className="text-sm font-black text-[#1A1A1A] tracking-tight">{new Date(selectedMatch.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(selectedMatch.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </BentoCard>
                <BentoCard className="p-6 bg-white shadow-xl border-none">
                    <div className="w-10 h-10 rounded-xl bg-[#A8E6CF]/30 flex items-center justify-center mb-4">
                    <MapIcon size={20} className="text-[#1A1A1A]" strokeWidth={2.5} />
                  </div>
                  <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-1">ARENA MAP</p>
                  <p className="text-sm font-black text-[#1A1A1A] tracking-tight">{selectedMatch.map || 'Bermuda'}</p>
                </BentoCard>
                <BentoCard className="p-6 bg-white shadow-xl border-none">
                  <div className="w-10 h-10 rounded-xl bg-[#FFCDB2]/30 flex items-center justify-center mb-4">
                    <Target size={20} className="text-[#1A1A1A]" strokeWidth={2.5} />
                  </div>
                  <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-1">BATTLE MODE</p>
                  <p className="text-sm font-black text-[#1A1A1A] tracking-tight">{selectedMatch.mode}</p>
                </BentoCard>
                <BentoCard className="p-6 bg-white shadow-xl border-none">
                  <div className="w-10 h-10 rounded-xl bg-[#FFB6C1]/30 flex items-center justify-center mb-4">
                    <Users size={20} className="text-[#1A1A1A]" strokeWidth={2.5} />
                  </div>
                  <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-1">POPULATION</p>
                  <p className="text-sm font-black text-[#1A1A1A] tracking-tight">{selectedMatch.current_slots} / {selectedMatch.tournament?.slots || 48}</p>
                </BentoCard>
              </div>

              <BentoCard variant="mint" className="p-8 mb-8 shadow-2xl relative overflow-hidden group">
                <h4 className="text-xl font-heading text-[#1A1A1A] font-black tracking-tight mb-6">BATTLE REWARDS</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b-2 border-white/40">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center font-black text-sm shadow-lg">1st</div>
                      <span className="text-base font-black text-[#1A1A1A] tracking-tight">Champion</span>
                    </div>
                    <span className="text-xl font-black text-[#1A1A1A]">₹2,500</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center font-black text-sm shadow-sm">K</div>
                      <span className="text-base font-black text-[#1A1A1A] tracking-tight">Per Kill</span>
                    </div>
                    <span className="text-xl font-black text-[#1A1A1A]">₹10</span>
                  </div>
                </div>
                <div className="absolute right-[-10px] top-[-10px] opacity-[0.05] group-hover:rotate-12 transition-transform">
                  <Award size={100} />
                </div>
              </BentoCard>
            </div>

            <div className="relative z-[70] px-5 py-8 bg-white shadow-[0_-15px_40px_rgba(0,0,0,0.1)] rounded-t-[40px] border-t-2 border-[#E5E7EB]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-1">ENTRY PASS</p>
                  <p className="text-4xl font-heading text-[#1A1A1A] font-black tracking-tighter">₹{selectedMatch.tournament?.entry_fee}</p>
                </div>
                {myEntries.some(e => e.id === selectedMatch.id) ? (
                   <div className="text-right">
                     <span className="bg-[#A8E6CF] text-[#1A1A1A] border-2 border-[#1A1A1A] px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">PASS SECURED</span>
                   </div>
                ) : (
                  <div className="text-right">
                    <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-1">VACANCIES</p>
                    <p className="text-2xl font-heading text-[#1A1A1A] font-black tracking-tighter">{Math.max(0, (selectedMatch.tournament?.slots || 48) - selectedMatch.current_slots)}</p>
                  </div>
                )}
              </div>
              
              {selectedMatch.status === 'upcoming' ? (
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleJoinMatch(selectedMatch.tournament_id, selectedMatch.id)}
                  disabled={joining === selectedMatch.id || (selectedMatch.current_slots >= (selectedMatch.tournament?.slots || 48)) || myEntries.some(e => e.id === selectedMatch.id)}
                  className="w-full py-5 bg-[#1A1A1A] text-white rounded-[24px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:shadow-none transition-all"
                >
                  {joining === selectedMatch.id ? <Loader2 size={24} className="animate-spin" /> : 
                   myEntries.some(e => e.id === selectedMatch.id) ? "READY FOR BATTLE" :
                   (selectedMatch.current_slots >= (selectedMatch.tournament?.slots || 48)) ? "ARENA FULL" : "DEPLOY TO BATTLE"}
                </motion.button>
              ) : (
                <Link href={`/live?match=${selectedMatch.id}`} className="w-full">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-5 bg-[#6EBF8B] text-[#1A1A1A] rounded-[24px] text-sm font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3"
                  >
                    WATCH LIVE
                    <Play size={20} fill="#1A1A1A" />
                  </motion.button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isInsufficientFundsOpen} onOpenChange={setIsInsufficientFundsOpen}>
        <DialogContent className="p-0 border-none bg-white rounded-[40px] overflow-hidden max-w-[95vw] sm:max-w-[420px] shadow-2xl fixed bottom-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 left-1/2 -translate-x-1/2 m-0 z-[100]">
          <div className="bg-[#FFF1E6] p-10 relative">
            <div className="w-16 h-16 rounded-[24px] bg-white flex items-center justify-center mb-6 shadow-xl rotate-6">
              <AlertCircle size={32} className="text-orange-500" strokeWidth={3} />
            </div>
            <DialogTitle className="text-4xl font-heading text-[#1A1A1A] leading-none font-black mb-3 tracking-tighter">EMPTY TANK</DialogTitle>
            <DialogDescription className="text-[#1A1A1A]/60 text-[10px] font-black uppercase tracking-[0.2em]">Add fuel to join the arena</DialogDescription>
          </div>
          <div className="p-8 space-y-8">
            <p className="text-base font-bold text-[#6B7280] leading-relaxed">Your balance (₹{walletBalance?.toLocaleString()}) is insufficient for this entry pass.</p>
            
            <div className="grid grid-cols-2 gap-4">
              {[50, 100, 200, 500].map(amt => (
                <Link key={amt} href={`/wallet?deposit=${amt}`} className="block">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-5 rounded-2xl bg-white border-2 border-[#E5E7EB] text-[11px] font-black uppercase tracking-widest text-[#1A1A1A] hover:bg-[#F5F5F5] transition-all shadow-sm"
                  >
                    + ₹{amt}
                  </motion.button>
                </Link>
              ))}
            </div>

            <Link href="/wallet" className="block">
              <motion.button 
                whileTap={{ scale: 0.98 }}
                className="w-full h-16 bg-[#1A1A1A] text-white rounded-[24px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3"
              >
                VISIT REFUEL STATION
                <ChevronRight size={20} strokeWidth={3} />
              </motion.button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {showProcessingOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-[0_30px_60px_rgba(0,0,0,0.3)] border-4 border-white"
            >
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 border-8 border-[#F5F5F5] rounded-full" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-8 border-t-[#1A1A1A] border-r-transparent border-b-transparent border-l-transparent rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap size={40} className="text-[#1A1A1A] animate-pulse" />
                </div>
              </div>
              <h3 className="text-3xl font-heading text-[#1A1A1A] font-black mb-3 tracking-tighter">AUTHORIZING...</h3>
              <p className="text-sm font-bold text-[#6B7280] leading-relaxed">Securing your deployment slot in the arena. Stay in line.</p>
              {transactionId && (
                <div className="mt-8 p-4 bg-[#D9F9E6] rounded-2xl border-2 border-[#1A1A1A] shadow-md">
                  <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">TX AUTH: {transactionId.slice(0, 16)}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MatchesPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <MatchesContent />
      <BottomNav />
    </Suspense>
  );
}
