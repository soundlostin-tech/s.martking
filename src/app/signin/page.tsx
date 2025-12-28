"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Signin() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();

  const validate = () => {
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
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

      if (error) {
        toast.error(error.message || "An error occurred during signin");
        return;
      }

      toast.success("Welcome back to Smartking's Arena!");
      router.push("/");
      router.refresh();
    } catch (error: any) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

    return (
      <main className="min-h-screen bg-background text-onyx overflow-x-hidden" suppressHydrationWarning={true}>
        {/* Sticker Header */}
        <section className="sticker-header pt-20" suppressHydrationWarning={true}>
          <div className="sticker-blob bg-pastel-coral" suppressHydrationWarning={true} />
          <Link href="/onboarding" className="inline-flex items-center gap-2 text-[10px] font-bold text-charcoal/30 uppercase tracking-widest mb-6">
            <ChevronLeft size={14} strokeWidth={3} /> Back
          </Link>
          <h1 className="text-[40px] font-black leading-none mb-2">Welcome Back</h1>
          <p className="text-[14px] font-bold text-charcoal/40 uppercase tracking-tighter">Sign in to Smartking's Arena</p>
        </section>
  
        <div className="px-8 pb-20 max-w-md mx-auto" suppressHydrationWarning={true}>
          <form onSubmit={handleSignin} className="space-y-6" suppressHydrationWarning={true}>
            <div className="space-y-5" suppressHydrationWarning={true}>
              <div className="space-y-2" suppressHydrationWarning={true}>
                <Label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Email or Phone</Label>
                <Input 
                  type="email"
                  placeholder="warrior@arena.com"
                  className="h-14 rounded-[20px] bg-white border border-black/5 text-onyx font-bold px-6 focus-visible:ring-onyx shadow-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div className="space-y-2" suppressHydrationWarning={true}>
                <div className="flex justify-between items-center ml-1" suppressHydrationWarning={true}>
                  <Label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">Password</Label>
                  <Link href="#" className="text-[10px] font-bold text-onyx underline uppercase tracking-widest">Forgot?</Link>
                </div>
                <div className="relative" suppressHydrationWarning={true}>
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-14 rounded-[20px] bg-white border border-black/5 text-onyx font-bold px-6 pr-14 focus-visible:ring-onyx shadow-sm"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-onyx transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
  
            <div className="pt-4 space-y-6" suppressHydrationWarning={true}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-lime-yellow text-onyx rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-lime-yellow/20 flex items-center justify-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
              </motion.button>
  
              <div className="relative flex items-center justify-center py-4" suppressHydrationWarning={true}>
                <div className="absolute inset-0 flex items-center" suppressHydrationWarning={true}><span className="w-full border-t border-black/5"></span></div>
                <span className="relative bg-background px-4 text-[10px] font-bold text-charcoal/20 uppercase tracking-widest">or continue with</span>
              </div>
  
              <div className="grid grid-cols-2 gap-4" suppressHydrationWarning={true}>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="h-14 rounded-[20px] border border-black/5 bg-white flex items-center justify-center gap-3 shadow-sm"
                >
                  <div className="w-5 h-5 bg-onyx/5 rounded-md" suppressHydrationWarning={true} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Google</span>
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="h-14 rounded-[20px] border border-black/5 bg-white flex items-center justify-center gap-3 shadow-sm"
                >
                  <div className="w-5 h-5 bg-onyx/5 rounded-md" suppressHydrationWarning={true} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Phone</span>
                </motion.button>
              </div>
  
              <p className="text-center text-[11px] font-bold text-charcoal/40 uppercase tracking-widest">
                Don't have an account? <Link href="/signup" className="text-onyx underline">Sign up</Link>
              </p>
            </div>
          </form>
        </div>
      </main>
  );
}
