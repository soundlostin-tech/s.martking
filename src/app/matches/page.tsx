"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, Trophy, Calendar, Users, 
  ChevronRight, AlertCircle, Swords, Zap, 
  Map as MapIcon, ShieldCheck, Target, Loader2,
  Filter, ArrowUpDown, CheckCircle2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const filters = ["All", "Upcoming", "Live", "Completed"];
const sortOptions = [
  { label: "Start Time", value: "start_time" },
  { label: "Prize Pool", value: "prize" },
  { label: "Entry Fee", value: "entry" }
];

export default function MatchesPage() {
  const { user } = useAuth(false);
  const [activeFilter, setActiveFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('matches_filter') || "Upcoming";
    }
    return "Upcoming";
  });
  const [activeSort, setActiveSort] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('matches_sort') || "start_time";
    }
    return "start_time";
  });

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
    fetchMatches();
    fetchBalance();
  }, [fetchMatches, fetchBalance]);

  useEffect(() => {
    localStorage.setItem('matches_filter', activeFilter);
  }, [activeFilter]);

  useEffect(() => {
    localStorage.setItem('matches_sort', activeSort);
  }, [activeSort]);

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

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] relative">
      {/* Background is now global */}
      
      <main className="pb-[80px] relative z-10">
        <section className="px-4 pt-6 pb-4">
          <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wide mb-2">
            Tournament Hub
          </p>
          <h2 className="text-[32px] font-heading text-[#1A1A1A] leading-tight font-bold">
            Arena
          </h2>
        </section>

        <section className="px-4 space-y-4 pt-2">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
                <input 
                  type="text" 
                  placeholder="Search matches..." 
                  aria-label="Search for matches"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] rounded-lg py-3 pl-12 pr-4 text-sm font-medium shadow-[2px_8px_16px_rgba(0,0,0,0.06)] placeholder:text-[#9CA3AF] focus:border-[#5FD3BC] focus:ring-2 focus:ring-[#5FD3BC]/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1" role="tablist" aria-label="Filter matches by status">
                {filters.map((f) => (
                  <button
                    key={f}
                    role="tab"
                    aria-selected={activeFilter === f}
                    aria-label={`Filter by ${f}`}
                    onClick={() => setActiveFilter(f)}
                    className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all ${
                      activeFilter === f 
                        ? "bg-[#1A1A1A] text-white shadow-lg" 
                        : "bg-white text-[#6B7280] border border-[#E5E7EB]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <select 
                value={activeSort}
                aria-label="Sort matches by"
                onChange={(e) => setActiveSort(e.target.value)}
                className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-[#5FD3BC]/20"
              >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
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
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 flex items-center justify-between border border-[#E5E7EB]">
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="w-14 h-14 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-2 w-1/4 mt-2" />
                    </div>
                  </div>
                  <Skeleton className="w-10 h-10 rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredAndSortedMatches.length > 0 ? (
            filteredAndSortedMatches.map((match) => {
              const totalSlots = match.tournament?.slots || 48;
              const filledSlots = match.current_slots;
              const isFull = filledSlots >= totalSlots;
              const isJoined = myEntries.some(e => e.id === match.id);
              
              return (
                <BentoCard 
                  key={match.id} 
                  className={`p-4 flex items-center justify-between cursor-pointer transition-all group ${isJoined ? 'border-l-4 border-l-[#5FD3BC]' : 'hover:border-[#5FD3BC]'}`}
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#F0FDF4] flex items-center justify-center group-hover:bg-[#5FD3BC] transition-colors relative">
                      <Swords size={24} className="text-[#1A1A1A]" />
                      {isJoined && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#1A1A1A] rounded-full flex items-center justify-center border-2 border-white">
                          <CheckCircle2 size={12} className="text-[#5FD3BC]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-[15px] font-heading text-[#1A1A1A] font-bold leading-tight mb-1">{match.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wide bg-[#F3F4F6] px-2 py-0.5 rounded">₹{match.tournament?.entry_fee} ENTRY</span>
                        <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wide bg-[#F3F4F6] px-2 py-0.5 rounded">{match.mode}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2.5">
                        <div className="w-24 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(filledSlots / totalSlots) * 100}%` }}
                            className={`h-full ${isFull ? 'bg-[#EF4444]' : 'bg-[#5FD3BC]'} rounded-full`} 
                          />
                        </div>
                        <span className="text-[9px] font-bold text-[#6B7280]">
                          {isFull || match.status === 'live' ? "CLOSED" : `${filledSlots}/${totalSlots}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#F9FAFB] flex items-center justify-center group-hover:bg-[#1A1A1A] transition-colors">
                    <ChevronRight size={18} className="text-[#1A1A1A] group-hover:text-white transition-colors" />
                  </div>
                </BentoCard>
              );
            })
          ) : (
            <div className="py-16 text-center">
              <div className="w-14 h-14 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} className="text-[#9CA3AF]" />
              </div>
              <h3 className="text-lg font-heading text-[#1A1A1A] font-bold">No Matches Found</h3>
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
            {/* Background is now global */}
            
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
                <p className="text-[48px] font-heading text-[#1A1A1A] font-bold leading-none mb-2">₹{selectedMatch.tournament?.prize_pool?.toLocaleString()}</p>
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
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-[#F5F5F5] flex items-center justify-center font-bold text-xs">K</div>
                      <span className="text-sm font-bold text-[#1A1A1A]">Per Kill</span>
                    </div>
                    <span className="text-base font-bold text-[#1A1A1A]">₹10</span>
                  </div>
                </div>
              </BentoCard>
            </div>

            <div className="relative z-[70] px-4 py-6 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.08)] rounded-t-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide mb-1">Entry Fee</p>
                  <p className="text-2xl font-heading text-[#1A1A1A] font-bold">₹{selectedMatch.tournament?.entry_fee}</p>
                </div>
                {myEntries.some(e => e.id === selectedMatch.id) ? (
                   <div className="text-right">
                    <span className="bg-[#D1FAE5] text-[#065F46] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">Already Joined</span>
                   </div>
                ) : (
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide mb-1">Remaining Slots</p>
                    <p className="text-lg font-heading text-[#1A1A1A] font-bold">{Math.max(0, (selectedMatch.tournament?.slots || 48) - selectedMatch.current_slots)}</p>
                  </div>
                )}
              </div>
              
              {selectedMatch.status === 'upcoming' ? (
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleJoinMatch(selectedMatch.tournament_id, selectedMatch.id)}
                  disabled={joining === selectedMatch.id || (selectedMatch.current_slots >= (selectedMatch.tournament?.slots || 48)) || myEntries.some(e => e.id === selectedMatch.id)}
                  className="w-full py-4 bg-[#1A1A1A] text-white rounded-xl text-[12px] font-bold uppercase tracking-wide shadow-xl flex items-center justify-center gap-2 disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] transition-colors"
                >
                  {joining === selectedMatch.id ? <Loader2 size={20} className="animate-spin" /> : 
                   myEntries.some(e => e.id === selectedMatch.id) ? "You're in the Battle" :
                   (selectedMatch.current_slots >= (selectedMatch.tournament?.slots || 48)) ? "Registration Closed" : "Confirm Entry"}
                </motion.button>
              ) : (
                <Link href={`/live?match=${selectedMatch.id}`} className="w-full">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-4 bg-[#5FD3BC] text-[#1A1A1A] rounded-xl text-[12px] font-bold uppercase tracking-wide shadow-lg flex items-center justify-center gap-2"
                  >
                    Watch Now
                  </motion.button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isInsufficientFundsOpen} onOpenChange={setIsInsufficientFundsOpen}>
        <DialogContent className="p-0 border-none bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden max-w-[100vw] sm:max-w-[400px] shadow-2xl fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 m-0 z-[100]">
          <div className="bg-[#FEF2F2] p-8 relative">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm">
              <AlertCircle size={24} className="text-[#EF4444]" />
            </div>
            <DialogTitle className="text-[28px] font-heading text-[#1A1A1A] leading-none font-bold mb-2">Insufficient Funds</DialogTitle>
            <DialogDescription className="text-[#1A1A1A]/60 text-[10px] font-bold uppercase tracking-wide">Top up to join the battle</DialogDescription>
          </div>
          <div className="p-6 space-y-6">
            <p className="text-sm font-medium text-[#6B7280]">Your balance (₹{walletBalance?.toLocaleString()}) is lower than the entry fee. Add funds to continue.</p>
            
            <div className="grid grid-cols-2 gap-3">
              {[50, 100, 200, 500].map(amt => (
                <Link key={amt} href={`/wallet?deposit=${amt}`} className="block">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-4 rounded-lg bg-[#F5F5F5] border border-[#E5E7EB] text-[12px] font-bold uppercase tracking-wide text-[#1A1A1A]"
                  >
                    + ₹{amt}
                  </motion.button>
                </Link>
              ))}
            </div>

            <Link href="/wallet" className="block">
              <motion.button 
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 bg-[#1A1A1A] text-white rounded-lg text-[12px] font-bold uppercase tracking-wide shadow-lg flex items-center justify-center gap-2"
              >
                Go to Wallet
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
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl"
            >
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-[#5FD3BC]/20 rounded-full" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-t-[#5FD3BC] rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap size={32} className="text-[#5FD3BC] animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-heading text-[#1A1A1A] font-bold mb-2">Processing Battle Entry</h3>
              <p className="text-sm text-[#6B7280]">Verifying transaction and reserving your slot. Do not close this page.</p>
              {transactionId && (
                <div className="mt-4 p-2 bg-[#F0FDF4] rounded-lg border border-[#DCFCE7]">
                  <p className="text-[10px] font-bold text-[#166534] uppercase tracking-wider">TX ID: {transactionId.slice(0, 12)}...</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
