"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { BottomNav } from "@/components/layout/BottomNav";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Swords, Calendar, Users, Loader2, IndianRupee } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { PillButton } from "@/components/ui/PillButton";

const filters = ["All", "Upcoming", "Active", "Completed"];

export default function Matches() {
  const { user, loading: authLoading } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [userParticipations, setUserParticipations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTournaments();
      fetchUserParticipations();
    }
  }, [user, activeFilter]);

  const fetchTournaments = async () => {
    try {
      let query = supabase.from("tournaments").select("*");
      
      if (activeFilter !== "All") {
        query = query.eq("status", activeFilter.toLowerCase());
      }

      const { data, error } = await query.order("start_time", { ascending: true });
      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserParticipations = async () => {
    try {
      const { data, error } = await supabase
        .from("participants")
        .select("tournament_id")
        .eq("user_id", user!.id);
      
      if (error) throw error;
      setUserParticipations(data.map(p => p.tournament_id));
    } catch (error) {
      console.error("Error fetching participations:", error);
    }
  };

  const handleJoin = async (tournament: any) => {
    if (joiningId) return;
    setJoiningId(tournament.id);

    try {
      // 1. Get user wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("id", user!.id)
        .single();

      if (walletError) throw walletError;

      if (Number(wallet.balance) < Number(tournament.entry_fee)) {
        toast.error("Insufficient balance. Please add funds.");
        return;
      }

      // 2. Subtract fee and create transaction
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user!.id,
        amount: tournament.entry_fee,
        type: "entry_fee",
        status: "completed",
        description: `Entry fee for ${tournament.title}`,
      });

      if (txError) throw txError;

      const { error: walletUpdateError } = await supabase
        .from("wallets")
        .update({ balance: Number(wallet.balance) - Number(tournament.entry_fee) })
        .eq("id", user!.id);

      if (walletUpdateError) throw walletUpdateError;

      // 3. Add to participants
      const { error: participantError } = await supabase.from("participants").insert({
        user_id: user!.id,
        tournament_id: tournament.id,
      });

      if (participantError) throw participantError;

      toast.success(`Successfully joined ${tournament.title}!`);
      fetchUserParticipations();
    } catch (error: any) {
      toast.error(error.message || "Failed to join tournament");
    } finally {
      setJoiningId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <Loader2 className="w-8 h-8 animate-spin text-lemon-lime" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-24 bg-stone-100">
      <HeroSection 
        title="Arena Tournaments" 
        subtitle="Browse upcoming, active, and completed battles."
        className="mx-0 rounded-none"
      />

      <div className="px-6 -mt-6 relative z-10">
        <div className="flex bg-stone-100 p-1.5 rounded-full border border-stone-200 overflow-x-auto no-scrollbar gap-1 shadow-md">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeFilter === filter 
                  ? "bg-lime-yellow text-onyx shadow-sm" 
                  : "text-stone-500 hover:text-onyx"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 mt-8 flex flex-col gap-4">
        {tournaments.length > 0 ? (
          tournaments.map((t) => (
            <div key={t.id} className="bg-white border border-stone-200 rounded-[24px] p-6 shadow-md hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge className="bg-olive/10 text-olive border-none mb-2 rounded-full text-[10px] uppercase tracking-tighter">
                    Prize Pool: ₹{t.prize_pool.toLocaleString()}
                  </Badge>
                  <h3 className="text-xl font-heading leading-tight">{t.title}</h3>
                </div>
                <Badge className={
                  t.status === "active" ? "bg-lime-yellow text-onyx border-none" : 
                  t.status === "upcoming" ? "bg-onyx text-white border-none" : 
                  "bg-stone-300 text-stone-600 border-none"
                }>
                  {t.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-stone-100 rounded-lg text-stone-500">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-500 uppercase">Start Time</p>
                    <p className="text-sm font-medium">{new Date(t.start_time).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-stone-100 rounded-lg text-stone-500">
                    <IndianRupee size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-500 uppercase">Entry Fee</p>
                    <p className="text-sm font-medium">₹{t.entry_fee}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex justify-between items-center">
                <div className="text-sm text-stone-500">
                  {t.description}
                </div>
                {userParticipations.includes(t.id) ? (
                  <Badge className="bg-olive text-white border-none px-4 py-2">JOINED</Badge>
                ) : (
                  <PillButton 
                    className="text-sm h-10 px-6" 
                    onClick={() => handleJoin(t)}
                    disabled={joiningId === t.id || t.status === 'completed'}
                  >
                    {joiningId === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join Now"}
                  </PillButton>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-stone-500 py-12">No tournaments found for this filter.</p>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
