"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BentoCard } from "@/components/ui/BentoCard";

export default function Signin() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  const validate = () => {
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Valid comm link required");
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error("Access key must be 6+ characters");
      return false;
    }
    return true;
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast.success("Identity verified. Welcome back to the Arena.");
      router.push("/");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Authorization failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-5 selection:bg-[#5FD3BC]/30">
      <div className="w-full max-w-md space-y-8">
        <section className="text-center">
          <div className="w-20 h-20 bg-[#DCD3FF] rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl rotate-[-6deg] group hover:rotate-0 transition-transform">
            <LogIn size={40} className="text-[#1A1A1A]" strokeWidth={2.5} />
          </div>
          <h1 className="text-[44px] font-heading text-[#1A1A1A] leading-[0.9] font-black tracking-tighter">
            AUTHORIZE
          </h1>
          <p className="text-[11px] font-black text-[#6B7280] uppercase tracking-[0.2em] mt-3">
            Re-establish secure connection
          </p>
        </section>

        <BentoCard className="p-8 shadow-2xl rounded-[40px] border-none bg-white relative overflow-hidden group">
          <form onSubmit={handleSignin} className="space-y-6 relative z-10">
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest ml-1">COMM LINK (EMAIL)</Label>
              <Input 
                ref={emailInputRef}
                type="email"
                placeholder="intel@arena.com"
                className="h-16 rounded-[20px] border-4 border-[#F5F5F5] bg-white text-base font-black px-6 focus:border-[#5FD3BC] focus:ring-0 transition-all placeholder:text-[#9CA3AF]"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <Label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">ACCESS KEY (PASSWORD)</Label>
                <Link href="#" className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-widest hover:text-[#1A1A1A] transition-colors">
                  Lost Key?
                </Link>
              </div>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Secret Code"
                  className="h-16 rounded-[20px] border-4 border-[#F5F5F5] bg-white text-base font-black px-6 pr-14 focus:border-[#5FD3BC] focus:ring-0 transition-all placeholder:text-[#9CA3AF]"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors"
                >
                  {showPassword ? <EyeOff size={24} strokeWidth={2.5} /> : <Eye size={24} strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-[#1A1A1A] text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl flex items-center justify-center relative overflow-hidden disabled:bg-[#E5E7EB] transition-all hover:bg-black"
            >
              {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : "VERIFY IDENTITY"}
            </motion.button>

            <div className="pt-4 text-center">
              <p className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest">
                NEW OPERATIVE?{" "}
                <Link href="/signup" className="text-[#1A1A1A] underline decoration-[#5FD3BC] decoration-4 underline-offset-4 hover:decoration-[#FEF3C7] transition-all">
                  ENLIST TODAY
                </Link>
              </p>
            </div>
          </form>
          
          <div className="absolute right-[-40px] bottom-[-40px] opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
            <Zap size={240} />
          </div>
        </BentoCard>
      </div>
    </main>
  );
}
