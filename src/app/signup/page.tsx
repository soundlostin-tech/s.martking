"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Loader2, Eye, EyeOff, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BentoCard } from "@/components/ui/BentoCard";

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    ff_uid: "",
    email: "",
    phone: "",
    password: "",
    terms: false,
  });
  const router = useRouter();

  const validate = () => {
    if (!formData.fullname.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!formData.ff_uid.trim()) {
      toast.error("Free Fire UID is required");
      return false;
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (!formData.terms) {
      toast.error("Please accept the terms");
      return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullname,
            ff_uid: formData.ff_uid,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          full_name: formData.fullname,
          ff_uid: formData.ff_uid,
          phone: formData.phone,
          username: formData.fullname.toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 1000),
          role: "Player",
          status: "Active",
          win_rate: 0,
          matches_played: 0,
        });
        
        if (profileError) console.error("Profile creation error:", profileError);

        const { error: walletError } = await supabase.from("wallets").insert({
          user_id: authData.user.id,
          balance: 0,
          lifetime_earnings: 0,
          pending_withdrawals: 0,
        });
        
        if (walletError) console.error("Wallet creation error:", walletError);

        toast.success("Account created! Welcome to Smartking's Arena.");
        router.push("/signin");
      }
    } catch (error: any) {
      toast.error(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-onyx overflow-x-hidden" suppressHydrationWarning>
      {/* Sticker Header */}
      <section className="sticker-header pt-20">
        <div className="sticker-blob bg-pastel-mint" />
        <Link href="/signin" className="inline-flex items-center gap-2 text-[10px] font-bold text-charcoal/30 uppercase tracking-widest mb-6">
          <ChevronLeft size={14} strokeWidth={3} /> Back
        </Link>
        <h1 className="text-[40px] font-black leading-none mb-2">Join the Arena</h1>
        <p className="text-[14px] font-bold text-charcoal/40 uppercase tracking-tighter">Create your warrior profile</p>
      </section>

      <div className="px-8 pb-20 max-w-md mx-auto" suppressHydrationWarning>
        <form onSubmit={handleSignup} className="space-y-6" suppressHydrationWarning>
          <div className="space-y-5" suppressHydrationWarning>
            <div className="space-y-2" suppressHydrationWarning>
              <Label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Username / Name</Label>
              <Input 
                placeholder="Elite_Warrior"
                className="h-14 rounded-[20px] bg-white border border-black/5 text-onyx font-bold px-6 focus-visible:ring-onyx shadow-sm"
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              />
            </div>

            <div className="space-y-2" suppressHydrationWarning>
              <Label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Free Fire UID</Label>
              <Input 
                placeholder="1234567890"
                className="h-14 rounded-[20px] bg-white border border-black/5 text-onyx font-bold px-6 focus-visible:ring-onyx shadow-sm"
                value={formData.ff_uid}
                onChange={(e) => setFormData({ ...formData, ff_uid: e.target.value })}
              />
              <p className="text-[9px] font-bold text-charcoal/30 uppercase tracking-widest ml-1">Find this in your FF profile</p>
            </div>

            <div className="space-y-2" suppressHydrationWarning>
              <Label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Email</Label>
              <Input 
                type="email"
                placeholder="warrior@arena.com"
                className="h-14 rounded-[20px] bg-white border border-black/5 text-onyx font-bold px-6 focus-visible:ring-onyx shadow-sm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div className="space-y-2" suppressHydrationWarning>
              <Label className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest ml-1">Password</Label>
              <div className="relative" suppressHydrationWarning>
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

          <BentoCard className="p-4 flex items-start gap-4 border border-black/5 shadow-sm">
            <Checkbox 
              id="terms" 
              className="mt-1 w-5 h-5 rounded-md border-silver data-[state=checked]:bg-onyx data-[state=checked]:border-onyx" 
              checked={formData.terms}
              onCheckedChange={(checked) => setFormData({ ...formData, terms: checked as boolean })}
            />
            <label htmlFor="terms" className="text-[10px] font-bold text-charcoal/60 leading-tight uppercase tracking-widest cursor-pointer">
              I agree to the <span className="text-onyx underline">Terms of Service</span> and <span className="text-onyx underline">Privacy Policy</span>
            </label>
          </BentoCard>

          <div className="pt-4" suppressHydrationWarning>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-onyx text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-onyx/20 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </motion.button>

            <p className="text-center mt-8 text-[11px] font-bold text-charcoal/40 uppercase tracking-widest">
              Already have an account? <Link href="/signin" className="text-onyx underline">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
