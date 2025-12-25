"use client";

import { HeroSection } from "@/components/layout/HeroSection";
import { AdminNav } from "@/components/layout/AdminNav";
import { Badge } from "@/components/ui/badge";
import { PillButton } from "@/components/ui/PillButton";
import { Play, Pause, Square, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Match {
  id: string;
  title: string;
  status: string;
  start_time: string;
  tournament_id: string;
  tournaments: {
    title: string;
  };
}

export default function AdminLive() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          tournaments (
            title
          )
        `)
        .in("status", ["active", "upcoming", "paused"])
        .order("start_time", { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateMatchStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("matches")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
      toast.success(`Match status updated to ${status}`);
      fetchMatches();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const activeMatch = matches.find(m => m.status === 'active');
  const otherMatches = matches.filter(m => m.id !== activeMatch?.id);

  return (
    <main className="min-h-screen pb-24 bg-stone-100">
      <HeroSection 
        title="Live Monitoring" 
        subtitle="Monitor all active tournament sessions."
        className="mx-0 rounded-none pb-24"
      />

      <div className="px-6 -mt-12 relative z-10 flex flex-col gap-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-lemon-lime" />
          </div>
        ) : activeMatch ? (
          <div className="bg-onyx rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <Badge className="bg-lime-yellow text-onyx animate-pulse">ACTIVE</Badge>
                <p className="text-sm font-heading">Match #{activeMatch.id.slice(0, 6).toUpperCase()}</p>
              </div>
              <h2 className="text-3xl font-heading mb-2">{activeMatch.title}</h2>
              <p className="text-sm opacity-60 mb-8">{activeMatch.tournaments?.title}</p>
              
              <div className="flex gap-3">
                <PillButton 
                  className="flex-1 text-xs py-2 bg-white/10 hover:bg-white/20 border-white/20 text-white flex items-center justify-center gap-2"
                  onClick={() => updateMatchStatus(activeMatch.id, 'paused')}
                >
                  <Pause size={14} /> Pause
                </PillButton>
                <PillButton 
                  className="flex-1 text-xs py-2 bg-red-600/80 hover:bg-red-600 text-white flex items-center justify-center gap-2"
                  onClick={() => updateMatchStatus(activeMatch.id, 'completed')}
                >
                  <Square size={14} /> End Match
                </PillButton>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-lemon-lime/10 blur-[80px] rounded-full" />
          </div>
        ) : (
          <div className="bg-white rounded-[32px] p-8 text-center border border-dashed border-stone-300">
            <p className="text-stone-500">No active matches at the moment</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-heading text-xl">Pending Matches</h3>
            <button onClick={fetchMatches} className="text-xs text-stone-500 font-bold hover:text-onyx transition-all">REFRESH</button>
          </div>
          
          {otherMatches.length > 0 ? (
            otherMatches.map((match) => (
              <div key={match.id} className="bg-white rounded-[24px] p-5 border border-stone-200 shadow-sm flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <button 
                    className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-onyx hover:bg-lime-yellow transition-all"
                    onClick={() => updateMatchStatus(match.id, 'active')}
                  >
                    <Play size={20} className="fill-current" />
                  </button>
                  <div>
                    <h4 className="font-medium text-sm">{match.title}</h4>
                    <p className="text-[10px] text-stone-500 uppercase font-bold">{match.status} • {new Date(match.start_time).toLocaleTimeString()}</p>
                  </div>
                </div>
                <Badge className="bg-stone-100 text-stone-500 border-none rounded-full">
                  {match.tournaments?.title.slice(0, 15)}...
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-center text-stone-400 py-8 text-sm">No pending matches found</p>
          )}
        </div>
      </div>

      <AdminNav />
    </main>
  );
}
