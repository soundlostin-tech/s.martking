"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  IndianRupee, Trophy, Swords, ChevronRight, Calendar, 
  ArrowRight, Star, Users, Play, Target, Zap 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { user, loading: authLoading } = useAuth(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [featuredMatches, setFeaturedMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profiles for "Stories"
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .limit(10);
        setProfiles(profileData || []);

        // Fetch matches for "Tournament Cards"
        const { data: matchData } = await supabase
          .from("matches")
          .select(`
            *,
            tournament:tournaments(title, entry_fee, prize_pool)
          `)
          .or('status.eq.live,status.eq.upcoming')
          .order('status', { ascending: false }) // Live first
          .limit(4);
        setFeaturedMatches(matchData || []);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="min-h-screen w-full bg-zinc-100 pb-32 overflow-x-hidden">
      {/* Stories Section */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-heading text-black">Top Warriors</h2>
            <p className="text-sm font-serif text-zinc-500">The most feared competitors this week</p>
          </div>
          <Link href="/admin/leaderboard" className="text-xs font-bold text-black/40 hover:text-black transition-colors">VIEW ALL</Link>
        </div>

        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
          {profiles.map((profile, i) => (
            <motion.div 
              key={profile.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex-shrink-0 flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-black via-zinc-400 to-white group-hover:scale-105 transition-transform">
                <div className="w-20 h-20 rounded-full bg-zinc-100 border-4 border-zinc-100 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-2xl font-heading text-black/20">{profile.full_name?.[0]}</div>
                  )}
                </div>
                {profile.status === 'Active' && (
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-zinc-100 rounded-full" />
                )}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-black/60 group-hover:text-black transition-colors">
                {profile.full_name?.split(' ')[0]}
              </span>
            </motion.div>
          ))}
          {/* Add a placeholder story */}
          <div className="flex-shrink-0 flex flex-col items-center gap-3 opacity-30">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-black/20 flex items-center justify-center">
              <Zap size={24} className="text-black" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider">SOON</span>
          </div>
        </div>
      </section>

      {/* Featured Tournament Cards */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-heading text-black">Active Battles</h2>
            <p className="text-sm font-serif text-zinc-500">Live and upcoming tournaments you can join now</p>
          </div>
          <Link href="/matches">
            <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/50 border border-black/5 text-xs font-bold text-black hover:bg-black hover:text-white transition-all shadow-sm">
              BROWSE ALL <ChevronRight size={14} />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredMatches.map((match, i) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-white/30 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="absolute top-6 right-8">
                <Badge className={`${
                  match.status === 'live' ? 'bg-red-500' : 'bg-black'
                } text-white rounded-full text-[10px] px-3 py-1 font-bold border-none`}>
                  {match.status.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-black/5 flex items-center justify-center">
                    {match.status === 'live' ? (
                      <Play size={28} className="text-red-500" fill="currentColor" />
                    ) : (
                      <Swords size={28} className="text-black" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading text-black group-hover:translate-x-1 transition-transform">{match.title}</h3>
                    <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-[0.2em]">{match.tournament?.title}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/5 rounded-2xl p-4 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Prize Pool</span>
                    <span className="text-xl font-heading text-black">₹{match.tournament?.prize_pool}</span>
                  </div>
                  <div className="bg-black/5 rounded-2xl p-4 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Entry Fee</span>
                    <span className="text-xl font-heading text-black">₹{match.tournament?.entry_fee}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Users size={14} />
                    <span className="text-xs font-serif">{match.mode} • {match.map || 'Bermuda'}</span>
                  </div>
                  <Link href={match.status === 'live' ? `/live?matchId=${match.id}` : '/matches'}>
                    <button className="flex items-center gap-2 text-xs font-bold text-black group-hover:gap-4 transition-all">
                      {match.status === 'live' ? 'WATCH LIVE' : 'RESERVE SLOT'} <ArrowRight size={16} />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Section (Large Banner Style) */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-[3rem] bg-black p-12 text-center space-y-8 shadow-2xl"
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-zinc-200 blur-[100px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-zinc-400 blur-[100px] rounded-full" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 border border-white/10">
              <Trophy size={14} className="text-white" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Grand Prize Event</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading text-white">The Pro Arena <br /> <span className="italic">Championship</span></h2>
            <p className="text-lg font-serif text-white/60 max-w-md mx-auto">Registration opens in 48 hours. Only the top 64 warriors will be selected.</p>
            <button className="px-10 py-5 bg-white text-black rounded-full font-serif text-lg hover:scale-105 active:scale-95 transition-all shadow-xl">
              Get Notified
            </button>
          </div>
        </motion.div>
      </section>

      <BottomNav />
    </main>
  );
}
