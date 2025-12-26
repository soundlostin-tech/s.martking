"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { PaperWrapper } from "@/components/layout/PaperWrapper";
import { HandDrawnGrid, HandDrawnX, HandDrawnO } from "@/components/HandDrawnGame";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { TopHeader } from "@/components/layout/TopHeader";
import { BottomNav } from "@/components/layout/BottomNav";

export default function Home() {
  const { user } = useAuth(false);
  const [step, setStep] = useState<'welcome' | 'chooses' | 'destiny' | 'board'>('welcome');
  const [featuredMatches, setFeaturedMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data: matchesRes } = await supabase
        .from("matches")
        .select(`*, tournament:tournaments(title, entry_fee, prize_pool)`)
        .or('status.eq.live,status.eq.upcoming')
        .order('status', { ascending: false })
        .limit(5);

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
    <div className="w-full">
      <TopHeader />
      <PaperWrapper className="mt-20">
        <div className="relative w-full h-full min-h-[450px] flex flex-col items-center justify-center text-center py-10">
          
          <AnimatePresence mode="wait">
            {step === 'welcome' && (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="flex flex-col items-center gap-8"
              >
                <h1 className="text-6xl mb-4">Smartking's Arena</h1>
                <p className="text-2xl opacity-70">The ultimate battlefield awaits...</p>
                <button 
                  onClick={() => setStep('chooses')}
                  className="btn-hand-drawn mt-8 px-10 py-4 bg-[#000033] text-white"
                >
                  Let's play!
                </button>
              </motion.div>
            )}

            {step === 'chooses' && (
              <motion.div 
                key="chooses"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex flex-col items-center gap-8"
              >
                <h2 className="text-5xl mb-4">Choose Your Path</h2>
                <div className="flex gap-12">
                  <button onClick={() => setStep('destiny')} className="flex flex-col items-center gap-4 group">
                    <div className="w-24 h-24 border-2 border-dashed border-[#000033]/30 rounded-2xl flex items-center justify-center group-hover:border-[#000033] group-hover:rotate-6 transition-all">
                      <HandDrawnX />
                    </div>
                    <span className="text-xl">Solo Warrior</span>
                  </button>
                  <button onClick={() => setStep('destiny')} className="flex flex-col items-center gap-4 group">
                    <div className="w-24 h-24 border-2 border-dashed border-[#000033]/30 rounded-2xl flex items-center justify-center group-hover:border-[#000033] group-hover:-rotate-6 transition-all">
                      <HandDrawnO />
                    </div>
                    <span className="text-xl">Arena Squad</span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'destiny' && (
              <motion.div 
                key="destiny"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="flex flex-col items-center gap-8"
              >
                <h2 className="text-5xl mb-4">Choose Your Destiny</h2>
                <div className="flex gap-12">
                  <button onClick={() => setStep('board')} className="btn-hand-drawn">Classic Mode</button>
                  <button onClick={() => setStep('board')} className="btn-hand-drawn">Elite Mode</button>
                </div>
              </motion.div>
            )}

            {step === 'board' && (
              <motion.div 
                key="board"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full flex flex-col gap-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-4xl m-0">Active Operations</h2>
                  <div className="text-xl -rotate-6 text-red-600 font-bold border-2 border-red-600 px-4 py-1 rounded">
                    BATTLE ON!
                  </div>
                </div>

                <div className="space-y-4">
                  {featuredMatches.map((match, i) => (
                    <div 
                      key={match.id}
                      className="relative border-b-2 border-[#000033]/10 pb-4 flex items-center justify-between hover:bg-[#000033]/5 p-4 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 relative">
                          <HandDrawnGrid />
                          <div className="absolute inset-0 flex items-center justify-center text-[#000033]/40">
                            {i % 2 === 0 ? <HandDrawnX /> : <HandDrawnO />}
                          </div>
                        </div>
                        <div className="text-left">
                          <h3 className="text-2xl m-0">{match.title}</h3>
                          <p className="text-sm opacity-60 uppercase tracking-widest">{match.mode} • {match.map || 'Bermuda'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-heading text-[#000033]">₹{match.tournament?.entry_fee}</div>
                        <Link href={`/matches/${match.id}`} className="text-sm underline hover:text-[#000033]/60 transition-colors">Details</Link>
                      </div>
                    </div>
                  ))}
                </div>

                <Link href="/matches" className="btn-hand-drawn mx-auto mt-4 inline-block px-8 py-2 border-[#000033] text-[#000033]">
                  View All Battles
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Global Paper Decoration */}
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Trophy size={120} />
          </div>
        </div>
      </PaperWrapper>
      <BottomNav />
    </div>
  );
}
