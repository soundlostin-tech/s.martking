"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { HeroSection } from "@/components/layout/HeroSection";
import { TopHeader } from "@/components/layout/TopHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Trophy, Users, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [featuredMatches, setFeaturedMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data: matchesRes } = await supabase
        .from("matches")
        .select(`*, tournament:tournaments(title, entry_fee, prize_pool)`)
        .or('status.eq.live,status.eq.upcoming')
        .order('status', { ascending: false })
        .limit(3);

      setFeaturedMatches(matchesRes || []);
    } catch (error) {
      console.error("Error fetching arena data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen pb-24">
      <TopHeader />
      
      <main className="pt-24 px-6 space-y-12 max-w-4xl mx-auto">
        <section className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold tracking-tight text-primary"
          >
            Smartking's Arena
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground"
          >
            Dominate the battlefield. Win legendary rewards.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pt-4"
          >
            <Link 
              href="/matches" 
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Enter the Arena <ArrowRight size={20} />
            </Link>
          </motion.div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured Battles</h2>
            <Link href="/matches" className="text-sm font-medium text-jungle-teal hover:underline">
              View All
            </Link>
          </div>

          <div className="grid gap-4">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
              ))
            ) : featuredMatches.map((match) => (
              <Link 
                key={match.id}
                href={`/matches/${match.id}`}
                className="group relative bg-card border border-border p-6 rounded-2xl hover:border-jungle-teal transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        match.status === 'live' ? 'bg-red-500 text-white' : 'bg-jungle-teal/10 text-jungle-teal'
                      }`}>
                        {match.status}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase tracking-widest">{match.mode}</span>
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-jungle-teal transition-colors">{match.title}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">₹{match.tournament?.prize_pool}</div>
                    <div className="text-xs text-muted-foreground">Prize Pool</div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <div className="flex gap-6">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar size={14} />
                      <span>{new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Trophy size={14} />
                      <span>₹{match.tournament?.entry_fee} Entry</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-jungle-teal">Join Now</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
